<template>
  <div class="guessing-area-container">
    <div v-if="departmentStore.currentDepartment">
      <div class="progress-indicator">
        Département
        {{ totalDepartments - departmentStore.availableDepartments.length + 1 }}
        /
        {{ totalDepartments }}
        <span class="score">Score : {{ baseStore.score }}</span>
        <span class="accuracy">Précision : {{ baseStore.accuracy }}%</span>
      </div>
      <p class="instruction-text">{{ instructionText }}</p>
      <h2 class="target-name">{{ departmentStore.currentQuestionDisplay }}</h2>
      <SkipButton />
    </div>
    <!-- Completion message paragraph removed, toast will handle it -->
    <div v-if="!departmentStore.currentDepartment">
      <!-- The completion message is now shown as a toast via App.vue -->
      <button v-click-animate @click="restartGame" class="restart-button">
        Rejouer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDepartmentStore } from "../store/departmentStore";
import { useBaseGameStore } from "../store/baseGameStore";
import SkipButton from "./SkipButton.vue";

const departmentStore = useDepartmentStore();
const baseStore = useBaseGameStore();
const totalDepartments = computed(() => departmentStore.totalDepartments);

const instructionText = computed(() => {
  if (departmentStore.gameMode === "guessChefLieu") {
    return "Clique sur le numéro du département du chef-lieu suivant :";
  } else if (departmentStore.gameMode === "guessDepartmentName") {
    return "Clique sur le numéro du département suivant :";
  } else if (departmentStore.gameMode === "guessBoth") {
    if (departmentStore.currentGuessType === "name") {
      return "Clique sur le numéro du département suivant :";
    } else if (departmentStore.currentGuessType === "chefLieu") {
      return "Clique sur le numéro du département du chef-lieu suivant :";
    }
    return "Clique sur le numéro du département :";
  }
  return "";
});

const restartGame = () => {
  departmentStore.initializeGame();
};
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

.progress-indicator {
  margin-bottom: 20px;
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
  margin-left: 20px;
}

.accuracy {
  font-weight: 700;
  color: var(--secondary-color);
  margin-left: 20px;
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
  font-size: 1.8em;
  font-weight: 700;
  margin-bottom: 30px;
  color: var(--primary-color);
  background-color: var(--background-off);
  padding: 12px 20px;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  position: relative;
  display: inline-block;
  min-width: 250px;
  width: 90%;
  text-align: center;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.restart-button {
  padding: 12px 25px;
  font-size: 1.1em;
  color: white;
  background-color: var(--secondary-color);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: var(--transition-default);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
