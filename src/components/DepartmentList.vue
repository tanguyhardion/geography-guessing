<template>
  <div class="department-list-container">
    <ul>
      <li
        v-for="dep in gameStore.departmentsForList"
        :key="dep.id"
        @click="handleGuess(dep.id)"
        :class="getDepartmentClass(dep.status)"
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
  // Prevent guessing if already correct
  if (gameStore.getDepartmentStatus(departmentId) === "correct") return;
  gameStore.makeGuess(departmentId);
};

const getDepartmentClass = (status: "correct" | "incorrect" | "default") => {
  return {
    "department-item": true,
    "correct-guess": status === "correct",
    "incorrect-guess": status === "incorrect",
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
}

.incorrect-guess {
  background-color: #ef9a9a; /* Light red */
  color: #c62828; /* Dark red text */
}

.incorrect-guess:hover {
  background-color: #e57373;
}
</style>
