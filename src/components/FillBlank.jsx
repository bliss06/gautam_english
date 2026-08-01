import { useState, useRef } from 'react';
import { useTTS } from '../hooks/useSpeech';

export default function FillBlank({ question, onAnswer }) {
  const { speak } = useTTS();
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const answeredRef = useRef(false);

  // Fall back gracefully if the '___' marker is missing from the sentence.
  const [before, after = ''] = (question.sentence || '').split('___');
  const options = question.options || [];

  const choose = (option) => {
    // Synchronous ref guard: React state (checked / disabled) only updates on
    // the next render, so a fast double-tap could otherwise fire onAnswer twice.
    if (answeredRef.current) return;
    answeredRef.current = true;

    const isCorrect = option === question.answer;
    setSelected(option);
    setCorrect(isCorrect);
    setChecked(true);
    if (isCorrect) speak(`${before}${question.answer}${after}`);
    setTimeout(() => onAnswer(isCorrect), 1200);
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <p className="text-xl font-black text-indigo-900 text-center">{question.prompt}</p>

      {/* Sentence with blank */}
      <p className="text-2xl font-black text-gray-800 text-center leading-relaxed">
        {before}
        <span className={`inline-block min-w-20 border-b-4 px-2 ${
          checked
            ? (correct ? 'border-green-500 text-green-600' : 'border-red-400 text-red-500')
            : 'border-indigo-300 text-indigo-600'
        }`}>
          {selected || ' '}
        </span>
        {after}
      </p>

      {/* Word options */}
      <div className="flex flex-wrap gap-2 justify-center max-w-sm">
        {options.map((opt, i) => (
          <button key={i} onClick={() => choose(opt)} disabled={checked}
            className="btn-bounce bg-white border-2 border-gray-200 text-gray-800 font-bold px-4 py-2 rounded-xl text-base shadow disabled:opacity-50">
            {opt}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {checked && (
        <p className={`text-2xl font-black ${correct ? 'text-green-600' : 'text-red-500'}`}>
          {correct ? 'Perfect! 🌟' : 'Not quite...'}
        </p>
      )}
    </div>
  );
}
