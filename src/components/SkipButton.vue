<template>
  <button @click="skip" class="skip-button">Passer</button>
</template>

<script setup lang="ts">
import { useGameStore } from '../store/gameStore';

const gameStore = useGameStore();

const skip = () => {
  gameStore.skipDepartment();
};
</script>

<style scoped>
.skip-button {
  padding: 10px 20px;
  font-size: 1em;
  color: white;
  background-color: #f44336; /* Red */
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s ease;
}

.skip-button:hover {
  background-color: #d32f2f;
}
</style>
