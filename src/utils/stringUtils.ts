/**
 * Levenshtein distance: minimum number of single-character edits needed to
 * turn `a` into `b`. Uses two rolling rows instead of a full matrix.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  let current = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    current[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1, // deletion
        current[j - 1] + 1, // insertion
        previous[j - 1] + cost, // substitution
      );
    }
    [previous, current] = [current, previous];
  }

  return previous[b.length];
}

/**
 * Normalize a string for comparison: lowercase, no accents, ligatures
 * expanded, hyphens/apostrophes treated as spaces, other punctuation dropped.
 * "Port-au-Prince", "port au prince" and "Port au  Prince" all compare equal.
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[-'’‘`.]/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Typo tolerance between two already-normalized strings. */
function isCloseEnough(a: string, b: string): boolean {
  const longest = Math.max(a.length, b.length);
  // Very short names must match exactly ("Iran" vs "Irak").
  if (Math.min(a.length, b.length) <= 3) return a === b;
  const allowed = Math.min(2, Math.floor(longest * (longest > 8 ? 0.25 : 0.2)));
  return levenshteinDistance(a, b) <= allowed;
}

/**
 * Check if two strings are similar enough (accent/case-insensitive, with a
 * small typo tolerance that grows with length).
 */
export function areStringsSimilar(str1: string, str2: string): boolean {
  return isCloseEnough(normalizeString(str1), normalizeString(str2));
}

/**
 * Decide whether a typed guess matches one of the accepted answers.
 *
 * `rivals` holds the normalized answers of every *other* question in the game.
 * A guess that is exactly a rival is a wrong answer, not a typo: without this,
 * "Islande" would be accepted for Irlande and "Gambie" for Zambie.
 */
export function isAnswerMatch(
  guess: string,
  accepted: string[],
  rivals: ReadonlySet<string>,
): boolean {
  const normalizedGuess = normalizeString(guess);
  if (!normalizedGuess) return false;

  const normalizedAccepted = accepted.map(normalizeString);
  if (normalizedAccepted.includes(normalizedGuess)) return true;
  if (rivals.has(normalizedGuess)) return false;
  return normalizedAccepted.some((answer) =>
    isCloseEnough(normalizedGuess, answer),
  );
}

/** Seconds → "MM:SS". */
export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Seconds → "3 min 05 s" (or "45 s"). */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds} s`;
  return `${minutes} min ${String(seconds).padStart(2, "0")} s`;
}
