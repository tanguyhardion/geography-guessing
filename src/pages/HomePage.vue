<template>
  <div class="homepage">
    <h2>Choisis ton challenge!</h2>
    <div class="mode-buttons">
      <button @click="startGame('guessChefLieu')">Chef-lieux</button>
      <button @click="startGame('guessDepartmentName')">
        Nom des départements
      </button>
      <button @click="startGame('guessBoth')">Chef-lieux et noms</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from "../store/gameStore";
import type { GameMode } from "../types";

const emit = defineEmits(["mode-selected"]);
const gameStore = useGameStore();

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
  justify-content: center;
  height: 100%;
  padding: 20px;
}

h2 {
  margin-bottom: 30px;
  font-size: 1.8em;
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
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.mode-buttons button:hover {
  background-color: #45a049;
}
</style>
