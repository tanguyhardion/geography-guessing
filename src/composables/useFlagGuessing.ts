// Composable for flag guessing logic extracted from FlagGuessing.vue
// This makes the component cleaner and logic reusable/testable
import { computed, ref, watch, onMounted } from "vue";
import { useFlagStore } from "../store/flagStore";
import { useBaseGameStore } from "../store/baseGameStore";
import { logGameCompletion } from "../utils/completionLogger";

// Accept optional callbacks for game complete/restart for better decoupling
interface FlagGuessingOptions {
  onGameComplete?: () => void;
  onGameRestart?: () => void;
}

export function useFlagGuessing(
  inputField: any,
  { onGameComplete, onGameRestart }: FlagGuessingOptions = {},
) {
  const flagStore = useFlagStore();
  const baseStore = useBaseGameStore();
  const totalCountries = computed(() => flagStore.totalCountries);

  // More robust current progress calculation that handles continent filtering correctly
  const currentProgress = computed(() => {
    const total = flagStore.totalCountries;
    const remaining = flagStore.availableCountries.length;
    if (total <= 0 || remaining < 0 || remaining > total) {
      return 1; // Safe fallback
    }
    return total - remaining + 1;
  });

  const continentCountries = computed(() => {
    if (!flagStore.currentCountry) return [];
    return flagStore.continentCountries.filter(
      (c) => c.continent === flagStore.currentCountry?.continent,
    );
  });

  const getFlagUrl = (id: string) => `https://flagcdn.com/${id}.svg`;

  const getFlagClass = (country: any) => {
    const status = flagStore.getCountryStatus(country.id);
    return {
      "flag-list-item": true,
      "correct-guess": status === "correct",
    };
  };

  const makeGuess = () => {
    if (flagStore.userGuessInput.trim() && flagStore.currentCountry) {
      flagStore.makeFlagGuess(flagStore.userGuessInput);
      if (flagStore.currentCountry && inputField.value) {
        inputField.value.focus();
      }
    }
  };

  const handleFlagGuess = (countryId: string) => {
    if (!flagStore.currentCountry) return;
    flagStore.makeFlagGuessByFlag(countryId);
  };

  const restartGame = () => {
    flagStore.initializeGame();
    if (onGameRestart) onGameRestart(); // Notify parent if provided
    if (flagStore.currentCountry && inputField.value) {
      setTimeout(() => {
        inputField.value?.focus();
      }, 0);
    }
  };

  const blurInput = () => {
    if (inputField.value) {
      inputField.value.blur();
    }
  };

  // Focus the input field when a new country is selected (and it's not game over)
  watch(
    () => flagStore.currentCountry,
    (newCountry) => {
      if (newCountry && inputField.value) {
        setTimeout(() => {
          inputField.value?.focus();
        }, 0);
      }
    },
    { immediate: true },
  );

  // Log game completion to localStorage and notify parent if callback provided
  watch(
    () => flagStore.isGameComplete,
    (isComplete) => {
      if (isComplete) {
        logGameCompletion({
          modeName: flagStore.reverseFlagMode
            ? "Drapeaux du monde (inverse)"
            : "Drapeaux du monde",
          totalTime: baseStore.elapsedTime,
          finalScore: baseStore.score,
          accuracy: baseStore.accuracy,
        });
        if (onGameComplete) onGameComplete();
      }
    },
  );

  onMounted(() => {
    if (flagStore.currentCountry && inputField.value) {
      inputField.value.focus();
    }
  });

  // Expose onGameComplete for parent communication if needed
  return {
    flagStore,
    baseStore,
    totalCountries,
    currentProgress,
    continentCountries,
    getFlagUrl,
    getFlagClass,
    makeGuess,
    handleFlagGuess,
    restartGame,
    blurInput,
    onGameComplete,
  };
}
