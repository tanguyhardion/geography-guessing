import { firestore } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

// Utility for logging completed games to Firestore
export async function logGameCompletion({
  modeName,
  totalTime,
  finalScore,
  accuracy,
}: {
  modeName: string;
  totalTime: number; // in seconds
  finalScore: number;
  accuracy: number; // percentage, e.g., 98.5
}) {
  let location = null;
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      const data = await res.json();
      location = {
        city: data.city,
        region: data.region,
        country: data.country_name,
        latitude: data.latitude,
        longitude: data.longitude,
      };
    }
  } catch (e) {
    // Ignore location errors, proceed without location
  }

  const completion = {
    modeName,
    completedAt: new Date().toISOString(),
    totalTime,
    finalScore,
    accuracy,
    device: navigator.userAgent || "unknown",
    location,
  };
  try {
    await addDoc(collection(firestore, "gameCompletions"), completion);
  } catch (e) {
    // Optionally, handle/log error
  }
}
