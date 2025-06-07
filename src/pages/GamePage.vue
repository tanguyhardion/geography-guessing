<template>
  <div class="game-page">
    <template v-if="gameStore.gameMode === 'guessFlags'">
      <FlagGuessing class="full-width" />
    </template>
    <template v-else-if="gameStore.gameMode === 'guessMapLocation'">
      <MapGuessing class="full-width" />
    </template>
    <template v-else-if="gameStore.gameMode === 'guessCountryMapLocation'">
      <CountryMapGuessing class="full-width" />
    </template>
    <template v-else-if="gameStore.gameMode === 'guessRussianCities'">
      <RussianCityGuessing class="full-width" />
    </template>
    <template v-else>
      <GuessingArea class="guessing-area-main" />
      <DepartmentList class="department-list-column" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from "../store/gameStore";
import DepartmentList from "../components/DepartmentList.vue";
import GuessingArea from "../components/GuessingArea.vue";
import FlagGuessing from "../components/FlagGuessing.vue";
import MapGuessing from "../components/MapGuessing.vue";
import CountryMapGuessing from "../components/CountryMapGuessing.vue";
import RussianCityGuessing from "../components/RussianCityGuessing.vue";

const gameStore = useGameStore();
</script>

<style scoped lang="scss">
.game-page {
  display: flex;
  flex-grow: 1; /* Fill available space in main */
  width: 100%;
  background-color: var(--background-light);
}

.department-list-column {
  width: 80px; /* Fixed width for the scrollable list */
  flex-shrink: 0; /* Prevent shrinking */
  overflow-y: auto;
  position: relative;
}

.guessing-area-main {
  flex-grow: 1;
  padding: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--background-off);
  position: relative;
}

.full-width {
  width: 100%;
}
</style>
