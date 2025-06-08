<template>
  <div class="world-capitals-guessing-container">
    <!-- Standard capitals guessing mode -->
    <div v-if="worldCapitalsStore.currentCountry" class="capitals-section">
      <div class="progress-indicator">
        Capitale
        {{ totalCountries - worldCapitalsStore.availableCountries.length + 1 }}
        / {{ totalCountries }}
        <span class="score">Score : {{ baseStore.score }}</span>
        <span class="accuracy">Précision : {{ baseStore.accuracy }}%</span>
      </div>
      <div class="guess-input-area">
        <input
          ref="inputField"
          type="text"
          v-model="worldCapitalsStore.userGuessInput"
          @keyup.enter="makeGuess"
          placeholder="Nom du pays"
          class="country-input"
          :disabled="!worldCapitalsStore.currentCountry"
        />
        <button
          @click="makeGuess"
          class="guess-button"
          :disabled="
            !worldCapitalsStore.userGuessInput.trim() ||
            !worldCapitalsStore.currentCountry
          "
        >
          Deviner
        </button>
      </div>

      <p class="instruction-text">Quel pays a pour capitale :</p>
      <div class="capital-display">
        <h2 class="target-name">
          {{ worldCapitalsStore.currentQuestionDisplay }}
        </h2>
      </div>
      <SkipButton v-if="worldCapitalsStore.currentCountry" />
    </div>

    <!-- Completion message paragraph removed, toast will handle it -->
    <div v-if="!worldCapitalsStore.currentCountry" class="capitals-section">
      <!-- The completion message is now shown as a toast via App.vue -->
      <button @click="restartGame" class="restart-button">Rejouer</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorldCapitalsStore } from "../store/worldCapitalsStore";
import { useBaseGameStore } from "../store/baseGameStore";
import SkipButton from "./SkipButton.vue";
import { computed, ref, watch, onMounted } from "vue";

const worldCapitalsStore = useWorldCapitalsStore();
const baseStore = useBaseGameStore();
const totalCountries = computed(() => worldCapitalsStore.totalCountries);
const inputField = ref<HTMLInputElement | null>(null);

const makeGuess = () => {
  if (
    worldCapitalsStore.userGuessInput.trim() &&
    worldCapitalsStore.currentCountry
  ) {
    worldCapitalsStore.makeCapitalsGuess(worldCapitalsStore.userGuessInput);
    // Focus input field after guess only if there's a next country
    if (worldCapitalsStore.currentCountry && inputField.value) {
      inputField.value.focus();
    }
  }
};

const restartGame = () => {
  worldCapitalsStore.initializeGame();
  // Focus input field when game restarts and there's a country
  if (worldCapitalsStore.currentCountry && inputField.value) {
    // Need a slight delay for the input to be potentially re-rendered/enabled
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
      // Need a slight delay for the input to be potentially re-rendered/enabled
      setTimeout(() => {
        inputField.value?.focus();
      }, 0);
    }
  },
  { immediate: true },
);

onMounted(() => {
  // Initialize the world capitals game if not already initialized
  if (!worldCapitalsStore.currentCountry) {
    worldCapitalsStore.initializeGame();
  }

  if (worldCapitalsStore.currentCountry && inputField.value) {
    inputField.value.focus();
  }
});
</script>

<style scoped lang="scss">
.world-capitals-guessing-container {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
  text-align: center;
  padding: 0;
  flex-grow: 1;
  background-color: var(--background-light);
  width: 100%;
  margin: 0;
  height: 100%;
  min-height: 0;
}

.capitals-section {
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 0;
  height: 100%;
  overflow-wrap: break-word;
  hyphens: auto;
}

.progress-indicator {
  margin-top: 15px;
  margin-bottom: 15px;
  font-size: 1.1em;
  color: var(--text-secondary);
  background-color: var(--background-off);
  padding: 8px 20px;
  border-radius: 30px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.score {
  font-weight: 700;
  color: var(--primary-color);
  white-space: nowrap; /* Prevent breaking within "Score: X" */
}

.accuracy {
  font-weight: 700;
  color: var(--secondary-color);
  margin-left: 20px;
  white-space: nowrap; /* Prevent breaking within "Précision: XXX%" */
}

.capital-display {
  margin: 25px 0;
  width: 320px;
  min-width: 320px;
  max-width: 320px;
  height: 200px;
  min-height: 200px;
  max-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: transform 0.5s ease;
  background-color: var(--background-off);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-left: auto;
  margin-right: auto;
}

.target-name {
  font-size: 1.8em;
  font-weight: 700;
  color: var(--primary-color);
  text-align: center;
  word-wrap: break-word;
  max-width: 280px;
  line-height: 1.2;
}

.instruction-text {
  font-size: 1.2em;
  margin-bottom: 18px;
  color: var(--text-secondary);
  font-weight: 500;
}

.guess-input-area {
  margin: 20px 0;
  width: 100%;
  padding: 0 20px;
}

.country-input {
  width: 100%;
  padding: 12px 15px;
  font-size: 1.05em;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  margin-bottom: 15px;
  transition: var(--transition-default);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.country-input:focus {
  border-color: var(--primary-light);
  box-shadow: 0 0 0 3px rgba(63, 81, 181, 0.2);
  outline: none;
}

.guess-button {
  padding: 12px 25px;
  font-size: 1em;
  color: white;
  background-color: var(--success-color);
  border: none;
  border-radius: 24px;
  cursor: pointer;
  transition: var(--transition-default);
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.2);
}

.guess-button:hover:not(:disabled) {
  background-color: var(--success-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(76, 175, 80, 0.3);
}

.guess-button:disabled {
  background-color: var(--disabled-color);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.guess-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.2);
}

.restart-button {
  padding: 12px 28px;
  font-size: 1.1em;
  color: white;
  background-color: var(--secondary-color);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: var(--transition-default);
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(255, 152, 0, 0.2);
}

.restart-button:hover {
  background-color: var(--secondary-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 152, 0, 0.3);
}

.restart-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);
  font-weight: 600;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
