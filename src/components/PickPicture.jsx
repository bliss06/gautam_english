import { useState } from 'react';
import { useTTS } from '../hooks/useSpeech';

export default function PickPicture({ question, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const { speak } = useTTS();

  const handleSelect = (opt) => {
    if (selected) return;
    setSelected(opt);
    speak(opt.label);
    setTimeout(() => onAnswer(opt.correct), 900);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center">
        <p className="text-2xl font-black text-indigo-900">{question.prompt}</p>
        <button onClick={() => speak(question.word)} className="mt-2 text-indigo-400 text-sm underline">
          🔊 Hear the word
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {question.options.map((opt, i) => {
          let border = 'border-gray-200 bg-white';
          if (selected === opt) border = opt.correct ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50';
          return (
            <button key={i} onClick={() => handleSelect(opt)}
              className={`btn-bounce flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-4 ${border} shadow text-center`}>
              <span className="text-5xl">{opt.emoji}</span>
              <span className="text-base font-bold text-gray-700">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
