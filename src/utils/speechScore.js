/**
 * Evaluates how closely what was spoken matches the expected text.
 * Returns a score between 0 and 1.
 */
export function scoreSpeech(expected, spoken) {
  if (!spoken || !expected) return 0;

  const normalize = (str) =>
    str.toLowerCase().replace(/[^a-z\s]/g, '').trim().split(/\s+/).filter(Boolean);

  const expectedWords = normalize(expected);
  const spokenWords = normalize(spoken);

  if (expectedWords.length === 0) return 0;

  let matches = 0;
  const usedIndices = new Set();

  for (const word of spokenWords) {
    const idx = expectedWords.findIndex((w, i) => w === word && !usedIndices.has(i));
    if (idx !== -1) {
      matches++;
      usedIndices.add(idx);
    }
  }

  return matches / expectedWords.length;
}

export function getScoreLabel(score) {
  if (score >= 0.85) return { label: 'Excellent! 🌟', color: 'text-green-600', pass: true };
  if (score >= 0.65) return { label: 'Good try! 👍', color: 'text-yellow-600', pass: true };
  if (score >= 0.4)  return { label: 'Almost! Try again 🎙️', color: 'text-orange-500', pass: false };
  return { label: 'Try again! 🎙️', color: 'text-red-500', pass: false };
}
