<template>
  <div class="guessing-area-container">
    <div v-if="gameStore.currentDepartment">
      <p class="instruction-text">
        {{
          gameStore.gameMode === "guessChefLieu"
            ? "Devine le numéro du département du chef-lieu:"
            : "Devine le numéro du département:"
        }}
      </p>
      <h2 class="target-name">
        {{
          gameStore.gameMode === "guessChefLieu"
            ? gameStore.currentDepartment.name
            : gameStore.currentDepartment.chefLieu
        }}
      </h2>
      <SkipButton />
    </div>
    <div
      v-else-if="
        gameStore.availableDepartments.length === 0 &&
        gameStore.departments.length > 0
      "
    >
      <p class="completion-message">Tous les départements ont été devinés !</p>
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

const gameStore = useGameStore();
</script>

<style scoped>
.guessing-area-container {
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
  margin-bottom: 8px;
  color: #555;
}

.target-name {
  font-size: 1.8em;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
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
