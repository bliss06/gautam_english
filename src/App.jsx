import { useState, useEffect } from 'react';
import lessonsData from './data/lessons.json';
import LessonRunner from './components/LessonRunner';

const STORAGE_KEY = 'gautam-english-progress';

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}
function saveProgress(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export default function App() {
  const [screen, setScreen] = useState('home'); // 'home' | 'unit' | 'lesson'
  const [activeUnit, setActiveUnit] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [progress, setProgress] = useState(loadProgress);
  const [totalXP, setTotalXP] = useState(() => loadProgress().totalXP || 0);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const handleComplete = (xp) => {
    const key = activeLesson.id;
    const newProgress = { ...progress, [key]: true, totalXP: (progress.totalXP || 0) + xp };
    setProgress(newProgress);
    setTotalXP(newProgress.totalXP);
    saveProgress(newProgress);
    setScreen('unit');
  };

  // HOME SCREEN
  if (screen === 'home') return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-500 to-indigo-700 flex flex-col items-center pt-16 pb-8 px-6">
      <div className="text-7xl mb-4">🦉</div>
      <h1 className="text-4xl font-black text-white text-center">English with Gautam!</h1>
      <p className="text-indigo-200 mt-2 text-center">Let's learn and have fun!</p>
      <div className="bg-white/20 rounded-2xl px-5 py-2 mt-4">
        <span className="text-white font-black text-lg">⭐ {totalXP} XP</span>
      </div>

      <div className="mt-8 flex flex-col gap-4 w-full max-w-sm">
        {lessonsData.map(unit => (
          <button key={unit.id} onClick={() => { setActiveUnit(unit); setScreen('unit'); }}
            className="btn-bounce bg-white rounded-2xl p-4 flex items-center gap-4 shadow-lg">
            <span className="text-4xl">{unit.emoji}</span>
            <div className="text-left flex-1">
              <p className="font-black text-gray-800 text-lg">{unit.title}</p>
              <p className="text-gray-500 text-sm">{unit.lessons.length} lessons</p>
            </div>
            <div className="text-2xl">›</div>
          </button>
        ))}
      </div>
    </div>
  );

  // UNIT SCREEN
  if (screen === 'unit' && activeUnit) return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-500 to-indigo-700 flex flex-col pt-12 pb-8 px-6">
      <button onClick={() => setScreen('home')} className="text-white text-lg font-bold mb-4 self-start">← Back</button>
      <div className="text-center mb-6">
        <div className="text-6xl">{activeUnit.emoji}</div>
        <h2 className="text-3xl font-black text-white mt-2">{activeUnit.title}</h2>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
        {activeUnit.lessons.map((lesson, i) => {
          const done = progress[lesson.id];
          return (
            <button key={lesson.id} onClick={() => { setActiveLesson(lesson); setScreen('lesson'); }}
              className={`btn-bounce rounded-2xl p-4 flex items-center gap-4 shadow-lg
                ${done ? 'bg-green-50 border-2 border-green-300' : 'bg-white'}`}>
              <span className="text-3xl">{done ? '✅' : `${i + 1}️⃣`}</span>
              <div className="text-left flex-1">
                <p className="font-black text-gray-800">{lesson.title}</p>
                <p className="text-gray-500 text-sm">{lesson.questions.length} questions</p>
              </div>
              {done && <span className="text-green-500 font-bold">Done!</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  // LESSON SCREEN
  if (screen === 'lesson' && activeLesson) return (
    <div className="min-h-screen bg-white flex flex-col" style={{ maxWidth: 480, margin: '0 auto' }}>
      <LessonRunner
        lesson={activeLesson}
        onComplete={handleComplete}
        onExit={() => setScreen('unit')}
      />
    </div>
  );

  return null;
}
