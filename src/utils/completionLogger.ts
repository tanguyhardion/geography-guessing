import type { GameResult } from "../types";
import { saveResult } from "./statsStorage";

// Only production builds report to Firestore, so local development and
// testing never pollute the shared usage log.
const isFirebaseConfigured =
  import.meta.env.PROD && Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID);

async function fetchApproximateLocation() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return null;
    const data = await res.json();
    return {
      city: data.city,
      region: data.region,
      country: data.country_name,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch {
    return null; // Location is best-effort only.
  }
}

/** Anonymous usage log in Firestore. Never blocks or breaks the game. */
async function logToFirestore(result: GameResult) {
  if (!isFirebaseConfigured) return;
  try {
    const [{ firestore }, { collection, addDoc }, location] = await Promise.all(
      [
        import("./firebase"),
        import("firebase/firestore"),
        fetchApproximateLocation(),
      ],
    );
    await addDoc(collection(firestore, "gameCompletions"), {
      modeName: result.modeName,
      completedAt: result.completedAt,
      totalTime: result.totalTime,
      finalScore: result.finalScore,
      accuracy: result.accuracy,
      device: navigator.userAgent || "unknown",
      location,
    });
  } catch (error) {
    console.warn("Game completion could not be logged:", error);
  }
}

/**
 * Record a finished game: in this browser's history (what the stats page
 * shows) and, when Firebase is configured, in the shared usage log.
 */
export function logGameCompletion(result: GameResult): void {
  saveResult(result);
  void logToFirestore(result);
}
