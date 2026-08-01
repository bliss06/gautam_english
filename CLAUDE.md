# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build locally
- `npm run lint` — ESLint over the whole project (flat config in `eslint.config.js`)

There is no test runner configured. Lint is the only automated check.

## Big picture

A kid-facing English-learning PWA (Duolingo-style) built with React 19 + Vite + Tailwind. Everything is client-side; there is no backend.

### Screen flow — `src/App.jsx`
`App.jsx` is a three-state machine driven by the `screen` state: `'home' | 'unit' | 'lesson'`. It owns navigation (`activeUnit`, `activeLesson`), XP, and progress. It renders home/unit screens inline and delegates the `'lesson'` screen to `LessonRunner`.

### Content is data-driven — `src/data/lessons.json`
The entire curriculum lives in `lessons.json`, shaped as `units[] → lessons[] → questions[]`. Each question has a `type` field that selects which UI component renders it. **Adding curriculum is a JSON edit, not a code change** — as long as the question `type` already has a component.

### The lesson engine — `src/components/LessonRunner.jsx`
This is the core of the app. It:
- Steps through `lesson.questions`, tracks `hearts` (start 3), `xp` (+10 per correct answer), and progress bar.
- Maps `question.type` → question component via a registry object (`pick-picture`, `speak-repeat`, `build-sentence`, `match-pair`, `listen-build`). Unknown types render a visible "Unknown question type" error.
- Ends the lesson when questions run out or hearts hit 0; passing requires `hearts > 0`.

**To add a new question type:** create the component in `src/components/`, register it in the map in `LessonRunner.jsx`, and author questions of that `type` in `lessons.json`. Every question component takes `{ question, onAnswer }` and calls `onAnswer(correct: boolean)`.

### Speech — `src/hooks/useSpeech.js`
Two hooks wrap the browser Web Speech APIs:
- `useTTS()` → `speak(text, rate)` using `window.speechSynthesis`, preferring `Samantha`/`Karen`/local en-US voices.
- `useSpeechRecognition()` → `webkitSpeechRecognition` wrapper exposing `transcript`, `listening`, `error`, `isSupported`, `startListening`, `stopListening`.

**iOS PWA gotcha (do not break):** `startListening` must stay synchronous. Adding `async`/`await` breaks the user-gesture chain that iOS requires for `getUserMedia` in standalone PWA mode. See the comment in the hook.

### Speech scoring — `src/utils/speechScore.js`
`scoreSpeech(expected, spoken)` returns a 0–1 word-overlap score (normalized, order-independent). `getScoreLabel(score)` maps that to a label/color/pass with thresholds 0.85 / 0.65 / 0.4.

## Persistence

Progress is stored in `localStorage` under the key `gautam-english-progress` (see `loadProgress`/`saveProgress` in `App.jsx`), including per-lesson completion and `totalXP`. Note: **Dexie is a dependency but is not currently wired in** — progress is plain localStorage today. If you migrate to Dexie, update `App.jsx` accordingly.

## PWA

A service worker (`/sw.js`) is registered on load in `App.jsx`. Behavior in standalone (installed) mode differs from a normal browser tab — most notably the speech-recognition gesture constraint above.

## conventions

New question components must render inside the 480px lesson frame and call onAnswer(correct) exactly once.

