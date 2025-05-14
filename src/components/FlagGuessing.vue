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

<style scoped>
.flag-guessing-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  flex-grow: 1;
}

.instruction-text {
  font-size: 1.1em;
  margin-bottom: 15px;
  color: #555;
}

.flag-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.progress-indicator {
  margin-bottom: 10px;
  font-size: 1em;
  color: #555;
}

.score {
  font-weight: bold;
  color: #2196f3;
}

.flag-display {
  margin: 20px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
  width: 240px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.flag-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
  border: 1px solid #ddd;
}

.guess-input-area {
  margin: 15px 0;
  width: 100%;
  max-width: 300px;
}

.country-input {
  width: 100%;
  padding: 10px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 10px;
}

.guess-button {
  padding: 10px 20px;
  font-size: 1em;
  color: white;
  background-color: #4caf50; /* Green */
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;
  transition: background-color 0.3s;
}

.guess-button:hover {
  background-color: #45a049;
}

.completion-message {
  font-size: 1.5em;
  color: green;
  margin-bottom: 20px;
}

.restart-button {
  padding: 10px 20px;
  font-size: 1em;
  color: white;
  background-color: #2196f3; /* Blue */
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.restart-button:hover {
  background-color: #1976d2;
}
</style>
