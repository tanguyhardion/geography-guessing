<template>
  <div class="flag-guessing-container">
    <!-- Standard flag guessing mode -->
    <div
      v-if="flagStore.currentCountry && !flagStore.reverseFlagMode"
      class="flag-section"
    >
      <div class="progress-indicator">
        Drapeau
        {{ currentProgress }}
        / {{ totalCountries }}
        <span class="score">Score : {{ baseStore.score }}</span>
        <span class="accuracy">Précision : {{ baseStore.accuracy }}%</span>
      </div>
      <div class="flag-display">
        <img
          :src="flagStore.currentFlag"
          alt="Drapeau à deviner"
          class="flag-image"
        />
      </div>
      <div class="guess-input-area">
        <input
          ref="inputField"
          type="text"
          v-model="flagStore.userGuessInput"
          @keyup.enter="makeGuess"
          placeholder="Nom du pays"
          class="country-input"
          :disabled="!flagStore.currentCountry"
        />
        <button
          @click="makeGuess"
          class="guess-button"
          :disabled="
            !flagStore.userGuessInput.trim() || !flagStore.currentCountry
          "
        >
          Deviner
        </button>
      </div>
      <SkipButton v-if="flagStore.currentCountry" @before-skip="blurInput" />
    </div>

    <!-- Reverse flag mode: guess the flag from the country name -->
    <div
      v-if="flagStore.currentCountry && flagStore.reverseFlagMode"
      class="flag-section flag-reverse-mode"
    >
      <div class="reverse-layout">
        <div class="country-question-area">
          <div class="progress-indicator">
            Pays
            {{ currentProgress }}
            / {{ totalCountries }}
            <span class="score">Score : {{ baseStore.score }}</span>
            <span class="accuracy">Précision : {{ baseStore.accuracy }}%</span>
          </div>
          <p class="instruction-text">Clique sur le drapeau du pays :</p>
          <h2 class="target-name">{{ flagStore.currentCountry.name }}</h2>
          <SkipButton @before-skip="blurInput" />
        </div>
        <div class="flag-list-column">
          <ul>
            <li
              v-for="country in continentCountries"
              :key="country.id"
              :class="getFlagClass(country)"
              @click="handleFlagGuess(country.id)"
            >
              <img
                :src="getFlagUrl(country.id)"
                :alt="country.name"
                class="flag-list-image"
              />
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Completion summary popup -->
    <div v-if="!flagStore.currentCountry" class="flag-section game-complete">
      <h2>Félicitations ! Tu as deviné tous les drapeaux !</h2>
      <div class="summary">
        <p><strong>Temps final :</strong> {{ baseStore.formattedTime }}</p>
        <p><strong>Score final :</strong> {{ baseStore.score }}</p>
        <p><strong>Précision :</strong> {{ baseStore.accuracy }}%</p>
      </div>
      <button @click="restartGame" class="restart-button">Rejouer</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFlagStore } from "../store/flagStore";
import { useBaseGameStore } from "../store/baseGameStore";
import SkipButton from "./SkipButton.vue";
import { computed, ref, watch, onMounted } from "vue";

const flagStore = useFlagStore();
const baseStore = useBaseGameStore();
const totalCountries = computed(() => flagStore.totalCountries);
const inputField = ref<HTMLInputElement | null>(null);

// More robust current progress calculation that handles continent filtering correctly
const currentProgress = computed(() => {
  const total = flagStore.totalCountries;
  const remaining = flagStore.availableCountries.length;

  // Ensure we never get negative or invalid values
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
    // Focus input field after guess only if there's a next country
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
  // Focus input field when game restarts and there's a country
  if (flagStore.currentCountry && inputField.value) {
    // Need a slight delay for the input to be potentially re-rendered/enabled
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
      // Need a slight delay for the input to be potentially re-rendered/enabled
      setTimeout(() => {
        inputField.value?.focus();
      }, 0);
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (flagStore.currentCountry && inputField.value) {
    inputField.value.focus();
  }
});
</script>

<style scoped lang="scss">
.flag-guessing-container {
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

.flag-section.flag-reverse-mode {
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: stretch;
  min-height: 0;
  height: 100%;
}

.flag-section {
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: stretch;
  min-height: 0;
  height: 100%;
}

.flag-reverse-mode .reverse-layout {
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 100%;
  align-items: stretch;
  justify-content: center;
  flex: 1 1 0;
  height: 100%;
  min-height: 0;
}

.flag-list-column {
  width: 80px;
  min-width: 80px;
  max-width: 80px;
  background: var(--primary-dark);
  border-radius: 0;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.08);
  padding: 0;
  margin: 0;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
  flex-shrink: 0;
}
.flag-list-column ul {
  list-style: none;
  padding: 0;
  padding-bottom: 60px; /* Add bottom padding for mobile scrolling */
  margin: 0;
  width: 100%;
  height: 100%;
}

.flag-list-item {
  padding: 12px 5px;
  cursor: pointer;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: var(--transition-default);
  background: none;
  border-radius: 0;
  margin-bottom: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.flag-list-item:hover {
  background: rgba(255, 255, 255, 0.08);
}
.correct-guess {
  background-color: var(--success-color);
  color: white;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}

.correct-guess:hover {
  background-color: var(--success-dark);
  cursor: not-allowed;
}
.flag-list-image {
  width: 48px;
  height: 32px;
  object-fit: contain;
  background: transparent;
}

.country-question-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.instruction-text {
  font-size: 1.2em;
  margin-bottom: 18px;
  color: var(--text-secondary);
  font-weight: 500;
}

.target-name {
  font-size: 1.8em;
  font-weight: 700;
  margin-bottom: 30px;
  color: var(--primary-color);
  background-color: var(--background-off);
  padding: 12px 20px;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  position: relative;
  display: inline-block;
  min-width: 250px;
  max-width: 320px;
  text-align: center;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

/* Removed duplicate .flag-section rule - handled above */

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

.flag-display {
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
  background-color: transparent;
  margin-left: auto;
  margin-right: auto;
}

.flag-display::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.4) 0%,
    rgba(255, 255, 255, 0) 50%
  );
  pointer-events: none;
}

.flag-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
  filter: drop-shadow(0 10px 25px rgba(0, 0, 0, 0.15));
  border-radius: 3px;
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
  margin-bottom: 15px;
  transition: var(--transition-default);
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.2);
}

/* .completion-message styling removed */
/*
.completion-message {
  font-size: 1.6em;
  color: var(--success-color);
  margin-bottom: 25px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.6s ease-out;
}
*/

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);
  font-weight: 600;
}

.game-complete {
  text-align: center;
  padding: 20px;
  border-radius: 12px;
  background-color: var(--background-off);
  box-shadow: var(--card-shadow);
  margin: 0 auto;
  max-width: 600px;
  width: 90%;
  animation: fadeIn 0.8s ease-out;
}

.summary {
  margin: 20px 0;
  font-size: 1.1em;
  color: var(--text-primary);
  line-height: 1.4;
}

.summary strong {
  color: var(--primary-color);
}
</style>
