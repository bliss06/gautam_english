import { useState } from 'react';
import PickPicture from './PickPicture';
import SpeakRepeat from './SpeakRepeat';
import BuildSentence from './BuildSentence';
import MatchPair from './MatchPair';

const HEARTS = 3;

export default function LessonRunner({ lesson, onComplete, onExit }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [hearts, setHearts] = useState(HEARTS);
  const [xp, setXp] = useState(0);
  const [done, setDone] = useState(false);

  const question = lesson.questions[questionIndex];
  const progress = (questionIndex / lesson.questions.length) * 100;

  const handleAnswer = (correct) => {
    if (correct) {
      setXp(x => x + 10);
    } else {
      setHearts(h => Math.max(0, h - 1));
    }

    const next = questionIndex + 1;
    if (next >= lesson.questions.length || hearts <= 1 && !correct) {
      setTimeout(() => setDone(true), 400);
    } else {
      setQuestionIndex(next);
    }
  };

  if (done) {
    const passed = hearts > 0;
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-6">
        <div className="text-7xl">{passed ? '🌟' : '😢'}</div>
        <p className="text-3xl font-black text-indigo-900">{passed ? 'Lesson Complete!' : 'Oh no! Try again!'}</p>
        {passed && <p className="text-xl font-bold text-yellow-600">+{xp} XP earned!</p>}
        <div className="flex gap-3 mt-4">
          <button onClick={() => onComplete(xp)} className="btn-bounce bg-indigo-600 text-white font-black px-8 py-3 rounded-full text-lg shadow-lg">
            {passed ? 'Continue 🎉' : 'Try Again'}
          </button>
          <button onClick={onExit} className="text-gray-400 text-sm underline self-center">Back</button>
        </div>
      </div>
    );
  }

  const QuestionComponent = {
    'pick-picture': PickPicture,
    'speak-repeat': SpeakRepeat,
    'build-sentence': BuildSentence,
    'match-pair': MatchPair,
  }[question.type];

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <button onClick={onExit} className="text-gray-400 text-xl font-bold">✕</button>
        <div className="flex-1 bg-gray-200 rounded-full h-3">
          <div className="bg-indigo-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
        <div className="flex gap-1">
          {Array.from({ length: HEARTS }).map((_, i) => (
            <span key={i} className="text-xl">{i < hearts ? '❤️' : '🖤'}</span>
          ))}
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex items-center justify-center p-6">
        {QuestionComponent ? (
          <QuestionComponent question={question} onAnswer={handleAnswer} />
        ) : (
          <p className="text-red-500">Unknown question type: {question.type}</p>
        )}
      </div>
    </div>
  );
}
