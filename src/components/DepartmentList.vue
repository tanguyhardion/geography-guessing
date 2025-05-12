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

<style scoped>
.department-list-container {
  height: 100%; /* Fill the column */
  overflow-y: auto;
  background-color: #f9f9f9;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.department-item {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  text-align: center;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.department-item:hover {
  background-color: #e0e0e0;
}

.correct-guess {
  background-color: #a5d6a7; /* Light green */
  color: #1b5e20; /* Dark green text */
}

.correct-guess:hover {
  background-color: #81c784;
  cursor: not-allowed; /* Prevent hover effect */
}

.partially-correct-guess {
  /* New style for blue */
  background-color: #90caf9; /* Light blue */
  color: #0d47a1; /* Dark blue text */
}

.partially-correct-guess:hover {
  background-color: #64b5f6;
}

.incorrect-guess {
  background-color: #ef9a9a; /* Light red */
  color: #c62828; /* Dark red text */
}

.incorrect-guess:hover {
  background-color: #e57373;
}
</style>
