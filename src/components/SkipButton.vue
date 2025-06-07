<template>
  <button @click="skip" class="skip-button">Passer</button>
</template>

<script setup lang="ts">
import { useGameStore } from "../store/gameStore";

const gameStore = useGameStore();

const skip = () => {
  gameStore.skipDepartment();
};
</script>

<style scoped lang="scss">
.skip-button {
  padding: 10px 22px;
  font-size: 0.95em;
  color: white;
  background-color: var(--error-color);
  border: none;
  cursor: pointer;
  margin-top: 15px;
  transition: var(--transition-default);
  border-radius: 20px;
  font-weight: 600;
}
</style>
