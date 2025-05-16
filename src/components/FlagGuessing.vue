<template>
  <div class="flag-guessing-container">
    <div v-if="gameStore.currentCountry" class="flag-section">
      <p class="instruction-text">Devinez le pays du drapeau suivant :</p>
      <div class="progress-indicator">
        <span class="score"
          >Score: {{ gameStore.score }} / {{ totalCountries }}</span
        >
      </div>
      <div class="flag-display">
        <img
          :src="gameStore.currentFlag"
          :alt="'Drapeau à deviner'"
          class="flag-image"
        />
      </div>

      <div class="guess-input-area">
        <input
          v-model="gameStore.userGuessInput"
          @keyup.enter="makeGuess"
          type="text"
          placeholder="Entrez le nom du pays..."
          class="country-input"
          autocomplete="off"
        />
        <button @click="makeGuess" class="guess-button">Valider</button>
      </div>

      <SkipButton />
    </div>
    <div v-else-if="gameStore.availableCountries.length === 0">
      <p class="completion-message">Tous les drapeaux ont été devinés !</p>
      <button @click="gameStore.initializeGame()" class="restart-button">
        Rejouer
      </button>
    </div>
    <div v-else>
      <p>Chargement...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from "../store/gameStore";
import SkipButton from "./SkipButton.vue";
import { computed } from "vue";

const gameStore = useGameStore();
const totalCountries = computed(() => gameStore.countries.length);

const makeGuess = () => {
  if (gameStore.userGuessInput.trim()) {
    gameStore.makeFlagGuess(gameStore.userGuessInput);
  }
};
</script>

<style scoped lang="scss">
.flag-guessing-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 25px;
  flex-grow: 1;
  background-color: var(--background-light);
  width: 100%;
  max-width: 100%;
}

.instruction-text {
  font-size: 1.2em;
  margin-bottom: 18px;
  color: var(--text-secondary);
  font-weight: 500;
}

.flag-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
}

.progress-indicator {
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
}

.flag-display {
  margin: 25px 0;
  width: 100%;
  max-width: 400px;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: transform 0.5s ease;
  background-color: transparent;
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
  max-width: 500px;
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

.completion-message {
  font-size: 1.6em;
  color: var(--success-color);
  margin-bottom: 25px;
  font-weight: 600;
  animation: fadeIn 0.6s ease-out;
}

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
</style>
