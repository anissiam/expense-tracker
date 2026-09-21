import { useState, useRef, useCallback, useEffect } from 'react';

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
export function useSpeechRecognition(): SpeechRecognitionResult {
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
      setError('Speech recognition is not supported in this browser (use Chrome or Edge). Type your expense instead — it uses the same parser.');
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setError('You appear to be offline. Voice needs internet (audio is transcribed in the cloud). Type your expense instead.');
      return;
    }
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      const origin = window.location?.origin || 'this page';
      setError(
        `Voice is blocked on insecure origin (${origin}). Open the app at http://localhost:3000 or http://127.0.0.1:3000 — plain HTTP on LAN IPs/hostnames is blocked by the browser — or type your expense instead.`
      );
      return;
    }
    try {
      const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Ctor) return;
      // Fresh instance per session avoids stale onresult closures.
      const recognition = new Ctor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

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
          setError(
            'Microphone access was denied. Allow the mic in the browser site settings, or just type your expense below — typed text uses the same parser.'
          );
        } else if (kind === 'no-speech') {
          setError('No speech detected. Try again or type your expense.');
        } else if (kind === 'audio-capture') {
          setError('No microphone found. Connect/enable a mic, or type your expense instead.');
        } else if (kind === 'network') {
          const hints: string[] = [];
          if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            hints.push('you appear to be offline');
          }
          if (typeof window !== 'undefined' && window.isSecureContext === false) {
            hints.push('voice needs HTTPS or localhost (plain HTTP on a LAN IP is blocked)');
          }
          const detail = hints.length > 0 ? ` (${hints.join('; ')})` : '';
          setError(
            `Speech service unreachable (network)${detail}. Chrome/Edge stream mic audio to a cloud service, so VPNs, firewalls, or ad-blockers can block it. Tap the mic to retry, or type below — typed text tests the full flow.`
          );
        } else if (kind === 'aborted') {
          setError('Recording was stopped. Tap the mic to try again, or type instead.');
        } else if (kind === 'language-not-supported') {
          setError('This browser language is not supported for speech. Type your expense instead.');
        } else {
          setError(`Speech error (${kind}). Tap the mic to retry, or type instead.`);
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
      setError('Could not start speech recognition. Type your expense instead.');
      setIsListening(false);
    }
  }, [isSupported]);

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
