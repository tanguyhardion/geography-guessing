<template>
  <div id="app-container">
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
import { ref, computed, watch } from "vue";
import HomePage from "./pages/HomePage.vue";
import GamePage from "./pages/GamePage.vue";
import { useBaseGameStore } from "./store/baseGameStore";
import { useAppGameStore } from "./store/gameStoreAdapter";
import { useToast, TYPE } from "vue-toastification";

const baseStore = useBaseGameStore();
const appGameStore = useAppGameStore();
const toast = useToast();
const currentPage = ref<"home" | "game">("home");

const pageTitle = computed(() => {
  if (appGameStore.isInFlagMode) {
    return "Quiz des Drapeaux du Monde";
  } else if (appGameStore.isInRussianCitiesMode) {
    return "Quiz des Villes de Russie";
  } else if (appGameStore.isInFrenchChefLieuxMode) {
    return "Quiz des Chef-lieux Français";
  } else if (appGameStore.isInWorldCapitalsMode) {
    return "Quiz des Capitales du Monde";
  } else if (appGameStore.isInCountryFromCapitalMode) {
    return "Quiz des Capitales du Monde";
  } else if (appGameStore.currentGameMode === "guessCountryMapLocation") {
    return "Quiz des Pays du Monde";
  }
  return "Quiz des Départements Français";
});

watch(
  () => baseStore.message,
  (newMessage) => {
    if (newMessage) {
      toast.clear(); // Clear all existing toasts before showing a new one

      if (typeof newMessage === "string") {
        // Handle string messages
        if (
          newMessage.includes("Correct") ||
          newMessage.includes("félicitations") ||
          newMessage.includes("Félicitations")
        ) {
          toast(newMessage, { type: TYPE.SUCCESS });
        } else if (newMessage.includes("Incorrect")) {
          toast(newMessage, { type: TYPE.ERROR });
        } else if (newMessage.includes("Indice")) {
          toast(newMessage, { type: TYPE.INFO });
        } else if (
          newMessage.includes("Passé") ||
          newMessage.includes("passé")
        ) {
          toast(newMessage, { type: TYPE.WARNING });
        } else {
          toast(newMessage, { type: TYPE.DEFAULT });
        }
      } else if (typeof newMessage === "object" && newMessage.component) {
        // Handle component messages (like skip messages with bold text)
        toast(newMessage, { type: TYPE.WARNING });
      }
    }
  },
);

const startGame = () => {
  currentPage.value = "game";
};

const goHome = () => {
  currentPage.value = "home";
  baseStore.message = null;
};
</script>

<style scoped lang="scss">
#app-container {
  text-align: center;
  color: var(--text-primary);
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 100%;
  max-width: 100%;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
}

main {
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  background-color: var(--background-off);
}

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

:global(.Vue-Toastification__container) {
  z-index: 9999 !important;
}
</style>
