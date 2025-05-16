<template>
  <div class="guessing-area-container">
    <div v-if="gameStore.currentDepartment">
      <p class="instruction-text">
        {{ instructionText }}
      </p>
      <h2 class="target-name">
        {{ gameStore.currentQuestionDisplay }}
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
import { computed } from "vue";
import { useGameStore } from "../store/gameStore";
import SkipButton from "./SkipButton.vue";

const gameStore = useGameStore();

const instructionText = computed(() => {
  if (gameStore.gameMode === "guessChefLieu") {
    return "Clique sur le numéro du département du chef-lieu:";
  } else if (gameStore.gameMode === "guessDepartmentName") {
    return "Clique sur le numéro du département:";
  } else if (gameStore.gameMode === "guessBoth") {
    if (gameStore.currentGuessType === "name") {
      return "Clique sur le numéro correspondant à ce nom :";
    } else if (gameStore.currentGuessType === "chefLieu") {
      return "Clique sur le numéro correspondant à ce chef-lieu:";
    }
    return "Clique sur le numéro du département pour deviner son nom et son chef-lieu:";
  }
  return "";
});
</script>

<style scoped lang="scss">
.guessing-area-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 25px;
  flex-grow: 1;
  background-color: var(--background-light);
  position: relative;

  div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

.instruction-text {
  font-size: 1.2em;
  margin-bottom: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  max-width: 90%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.target-name {
  font-size: 2.2em;
  font-weight: 700;
  margin-bottom: 30px;
  color: var(--primary-color);
  background-color: var(--background-off);
  padding: 15px 30px;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  position: relative;
  display: inline-block;
}

.completion-message {
  font-size: 1.6em;
  color: var(--success-color);
  margin-bottom: 25px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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

.restart-button {  padding: 12px 25px;
  font-size: 1.1em;
  color: white;
  background-color: var(--secondary-color);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: var(--transition-default);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);
}
</style>
