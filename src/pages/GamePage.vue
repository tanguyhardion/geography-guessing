<template>
  <div class="game-page">
    <DepartmentList class="department-list-column" />
    <GuessingArea class="guessing-area-main" />
  </div>
</template>

<script setup lang="ts">
import DepartmentList from '../components/DepartmentList.vue';
import GuessingArea from '../components/GuessingArea.vue';
</script>

<style scoped>
.game-page {
  display: flex;
  flex-grow: 1; /* Fill available space in main */
  width: 100%;
}

.department-list-column {
  width: 80px; /* Fixed width for the scrollable list */
  flex-shrink: 0; /* Prevent shrinking */
  overflow-y: auto;
  border-right: 1px solid #ddd;
}

.guessing-area-main {
  flex-grow: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
