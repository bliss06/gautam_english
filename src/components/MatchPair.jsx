import { useState } from 'react';
import { useTTS } from '../hooks/useSpeech';

export default function MatchPair({ question, onAnswer }) {
  const { speak } = useTTS();
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [matched, setMatched] = useState({});
  const [wrong, setWrong] = useState(null);

  const emojis = question.pairs.map(p => p.emoji);
  const words = [...question.pairs.map(p => p.word)].sort(() => Math.random() - 0.5);
  const correctMap = Object.fromEntries(question.pairs.map(p => [p.emoji, p.word]));

  const selectEmoji = (e) => {
    if (matched[e]) return;
    setSelectedEmoji(e);
    speak(correctMap[e]);
  };

  const selectWord = (w) => {
    if (!selectedEmoji) return;
    if (correctMap[selectedEmoji] === w) {
      const newMatched = { ...matched, [selectedEmoji]: w };
      setMatched(newMatched);
      setSelectedEmoji(null);
      if (Object.keys(newMatched).length === question.pairs.length) {
        setTimeout(() => onAnswer(true), 700);
      }
    } else {
      setWrong(w);
      setTimeout(() => { setWrong(null); setSelectedEmoji(null); }, 800);
    }
  };

  const matchedWords = Object.values(matched);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <p className="text-xl font-black text-indigo-900 text-center">{question.prompt}</p>
      <div className="flex gap-8 w-full max-w-sm justify-center">
        {/* Emojis column */}
        <div className="flex flex-col gap-3">
          {emojis.map((e, i) => (
            <button key={i} onClick={() => selectEmoji(e)}
              className={`text-5xl p-3 rounded-2xl border-4 transition-all
                ${matched[e] ? 'border-green-400 bg-green-50 opacity-50' :
                  selectedEmoji === e ? 'border-indigo-500 bg-indigo-50 scale-110' :
                  'border-gray-200 bg-white'}`}>
              {e}
            </button>
          ))}
        </div>

        {/* Words column */}
        <div className="flex flex-col gap-3 justify-center">
          {words.map((w, i) => (
            <button key={i} onClick={() => selectWord(w)}
              disabled={matchedWords.includes(w)}
              className={`font-bold text-lg px-4 py-2 rounded-xl border-4 transition-all
                ${matchedWords.includes(w) ? 'border-green-400 bg-green-50 text-green-700 opacity-60' :
                  wrong === w ? 'border-red-400 bg-red-50 text-red-700' :
                  'border-gray-200 bg-white text-gray-800'}`}>
              {w}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
