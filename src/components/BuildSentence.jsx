import { useState } from 'react';
import { useTTS } from '../hooks/useSpeech';

export default function BuildSentence({ question, onAnswer }) {
  const { speak } = useTTS();
  const [built, setBuilt] = useState([]);
  const [pool, setPool] = useState([...question.words].sort(() => Math.random() - 0.5));
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);

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
    if (isCorrect) speak(question.answer.join(' '));
    setTimeout(() => onAnswer(isCorrect), 1200);
  };

  const reset = () => {
    setPool([...question.words].sort(() => Math.random() - 0.5));
    setBuilt([]);
    setChecked(false);
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <p className="text-xl font-black text-indigo-900 text-center">{question.prompt}</p>

      {/* Build zone */}
      <div className="min-h-16 w-full max-w-sm bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-2xl p-3 flex flex-wrap gap-2 items-center justify-center">
        {built.length === 0 && <span className="text-indigo-300 text-sm">Tap words below to build</span>}
        {built.map((w, i) => (
          <button key={i} onClick={() => removeWord(i)}
            className="bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-xl text-base">
            {w}
          </button>
        ))}
      </div>

      {/* Word pool */}
      <div className="flex flex-wrap gap-2 justify-center max-w-sm">
        {pool.map((w, i) => (
          <button key={i} onClick={() => addWord(w, i)}
            className="btn-bounce bg-white border-2 border-gray-200 text-gray-800 font-bold px-3 py-2 rounded-xl text-base shadow">
            {w}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {checked && (
        <p className={`text-2xl font-black ${correct ? 'text-green-600' : 'text-red-500'}`}>
          {correct ? 'Perfect! 🌟' : 'Not quite...'}
        </p>
      )}

      <div className="flex gap-3">
        {!checked && built.length > 0 && (
          <button onClick={checkAnswer}
            className="btn-bounce bg-indigo-600 text-white font-black px-8 py-3 rounded-full text-lg shadow-lg">
            Check ✓
          </button>
        )}
        {!checked && (
          <button onClick={reset} className="text-gray-400 text-sm underline self-center">Reset</button>
        )}
      </div>
    </div>
  );
}
