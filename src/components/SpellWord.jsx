import { useState, useEffect, useRef } from 'react';
import { useTTS } from '../hooks/useSpeech';

function jumble(word) {
  const letters = word.split('');
  let shuffled = [...letters].sort(() => Math.random() - 0.5);
  if (letters.length > 1 && shuffled.join('') === word) {
    shuffled = [...letters].sort(() => Math.random() - 0.5);
  }
  return shuffled;
}

function playSound(audio) {
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

export default function SpellWord({ question, onAnswer }) {
  const { speak } = useTTS();
  const word = question.word;
  const [letters, setLetters] = useState(() => Array(word.length).fill(''));
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintLetters, setHintLetters] = useState(null);
  const inputRefs = useRef([]);
  const answeredRef = useRef(false);
  const boingRef = useRef(null);
  const cheerRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => speak(word, 0.8), 500);
    return () => clearTimeout(t);
  }, [word]);

  useEffect(() => {
    boingRef.current = new Audio('/TOONBoing.wav');
    cheerRef.current = new Audio('/VOXCheer.wav');
  }, []);

  const checkAnswer = (filled) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    const isCorrect = filled.join('').toLowerCase() === word.toLowerCase();
    setCorrect(isCorrect);
    setChecked(true);
    playSound(isCorrect ? cheerRef.current : boingRef.current);
    setTimeout(() => onAnswer(isCorrect), 1300);
  };

  const handleChange = (i, value) => {
    if (checked) return;
    const char = value.slice(-1).replace(/[^a-zA-Z]/g, '');
    const next = [...letters];
    next[i] = char.toUpperCase();
    setLetters(next);

    if (char && i < word.length - 1) {
      inputRefs.current[i + 1]?.focus();
    }

    if (next.every(l => l)) {
      checkAnswer(next);
    }
  };

  const handleKeyDown = (i, e) => {
    if (checked) return;
    if (e.key === 'Backspace' && !letters[i] && i > 0) {
      const next = [...letters];
      next[i - 1] = '';
      setLetters(next);
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handleHint = () => {
    if (!hintLetters) setHintLetters(jumble(word));
    setShowHint(true);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <p className="text-xl font-black text-indigo-900 text-center">👂 Listen and spell the word!</p>

      {/* Replay button */}
      <button onClick={() => speak(word, 0.8)} aria-label="Hear the word again"
        className="btn-bounce flex items-center justify-center bg-blue-100 text-blue-700 rounded-full p-4 text-3xl border-2 border-blue-200">
        🔊
      </button>

      {/* Letter boxes */}
      <div className="flex justify-center gap-2 flex-wrap max-w-sm">
        {letters.map((letter, i) => (
          <input
            key={i}
            ref={el => (inputRefs.current[i] = el)}
            value={letter}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            disabled={checked}
            inputMode="text"
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            maxLength={1}
            className={`w-12 h-14 rounded-xl border-2 text-2xl font-black text-center uppercase transition-colors
              ${checked
                ? correct ? 'border-green-400 bg-green-50 text-green-700' : 'border-red-400 bg-red-50 text-red-700'
                : 'border-gray-300 text-gray-800 focus:border-indigo-500 focus:outline-none'}`}
          />
        ))}
      </div>

      {/* Hint */}
      {!checked && (
        <button onClick={handleHint} className="btn-bounce flex items-center gap-2 bg-yellow-100 text-yellow-700 font-bold px-5 py-2.5 rounded-full text-base border-2 border-yellow-200">
          💡 Hint
        </button>
      )}
      {showHint && hintLetters && (
        <p className="text-indigo-400 text-sm tracking-widest">Hint: {hintLetters.join(' ').toUpperCase()}</p>
      )}

      {/* Correct answer reveal on wrong */}
      {checked && !correct && (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">The correct spelling was:</p>
          <p className="font-black text-gray-700 text-base uppercase">{word}</p>
        </div>
      )}

      {/* Feedback */}
      {checked && (
        <p className={`text-2xl font-black ${correct ? 'text-green-600' : 'text-red-500'}`}>
          {correct ? 'Brilliant! 🌟' : 'Not quite... 😅'}
        </p>
      )}
    </div>
  );
}
