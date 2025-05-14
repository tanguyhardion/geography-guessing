<template>
  <div class="homepage">
    <h1>Quiz Géographique</h1>

    <div class="game-selector">
      <div
        class="game-type"
        :class="{ active: selectedGame === 'departments' }"
        @click="selectedGame = 'departments'"
      >
        <h2>Départements Français</h2>
        <p>Testez vos connaissances sur les départements français</p>
      </div>

      <div
        class="game-type"
        :class="{ active: selectedGame === 'flags' }"
        @click="selectedGame = 'flags'"
      >
        <h2>Drapeaux du Monde</h2>
        <p>Devinez les pays à partir de leurs drapeaux</p>
      </div>
    </div>

    <div v-if="selectedGame === 'departments'" class="mode-buttons">
      <h3>Mode de jeu:</h3>
      <button @click="startGame('guessChefLieu')">Chef-lieux</button>
      <button @click="startGame('guessDepartmentName')">
        Nom des départements
      </button>
      <button @click="startGame('guessBoth')">Chef-lieux et noms</button>
    </div>

    <div v-else-if="selectedGame === 'flags'" class="mode-buttons">
      <h3>Mode de jeu:</h3>
      <button @click="startGame('guessFlags')">Drapeaux du Monde</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useGameStore } from "../store/gameStore";
import type { GameMode } from "../types";

const emit = defineEmits(["mode-selected"]);
const gameStore = useGameStore();
const selectedGame = ref<"departments" | "flags">("departments");

const startGame = (mode: GameMode) => {
  gameStore.setGameMode(mode); // This will also initialize the game via the store action
  emit("mode-selected");
};
</script>

<style scoped>
.homepage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  font-size: 2em;
  color: #2c3e50;
}

h2 {
  margin-bottom: 10px;
  font-size: 1.5em;
}

h3 {
  margin-bottom: 15px;
  font-size: 1.2em;
  color: #555;
}

.game-selector {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-bottom: 30px;
}

.game-type {
  width: 45%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.game-type:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.game-type.active {
  border-color: #4caf50;
  background-color: #f1f8e9;
}

.game-type p {
  color: #666;
  font-size: 0.9em;
  margin-top: 10px;
}

.mode-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.mode-buttons button {
  display: block;
  width: 100%;
  max-width: 300px;
  padding: 15px;
  font-size: 1.1em;
  margin: 10px 0;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.mode-buttons button:hover {
  background-color: #45a049;
}

/* Responsive adjustments for mobile */
@media (max-width: 600px) {
  .game-selector {
    flex-direction: column;
  }

  .game-type {
    width: 100%;
    margin-bottom: 15px;
  }
}
</style>
