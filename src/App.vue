<template>
  <div id="app-container">
    <header v-if="$route.name === 'Game'">
      <div class="header-flex">
        <h1>{{ pageTitle }}</h1>
        <div class="timer">{{ baseStore.formattedTime }}</div>
        <button v-click-animate @click="goHome" class="back-button">
          Retour
        </button>
      </div>
    </header>
    <main>
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useBaseGameStore } from "./store/baseGameStore";
import { useAppGameStore } from "./store/gameStoreAdapter";
import { useToast, TYPE } from "vue-toastification";

const baseStore = useBaseGameStore();
const appGameStore = useAppGameStore();
const toast = useToast();
const router = useRouter();
const route = useRoute();

const pageTitle = computed(() => {
  if (appGameStore.isInFlagMode) {
    return "Quiz des Drapeaux du Monde";
  } else if (appGameStore.isInRussianCitiesMode) {
    return "Quiz des Villes de Russie";
  } else if (appGameStore.isInRussianOblastsMode) {
    return "Quiz des Oblasts de Russie";
  } else if (appGameStore.isInFrenchChefLieuxMode) {
    return "Quiz des Chef-lieux Français";
  } else if (appGameStore.isInWorldCapitalsMode) {
    return "Quiz des Capitales du Monde";
  } else if (appGameStore.isInCountryFromCapitalMode) {
    return "Quiz des Capitales du Monde";
  } else if (appGameStore.currentGameMode === "guessCountryMapLocation") {
    return "Quiz des Pays du Monde";
  }
  return "Quiz Géographique";
});

watch(
  () => baseStore.message,
  (newMessage) => {
    if (newMessage) {
      toast.clear();
      if (typeof newMessage === "string") {
        if (newMessage.includes("Correct")) {
          toast(newMessage, { type: TYPE.SUCCESS });
        } else if (
          newMessage.includes("félicitations") ||
          newMessage.includes("Félicitations")
        ) {
          // Do not show toast for completion message
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
        toast(newMessage, { type: TYPE.WARNING });
      }
    }
  },
);

// Watch for game mode changes to reset timer
watch(
  () => appGameStore.currentGameMode,
  (newMode, oldMode) => {
    if (newMode !== oldMode && route.name === "Game") {
      baseStore.resetTimer();
      baseStore.startTimer();
    }
  },
);

// Watch for route changes to manage timer
watch(
  () => route.name,
  (newPage) => {
    if (newPage === "Game") {
      baseStore.startTimer();
    } else {
      baseStore.pauseTimer();
    }
  },
);

const goHome = () => {
  router.push({ name: "Home" });
  baseStore.message = null;
  baseStore.stopTimer();
};

function handleNavigateStats() {
  router.push({ name: "Stats" });
}
function handleNavigateHome() {
  router.push({ name: "Home" });
}

window.addEventListener("navigate-stats", handleNavigateStats);
window.addEventListener("navigate-home", handleNavigateHome);

onUnmounted(() => {
  window.removeEventListener("navigate-stats", handleNavigateStats);
  window.removeEventListener("navigate-home", handleNavigateHome);
  baseStore.stopTimer();
});
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
  position: relative;
}

h1 {
  font-size: 1.1em;
  margin: 0;
  color: white;
  font-weight: 600;
}

.timer {
  font-size: 1.2em;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 15px;
  min-width: 60px;
  text-align: center;
  font-family: "Courier New", monospace;
}

.header-flex {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 100%;
}

.header-flex h1 {
  justify-self: start;
  margin-right: 12px;
}

.header-flex .timer {
  justify-self: center;
  margin: 0 12px;
}

.header-flex .back-button {
  justify-self: end;
  margin-left: 12px;
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
