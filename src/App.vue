<template>
  <div id="app-container">
    <div class="message-area-fixed" v-if="gameStore.message">
      {{ gameStore.message }}
    </div>
    <header v-if="currentPage === 'game'">
      <h1>{{ pageTitle }}</h1>
      <button @click="goHome" class="back-button">Retour</button>
    </header>
    <main>
      <transition name="fade" mode="out-in">
        <HomePage v-if="currentPage === 'home'" @mode-selected="startGame" />
        <GamePage v-else-if="currentPage === 'game'" />
      </transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import HomePage from "./pages/HomePage.vue";
import GamePage from "./pages/GamePage.vue";
import { useGameStore } from "./store/gameStore";

const gameStore = useGameStore();
const currentPage = ref<"home" | "game">("home");

const pageTitle = computed(() => {
  if (gameStore.gameMode === "guessFlags") {
    return "Quiz des Drapeaux du Monde";
  }
  return "Quiz des Départements Français";
});

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

<style scoped lang="scss">
#app-container {
  text-align: center;
  color: var(--text-primary);
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full viewport height */
  max-width: 600px; /* Max width for phone-like appearance */
  margin: 0 auto; /* Center on larger screens */
  border-radius: 16px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative; /* For positioning the message area */
  background-color: var(--background-light);
  background-image:
    radial-gradient(
      circle at 20% 90%,
      rgba(63, 81, 181, 0.03) 0%,
      transparent 20%
    ),
    radial-gradient(
      circle at 90% 10%,
      rgba(255, 152, 0, 0.03) 0%,
      transparent 20%
    );
}

.message-area-fixed {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 20px);
  max-width: 580px;
  padding: 12px;
  background-color: var(--primary-light);
  color: white;
  font-weight: 600;
  z-index: 1000;
  text-align: center;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  border-radius: 0 0 12px 12px;
  animation: slideDown 0.3s ease-in-out;
}

@keyframes slideDown {
  from {
    transform: translate(-50%, -100%);
  }
  to {
    transform: translate(-50%, 0);
  }
}

header {
  padding: 15px;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--primary-dark)
  );
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 1.1em;
  margin: 0;
  color: white;
  font-weight: 600;
}

.back-button {
  padding: 8px 15px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 600;
  transition: var(--transition-default);
  box-shadow: none;
}

.back-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: none;
  box-shadow: none;
}

main {
  flex-grow: 1;
  overflow-y: auto;
  display: flex; /* Ensure child pages can fill height */
  background-color: var(--background-off);
}

/* Page transition animations */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
