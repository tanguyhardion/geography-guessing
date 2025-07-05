// Composable for world capitals guessing logic extracted from WorldCapitalsGuessing.vue
// This keeps the component clean and logic reusable/testable
import { ref, computed, watch, onMounted } from "vue";
import { useWorldCapitalsStore } from "../store/worldCapitalsStore";
import { useBaseGameStore } from "../store/baseGameStore";
import { logGameCompletion } from "../utils/completionLogger";

export function useWorldCapitalsGuessing(inputField: any) {
  const worldCapitalsStore = useWorldCapitalsStore();
  const baseStore = useBaseGameStore();
  const totalCountries = computed(() => worldCapitalsStore.totalCountries);

  const makeGuess = () => {
    if (
      worldCapitalsStore.userGuessInput.trim() &&
      worldCapitalsStore.currentCountry
    ) {
      worldCapitalsStore.makeCapitalsGuess(worldCapitalsStore.userGuessInput);
      if (worldCapitalsStore.currentCountry && inputField.value) {
        inputField.value.focus();
      }
    }
  };

  const restartGame = () => {
    worldCapitalsStore.initializeGame();
    if (worldCapitalsStore.currentCountry && inputField.value) {
      setTimeout(() => {
        inputField.value?.focus();
      }, 0);
    }
  };

  // Focus the input field when a new country is selected (and it's not game over)
  watch(
    () => worldCapitalsStore.currentCountry,
    (newCountry) => {
      if (newCountry && inputField.value) {
        setTimeout(() => {
          inputField.value?.focus();
        }, 0);
      }
    },
    { immediate: true },
  );

  // Log game completion to localStorage when the game is finished
  watch(
    () => !worldCapitalsStore.currentCountry,
    (isComplete) => {
      if (isComplete) {
        const modeName = worldCapitalsStore.reverseCapitalsMode
          ? "Capitales du monde (inverse)"
          : "Capitales du monde";
        logGameCompletion({
          modeName,
          totalTime: baseStore.elapsedTime,
          finalScore: baseStore.score,
          accuracy: baseStore.accuracy,
        });
      }
    },
  );

  onMounted(() => {
    if (worldCapitalsStore.currentCountry && inputField.value) {
      inputField.value.focus();
    }
  });

  return {
    worldCapitalsStore,
    baseStore,
    totalCountries,
    makeGuess,
    restartGame,
  };
}
