// Utility for logging completed games to localStorage
export function logGameCompletion({
  modeName,
  totalTime,
  finalScore,
  accuracy
}: {
  modeName: string;
  totalTime: number; // in seconds
  finalScore: number;
  accuracy: number; // percentage, e.g., 98.5
}) {
  const completion = {
    modeName,
    completedAt: new Date().toISOString(),
    totalTime,
    finalScore,
    accuracy
  };
  const key = 'gameCompletions';
  const history = JSON.parse(localStorage.getItem(key) || '[]');
  history.push(completion);
  localStorage.setItem(key, JSON.stringify(history));
}
