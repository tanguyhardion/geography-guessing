<template>
  <div class="department-list-container">
    <ul>
      <li
        v-for="dep in gameStore.departmentsForList"
        :key="dep.id"
        @click="handleGuess(dep.id)"
        :class="getDepartmentClass(dep)"
      >
        {{ dep.id }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from "../store/gameStore";

const gameStore = useGameStore();

const handleGuess = (departmentId: string) => {
  const status = gameStore.getDepartmentStatus(departmentId);
  // Prevent guessing if already fully correct (green)
  if (status === "correctBoth") return;
  // In "guessBoth" mode, if one part is correct (blue), clicking it again should still be handled by makeGuess
  // to potentially reveal the other part or handle the game flow as designed in the store.
  // So, no specific block here for "correctName" or "correctChefLieu" unless the game logic strictly forbids it.
  gameStore.makeGuess(departmentId);
};

const getDepartmentClass = (
  dep: (typeof gameStore.departmentsForList)[number],
) => {
  // Use the type from store
  return {
    "department-item": true,
    "correct-guess": dep.status === "correctBoth", // Green for fully correct
    "partially-correct-guess":
      dep.status === "correctName" || dep.status === "correctChefLieu", // Blue for partially correct
    "incorrect-guess": dep.status === "incorrect",
  };
};
</script>

<style scoped lang="scss">
.department-list-container {
  height: 100%; /* Fill the column */
  overflow-y: auto;
  background-color: var(--primary-dark);
  position: relative;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.department-item {
  padding: 12px 5px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  font-weight: 600;
  transition: var(--transition-default);
  color: rgba(255, 255, 255, 0.85);
  position: relative;
  overflow: hidden;
}

.department-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.department-item::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0;
  background-color: rgba(255, 255, 255, 0.1);
  transition: var(--transition-default);
}

.department-item:hover::after {
  height: 4px;
}

.correct-guess {
  background-color: var(--success-color);
  color: white;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}

.correct-guess:hover {
  background-color: var(--success-dark);
  cursor: not-allowed;
}

.partially-correct-guess {
  background-color: var(--secondary-color);
  color: white;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}

.partially-correct-guess:hover {
  background-color: var(--secondary-dark);
}

.incorrect-guess {
  background-color: var(--error-color);
  color: white;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}

.incorrect-guess:hover {
  background-color: var(--error-dark);
}
</style>
