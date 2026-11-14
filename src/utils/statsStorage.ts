import type { GameResult } from "../types";

const STORAGE_KEY = "geo-quiz:history";
const MAX_ENTRIES = 500;

function isGameResult(value: unknown): value is GameResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.modeName === "string" &&
    typeof v.completedAt === "string" &&
    typeof v.totalTime === "number" &&
    typeof v.finalScore === "number" &&
    typeof v.accuracy === "number"
  );
}

/** This player's finished games, newest first. Never throws. */
export function loadHistory(): GameResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isGameResult) : [];
  } catch {
    return [];
  }
}

export function saveResult(result: GameResult): void {
  try {
    const history = [result, ...loadHistory()].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Storage full or unavailable (private mode): the game still works.
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}

/** Fastest full (all continents) run per mode id, in seconds. */
export function bestTimes(history: GameResult[]): Record<string, number> {
  const best: Record<string, number> = {};
  for (const entry of history) {
    if (!entry.modeId || entry.continent !== "all") continue;
    if (
      best[entry.modeId] === undefined ||
      entry.totalTime < best[entry.modeId]
    ) {
      best[entry.modeId] = entry.totalTime;
    }
  }
  return best;
}
