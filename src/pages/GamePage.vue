<template>
  <div class="game-page">
    <template v-if="appGameStore.currentGameMode === 'guessFlags'">
      <FlagGuessing class="full-width" />
    </template>
    <template v-else-if="appGameStore.currentGameMode === 'guessMapLocation'">
      <FrenchDepartmentGuessing class="full-width" />
    </template>
    <template
      v-else-if="appGameStore.currentGameMode === 'guessCountryMapLocation'"
    >
      <CountryMapGuessing class="full-width" />
    </template>
    <template v-else-if="appGameStore.currentGameMode === 'guessRussianCities'">
      <RussianCityGuessing class="full-width" />
    </template>
    <template v-else-if="appGameStore.currentGameMode === 'guessRussianOblasts'">
      <RussianOblastGuessing class="full-width" />
    </template>
    <template
      v-else-if="appGameStore.currentGameMode === 'guessFrenchChefLieux'"
    >
      <FrenchChefLieuGuessing class="full-width" />
    </template>
    <template v-else-if="appGameStore.currentGameMode === 'guessWorldCapitals'">
      <WorldCapitalsGuessing class="full-width" />
    </template>
    <template
      v-else-if="appGameStore.currentGameMode === 'guessCountryFromCapital'"
    >
      <WorldCapitalsGuessing class="full-width" />
    </template>
    <template v-else>
      <GuessingArea class="guessing-area-main" />
      <DepartmentList class="department-list-column" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAppGameStore } from "../store/gameStoreAdapter";
import DepartmentList from "../components/DepartmentList.vue";
import GuessingArea from "../components/GuessingArea.vue";
import FlagGuessing from "../components/FlagGuessing.vue";
import FrenchDepartmentGuessing from "../components/FrenchDepartmentGuessing.vue";
import CountryMapGuessing from "../components/CountryMapGuessing.vue";
import RussianCityGuessing from "../components/RussianCityGuessing.vue";
import RussianOblastGuessing from "../components/RussianOblastGuessing.vue";
import FrenchChefLieuGuessing from "../components/FrenchChefLieuGuessing.vue";
import WorldCapitalsGuessing from "../components/WorldCapitalsGuessing.vue";

const appGameStore = useAppGameStore();
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
