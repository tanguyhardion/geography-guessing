<template>
  <div id="app-container">
    <div class="message-area-fixed" v-if="gameStore.message">
      {{ gameStore.message }}
    </div>
    <header v-if="currentPage === 'game'">
      <h1>Quiz des Départements Français</h1>
      <button @click="goHome" class="back-button">Retour</button>
    </header>
    <main>
      <HomePage v-if="currentPage === 'home'" @mode-selected="startGame" />
      <GamePage v-else-if="currentPage === 'game'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import HomePage from "./pages/HomePage.vue";
import GamePage from "./pages/GamePage.vue";
import { useGameStore } from "./store/gameStore";
import type { GameMode } from "./types";

const gameStore = useGameStore();
const currentPage = ref<"home" | "game">("home");

const startGame = () => {
  // Game mode is already set by HomePage, game is initialized by store's setGameMode
  currentPage.value = "game";
};

const goHome = () => {
  currentPage.value = "home";
  // Optional: Reset parts of the game state if needed when going home,
  // though setGameMode in HomePage should handle re-initialization.
  gameStore.message = null; // Clear any lingering messages
};

// No need to initialize game here, it's done when a mode is selected
</script>

<style scoped>
#app-container {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full viewport height */
  max-width: 600px; /* Max width for phone-like appearance */
  margin: 0 auto; /* Center on larger screens */
  border: 1px solid #eee; /* Optional: border for phone appearance */
  position: relative; /* For positioning the message area */
}

.message-area-fixed {
  position: fixed; /* Changed from .message-area */
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 20px); /* Max width of app container minus some padding */
  max-width: 580px; /* Ensure it doesn't exceed app's max-width */
  padding: 10px;
  background-color: #e7f3fe;
  border: 1px solid #2196f3;
  color: #2196f3;
  font-weight: bold;
  z-index: 1000; /* Ensure it's on top */
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 0 0 5px 5px;
}

header {
  padding: 10px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  font-size: 1.2em; /* Adjusted size */
  margin: 0;
}

.back-button {
  padding: 8px 12px;
  border: 1px solid #ccc;
  background-color: white;
  cursor: pointer;
  font-size: 0.9em;
}

.back-button:hover {
  background-color: #e0e0e0;
}

/* Removed .mode-selector and .message-area styles as they are handled differently or moved */

main {
  flex-grow: 1;
  overflow-y: auto;
  display: flex; /* Ensure child pages can fill height */
}
</style>
