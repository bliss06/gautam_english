import { useState, useEffect, useRef } from 'react';
import { useTTS } from '../hooks/useSpeech';

export default function ListenBuild({ question, onAnswer }) {
  const { speak } = useTTS();
  const [built, setBuilt] = useState([]);
  const [pool, setPool] = useState([]);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const playTimeout = useRef(null);

  // Shuffle pool once on mount
  useEffect(() => {
    const shuffled = [...question.words].sort(() => Math.random() - 0.5);
    setPool(shuffled);
    // Auto-play once after a short delay
    playTimeout.current = setTimeout(() => playAudio(), 600);
    return () => clearTimeout(playTimeout.current);
  }, []);

  const playAudio = () => {
    setPlaying(true);
    setHasListened(true);
    speak(question.answer.join(' '), 0.75);
    // Approximate duration: ~500ms per word
    const duration = question.answer.length * 550 + 400;
    clearTimeout(playTimeout.current);
    playTimeout.current = setTimeout(() => setPlaying(false), duration);
  };

  const addWord = (word, idx) => {
    if (checked) return;
    setBuilt(b => [...b, word]);
    setPool(p => p.filter((_, i) => i !== idx));
  };

  const removeWord = (idx) => {
    if (checked) return;
    setPool(p => [...p, built[idx]]);
    setBuilt(b => b.filter((_, i) => i !== idx));
  };

  const checkAnswer = () => {
    const isCorrect = built.join(' ') === question.answer.join(' ');
    setCorrect(isCorrect);
    setChecked(true);
    if (isCorrect) {
      speak(question.answer.join(' '), 0.85);
      setTimeout(() => onAnswer(true), 1400);
    } else {
      setTimeout(() => onAnswer(false), 1400);
    }
  };

  const reset = () => {
    setPool([...question.words].sort(() => Math.random() - 0.5));
    setBuilt([]);
    setChecked(false);
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">

      {/* Instruction */}
      <p className="text-xl font-black text-indigo-900 text-center">
        🎧 Listen and build the sentence!
      </p>

      {/* Speaker / play button — big, prominent */}
      <button
        onClick={playAudio}
        disabled={playing}
        className={`btn-bounce flex flex-col items-center justify-center gap-2
          w-36 h-36 rounded-full border-4 shadow-lg transition-all
          ${playing
            ? 'bg-indigo-100 border-indigo-300 scale-110 animate-pulse'
            : 'bg-indigo-600 border-indigo-700'}`}>
        <span className="text-5xl">{playing ? '🔊' : '▶️'}</span>
        <span className={`text-sm font-bold ${playing ? 'text-indigo-500' : 'text-white'}`}>
          {playing ? 'Playing...' : hasListened ? 'Play Again' : 'Listen'}
        </span>
      </button>

      {/* Nudge if not yet listened */}
      {!hasListened && (
        <p className="text-indigo-400 text-sm -mt-2">Tap the button to hear the sentence</p>
      )}

      {/* Build zone — where selected words go */}
      <div className={`min-h-16 w-full max-w-sm rounded-2xl p-3 flex flex-wrap gap-2 items-center justify-center border-2 transition-colors
        ${checked
          ? correct ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
          : 'bg-indigo-50 border-dashed border-indigo-300'}`}>
        {built.length === 0 && !checked && (
          <span className="text-indigo-300 text-sm">Tap words below to build</span>
        )}
        {built.map((w, i) => (
          <button
            key={i}
            onClick={() => removeWord(i)}
            disabled={checked}
            className={`font-bold px-3 py-1.5 rounded-xl text-base transition-colors
              ${checked
                ? correct ? 'bg-green-500 text-white' : 'bg-red-400 text-white'
                : 'bg-indigo-600 text-white'}`}>
            {w}
          </button>
        ))}
      </div>

      {/* Word pool */}
      <div className="flex flex-wrap gap-2 justify-center max-w-sm">
        {pool.map((w, i) => (
          <button
            key={i}
            onClick={() => addWord(w, i)}
            disabled={checked}
            className="btn-bounce bg-white border-2 border-gray-200 text-gray-800 font-bold px-3 py-2 rounded-xl text-base shadow">
            {w}
          </button>
        ))}
      </div>

      {/* Correct answer reveal on wrong */}
      {checked && !correct && (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">The correct sentence was:</p>
          <p className="font-black text-gray-700 text-base">{question.answer.join(' ')}</p>
        </div>
      )}

      {/* Feedback */}
      {checked && (
        <p className={`text-2xl font-black ${correct ? 'text-green-600' : 'text-red-500'}`}>
          {correct ? 'Brilliant! 🌟' : 'Not quite... 😅'}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mt-1">
        {!checked && built.length > 0 && (
          <button
            onClick={checkAnswer}
            className="btn-bounce bg-indigo-600 text-white font-black px-8 py-3 rounded-full text-lg shadow-lg">
            Check ✓
          </button>
        )}
        {!checked && built.length > 0 && (
          <button onClick={reset} className="text-gray-400 text-sm underline self-center">
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
