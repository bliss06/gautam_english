# English with Gautam 🦉

A kid-facing, Duolingo-style English-learning PWA for a 2nd-grade level. React 19 + Vite + Tailwind, fully client-side (no backend). Content lives entirely in [`src/data/lessons.json`](src/data/lessons.json) — adding or editing lessons is a JSON edit, not a code change.

## Commands

```bash
npm run dev      # start dev server with HMR
npm run build    # production build to dist/
npm run preview  # serve the production build locally
npm run lint      # ESLint over the whole project
```

## Features

- **Units** (home screen tiles, top to bottom): **Spelling 🔤**, Animals 🐾, Colors 🎨. Each unit has one or more lessons; each lesson is a list of questions.
- **Hearts & XP**: every lesson starts with 3 hearts. A wrong answer costs a heart; the lesson ends early if hearts hit 0. A correct answer earns +10 XP. XP and per-lesson completion persist in `localStorage` (`gautam-english-progress`).
- **Question types** (rendered by `src/components/LessonRunner.jsx`'s type registry):
  - `pick-picture` — tap the correct picture for a word
  - `speak-repeat` — listen to a phrase, then say it out loud (speech recognition, with a self-report fallback on browsers without mic support)
  - `build-sentence` — tap words in order to build a sentence
  - `match-pair` — match emoji to their words
  - `listen-build` — listen to a sentence, then build it from a word pool
  - `fill-blank` — pick the missing word in a sentence
  - `spell-word` — **(Spelling unit)** hear a word, type it into per-letter boxes, with a replay button and a "jumbled letters" hint
- **Spelling section** specifics (`src/components/SpellWord.jsx`):
  - Auto-speaks the word when the question loads; 🔊 button replays it any number of times.
  - 💡 Hint button reveals the word's letters in scrambled order (computed at runtime, not stored in the JSON).
  - Correct answer → plays `/public/VOXCheer.wav`. Wrong answer → plays `/public/TOONBoing.wav`, reveals the correct spelling, and costs a heart.
  - Two lessons to start: **Simple** (3-letter words) and **Intermediate** (4–5 letter words), 10 words each, 2nd-grade appropriate.

## Adding or editing lessons in `lessons.json`

The file is one big array of **units**. Each unit has **lessons**, each lesson has **questions**. Tile counts, progress bars, etc. are all computed from array lengths — nothing needs to change in code when you add content.

```json
[
  {
    "id": "unit-spelling",
    "title": "Spelling 🔤",
    "emoji": "🔤",
    "color": "#8b5cf6",
    "lessons": [
      {
        "id": "spell-simple",
        "title": "Simple",
        "questions": [
          { "type": "spell-word", "word": "cat" }
        ]
      }
    ]
  }
]
```

Rules that matter:
- `unit.id` and `lesson.id` must be **unique across the whole file** — `lesson.id` is the localStorage progress key.
- Units render in array order (so Spelling being first in the file is why it's the top tile).

### Add a word to an existing Spelling lesson

Just add another object to the `questions` array — that's the whole change:

```json
{ "type": "spell-word", "word": "bird" }
```

No `prompt` or `hint` field needed for `spell-word` — the instruction text is fixed in the component, and the hint jumble is generated from `word` automatically.

### Add a brand-new lesson to an existing unit

Append a lesson object to that unit's `lessons` array, with a fresh unique `id`:

```json
{
  "id": "spell-advanced",
  "title": "Advanced",
  "questions": [
    { "type": "spell-word", "word": "elephant" },
    { "type": "spell-word", "word": "birthday" }
  ]
}
```

It'll immediately show up as a 3rd tile under "Spelling" with no other changes.

### Add a brand-new unit (top-level tile)

Add a new object to the top-level array, anywhere you want it to appear (position = render order):

```json
{
  "id": "unit-numbers",
  "title": "Numbers 🔢",
  "emoji": "🔢",
  "color": "#10b981",
  "lessons": [
    {
      "id": "num-1",
      "title": "Counting 1-10",
      "questions": [
        {
          "type": "pick-picture",
          "prompt": "Which shows THREE?",
          "word": "three",
          "options": [
            { "emoji": "3️⃣", "label": "three", "correct": true },
            { "emoji": "5️⃣", "label": "five", "correct": false }
          ]
        }
      ]
    }
  ]
}
```

### Question type field reference (with examples)

```json
{ "type": "spell-word", "word": "cat" }
```

```json
{
  "type": "pick-picture",
  "prompt": "Which one is a CAT?",
  "word": "cat",
  "options": [
    { "emoji": "🐱", "label": "cat", "correct": true },
    { "emoji": "🐶", "label": "dog", "correct": false }
  ]
}
```

```json
{
  "type": "speak-repeat",
  "prompt": "Say this out loud!",
  "word": "The dog is big",
  "hint": "Listen first, then speak"
}
```

```json
{
  "type": "match-pair",
  "prompt": "Match the animal to its name",
  "pairs": [
    { "emoji": "🐱", "word": "cat" },
    { "emoji": "🐶", "word": "dog" }
  ]
}
```

```json
{
  "type": "listen-build",
  "words": ["is", "The", "on", "mat", "cat", "the"],
  "answer": ["The", "cat", "is", "on", "the", "mat"]
}
```

```json
{
  "type": "build-sentence",
  "prompt": "Build the sentence: The apple is red",
  "words": ["apple", "The", "green", "is", "red"],
  "answer": ["The", "apple", "is", "red"]
}
```

```json
{
  "type": "fill-blank",
  "prompt": "Fill in the blank",
  "sentence": "The sky is ___ today",
  "answer": "blue",
  "options": ["blue", "green", "loud", "fast"]
}
```

### A note on hearts

`HEARTS` is a fixed constant (currently `3`) in `src/components/LessonRunner.jsx` — it applies to **every** lesson regardless of how many questions it has. This means a 10-question lesson can end early after just 3 wrong answers, well before reaching the end of the list. If you want longer lessons to be more forgiving, that constant is the place to change it (currently global, not per-lesson).

## Adding a brand-new question type (code change)

1. Create `src/components/YourType.jsx`, taking `{ question, onAnswer }` props and calling `onAnswer(correct: boolean)` exactly once.
2. Register it in the type map in `src/components/LessonRunner.jsx`.
3. Author questions with `"type": "your-type"` in `lessons.json`.

See `CLAUDE.md` for more implementation-level detail (speech hooks, iOS PWA gotchas, persistence, etc.).
