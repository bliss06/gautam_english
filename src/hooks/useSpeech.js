import { useState, useRef, useCallback } from 'react';

// Text-to-Speech
export function useTTS() {
  const speak = useCallback((text, rate = 0.85) => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = rate;
    utter.pitch = 1.1;
    // Prefer a friendly voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Samantha') || v.name.includes('Karen') || (v.lang === 'en-US' && v.localService));
    if (preferred) utter.voice = preferred;
    window.speechSynthesis.speak(utter);
  }, []);

  return { speak };
}

// Speech Recognition
export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const recognizerRef = useRef(null);

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition not supported on this device.');
      return;
    }

    setTranscript('');
    setError(null);

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      const result = e.results[0][0].transcript;
      setTranscript(result);
    };

    rec.onerror = (e) => {
      setError(e.error === 'not-allowed' ? 'Microphone permission denied.' : 'Could not hear clearly. Try again.');
      setListening(false);
    };

    rec.onend = () => setListening(false);

    rec.start();
    recognizerRef.current = rec;
    setListening(true);
  }, [isSupported]);

  const stopListening = useCallback(() => {
    recognizerRef.current?.stop();
    setListening(false);
  }, []);

  return { transcript, listening, error, isSupported, startListening, stopListening };
}
