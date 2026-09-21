import { useState, useRef, useCallback, useEffect } from 'react';
import { translations, Language } from '../locales';

interface SpeechRecognitionResult {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  setTranscript: (t: string) => void;
}

// Minimal typing for the Web Speech API (Chrome/Edge/Safari prefixed).
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

/**
 * Phase 2: Web Speech API hook with graceful fallback.
 * Mic-less / headless environments can type directly into the transcript box.
 */
export function useSpeechRecognition(lang: Language = 'en'): SpeechRecognitionResult {
  const tr = translations[lang] || translations.en;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscriptState] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    if (!isSupported) {
      setError(tr.voiceSpeechNotSupported);
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setError(tr.voiceOffline);
      return;
    }
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      const origin = window.location?.origin || 'this page';
      setError(tr.voiceInsecureOriginSpeech.replace('{origin}', origin));
      return;
    }
    try {
      const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Ctor) return;
      // Fresh instance per session avoids stale onresult closures.
      const recognition = new Ctor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang === 'ar' ? 'ar-SA' : 'en-US';

      recognition.onresult = (event: any) => {
        let combined = '';
        for (let i = 0; i < event.results.length; i++) {
          combined += event.results[i][0].transcript;
          if (i < event.results.length - 1) combined += ' ';
        }
        setTranscriptState(combined.trim());
      };
      recognition.onerror = (event: any) => {
        const kind = event?.error || 'unknown';
        if (kind === 'not-allowed' || kind === 'service-not-allowed') {
          setError(tr.voiceMicDeniedSpeech);
        } else if (kind === 'no-speech') {
          setError(tr.voiceNoSpeech);
        } else if (kind === 'audio-capture') {
          setError(tr.voiceNoMicSpeech);
        } else if (kind === 'network') {
          const hints: string[] = [];
          if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            hints.push(tr.voiceNetworkHintOffline);
          }
          if (typeof window !== 'undefined' && window.isSecureContext === false) {
            hints.push(tr.voiceNetworkHintHttps);
          }
          const detail = hints.length > 0 ? ` (${hints.join('; ')})` : '';
          setError(tr.voiceNetworkUnreachable.replace('{detail}', detail));
        } else if (kind === 'aborted') {
          setError(tr.voiceAborted);
        } else if (kind === 'language-not-supported') {
          setError(tr.voiceLangNotSupported);
        } else {
          setError(tr.voiceGenericError.replace('{kind}', String(kind)));
        }
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch {
      setError(tr.voiceCantStartSpeech);
      setIsListening(false);
    }
  }, [isSupported, lang, tr]);

  const resetTranscript = useCallback(() => {
    setTranscriptState('');
    setError(null);
  }, []);

  const setTranscript = useCallback((t: string) => {
    setTranscriptState(t);
  }, []);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  };
}
