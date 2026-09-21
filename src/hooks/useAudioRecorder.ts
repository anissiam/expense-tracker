import { useState, useRef, useCallback, useEffect } from 'react';
import { translations, Language } from '../locales';

interface AudioRecorderResult {
  isRecording: boolean;
  recordingSeconds: number;
  error: string | null;
  isSupported: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  clearError: () => void;
}

const MAX_SECONDS = 120;

/**
 * Phase 2 fallback: local mic recording via MediaRecorder.
 * Audio never goes to the browser's cloud speech service — the blob is
 * uploaded to our own /api/ai/transcribe endpoint instead.
 */
export function useAudioRecorder(lang: Language = 'en'): AudioRecorderResult {
  const tr = translations[lang] || translations.en;
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const stopResolveRef = useRef<((blob: Blob | null) => void) | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  const teardown = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {
      /* ignore */
    }
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    if (!isSupported) {
      setError(tr.voiceAudioNotSupported);
      return;
    }
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      const origin = window.location?.origin || 'this page';
      setError(tr.voiceInsecureOriginAudio.replace('{origin}', origin));
      return;
    }
    if (recorderRef.current) return; // already recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || 'audio/webm';
        const blob = chunksRef.current.length > 0 ? new Blob(chunksRef.current, { type }) : null;
        teardown();
        setIsRecording(false);
        stopResolveRef.current?.(blob);
        stopResolveRef.current = null;
      };
      recorder.onerror = () => {
        setError(tr.voiceRecordingFailed);
        teardown();
        setIsRecording(false);
        stopResolveRef.current?.(null);
        stopResolveRef.current = null;
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) {
            // Auto-stop at the cap; onstop resolves the pending promise.
            try {
              recorderRef.current?.stop();
            } catch {
              /* ignore */
            }
            return s;
          }
          return s + 1;
        });
      }, 1000);
    } catch (err: any) {
      const name = err?.name || '';
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setError(tr.voiceMicDeniedAudio);
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setError(tr.voiceNoMicAudio);
      } else {
        setError(tr.voiceCantStartRecording);
      }
      teardown();
      setIsRecording(false);
    }
  }, [isSupported, teardown, tr]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        teardown();
        setIsRecording(false);
        resolve(
          chunksRef.current.length > 0
            ? new Blob(chunksRef.current, { type: 'audio/webm' })
            : null
        );
        return;
      }
      stopResolveRef.current = resolve;
      try {
        recorder.stop();
      } catch {
        teardown();
        setIsRecording(false);
        resolve(null);
      }
    });
  }, [teardown]);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    return () => {
      try {
        recorderRef.current?.stop();
      } catch {
        /* ignore */
      }
      teardown();
    };
  }, [teardown]);

  return { isRecording, recordingSeconds, error, isSupported, startRecording, stopRecording, clearError };
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error(translations.en.voiceReadRecordingFailed));
    reader.readAsDataURL(blob);
  });
}
