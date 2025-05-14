/**
 * Levenshtein distance calculation for approximate string matching
 * Returns the minimum number of single-character edits needed to change one string into another
 */
export function levenshteinDistance(a: string, b: string): number {
  // Create a matrix of size (a.length + 1) x (b.length + 1)
  const matrix: number[][] = Array(a.length + 1)
    .fill(null)
    .map(() => Array(b.length + 1).fill(null));

  // Fill the first row
  for (let i = 0; i <= a.length; i++) {
    matrix[i][0] = i;
  }

  // Fill the first column
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  // Fill the rest of the matrix
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  return matrix[a.length][b.length];
}

/**
 * Normalize a string for comparison by:
 * 1. Converting to lowercase
 * 2. Removing accents
 * 3. Removing dashes and special characters
 * 4. Trimming whitespace
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s]/g, "") // Remove special chars
    .trim();
}

/**
 * Check if two strings are similar enough based on normalized Levenshtein distance
 * Returns true if strings are similar within the tolerance threshold
 */
export function areStringsSimilar(
  str1: string,
  str2: string,
  maxDistance = 2,
): boolean {
  const normalized1 = normalizeString(str1);
  const normalized2 = normalizeString(str2);

  // For very short strings, require exact match
  if (normalized1.length <= 3 || normalized2.length <= 3) {
    return normalized1 === normalized2;
  }

  // Levenshtein distance check
  const distance = levenshteinDistance(normalized1, normalized2);

  // Calculate threshold based on length - longer strings can tolerate more errors
  const thresholdFactor =
    Math.max(normalized1.length, normalized2.length) > 8 ? 0.25 : 0.2;
  const dynamicThreshold = Math.min(
    maxDistance,
    Math.floor(
      Math.max(normalized1.length, normalized2.length) * thresholdFactor,
    ),
  );

  return distance <= dynamicThreshold;
}
