import { useState, useEffect, useRef } from 'react';
import { useTTS, useSpeechRecognition } from '../hooks/useSpeech';
import { scoreSpeech, getScoreLabel } from '../utils/speechScore';

export default function SpeakRepeat({ question, onAnswer }) {
  const { speak } = useTTS();
  const { transcript, listening, error, isSupported, startListening, stopListening } = useSpeechRecognition();
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const answeredRef = useRef(false);

  // Advance exactly once, whether the pass came from recognition or a
  // self-report tap (guards against a double-fire race like FillBlank had).
  const finish = (pass) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    setTimeout(() => onAnswer(pass), 1400);
  };

  useEffect(() => {
    // Auto-play the word when question loads
    const t = setTimeout(() => speak(question.word, 0.8), 500);
    return () => clearTimeout(t);
  }, [question.word]);

  useEffect(() => {
    if (transcript && !listening) {
      const score = scoreSpeech(question.word, transcript);
      const label = getScoreLabel(score);
      setResult({ transcript, score, label });

      if (label.pass || attempts >= 2) {
        finish(true);
      } else {
        setAttempts(a => a + 1);
        setTimeout(() => setResult(null), 1800);
      }
    }
  }, [transcript, listening]);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <p className="text-xl font-black text-indigo-900 text-center">{question.prompt}</p>

      {/* The phrase to say */}
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 text-center w-full max-w-sm">
        <p className="text-3xl font-black text-indigo-800">"{question.word}"</p>
        <p className="text-sm text-indigo-400 mt-1">{question.hint}</p>
      </div>

      {/* Listen button */}
      <button onClick={() => speak(question.word, 0.8)}
        className="btn-bounce flex items-center gap-2 bg-blue-100 text-blue-700 font-bold px-5 py-3 rounded-full text-lg border-2 border-blue-200">
        🔊 Listen
      </button>

      {/* Mic button (only when the browser can actually listen) */}
      {isSupported && (
        <button
          onClick={listening ? stopListening : startListening}
          className={`btn-bounce flex items-center gap-2 font-bold px-8 py-4 rounded-full text-xl border-4 shadow-lg transition-all
            ${listening
              ? 'bg-red-500 text-white border-red-600 scale-105 animate-pulse'
              : 'bg-green-500 text-white border-green-600'}`}>
          {listening ? '⏹ Stop' : '🎙️ Speak'}
        </button>
      )}

      {/* Result feedback */}
      {result && (
        <div className="text-center animate-bounce">
          <p className={`text-2xl font-black ${result.label.color}`}>{result.label.label}</p>
          {result.transcript && (
            <p className="text-gray-500 text-sm mt-1">You said: "{result.transcript}"</p>
          )}
        </div>
      )}

      {error && <p className="text-orange-500 text-sm text-center max-w-xs">{error}</p>}

      {/* Fallback: iOS Safari has no reliable speech recognition, so never trap
          the learner — let them say it out loud and self-report to continue. */}
      {(!isSupported || error) && !result && (
        <div className="flex flex-col items-center gap-2">
          {!isSupported && (
            <p className="text-gray-500 text-sm text-center max-w-xs">
              Speech check isn't available on this device. Say it out loud, then tap below.
            </p>
          )}
          <button onClick={() => finish(true)}
            className="btn-bounce flex items-center gap-2 bg-green-500 text-white font-bold px-8 py-4 rounded-full text-xl border-4 border-green-600 shadow-lg">
            🎤 I said it!
          </button>
        </div>
      )}

      {isSupported && attempts >= 2 && !result && (
        <button onClick={() => finish(true)}
          className="text-gray-400 text-sm underline mt-2">
          Skip this one
        </button>
      )}
    </div>
  );
}
