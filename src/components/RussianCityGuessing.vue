<template>
  <div class="russian-city-guessing-container">
    <div class="progress-indicator">
      Villes russes
      {{ totalRussianCities - gameStore.availableRussianCities.length + 1 }} /
      {{ totalRussianCities }}
      <span class="score">Score : {{ gameStore.score }}</span>
      <span class="accuracy">Précision : {{ gameStore.accuracy }}%</span>
    </div>    <div class="question-area">
      <div class="alphabet-switch">
        <label class="switch-label">
          <input 
            type="checkbox" 
            v-model="useCyrillic" 
            class="switch-input"
          />
          <span class="switch-slider"></span>
          <span class="switch-text">{{ useCyrillic ? 'Кириллица' : 'Latin' }}</span>
        </label>
      </div>
      
      <p class="instruction-text">Trouve la ville sur la carte :</p>
      <h2 class="target-name">{{ currentCityDisplayName }}</h2>
      
      <div class="controls">
        <SkipButton v-if="gameStore.currentRussianCity" />
      </div>
    </div>

    <div class="map-container">
      <l-map
        :zoom="zoom"
        :center="center"
        :use-global-leaflet="false"
        class="map"
        @ready="onMapReady"
      >        <l-tile-layer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
        />
          <!-- City markers -->
        <l-circle-marker
          v-for="city in gameStore.russianCities"
          :key="city.id"
          :lat-lng="[city.lat, city.lng]"
          :radius="getCityRadius(city)"
          :options="getCityMarkerOptions(city)"
          @click="handleCityClick(city.id, city.name)"
        />
      </l-map>
    </div>

    <div v-if="gameStore.isGameComplete" class="game-complete">
      <h2>{{ gameStore.message }}</h2>
      <button @click="restartGame" class="restart-button">Recommencer</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { LMap, LTileLayer, LCircleMarker } from "@vue-leaflet/vue-leaflet";
import { useGameStore } from "../store/gameStore";
import SkipButton from "./SkipButton.vue";
import type { RussianCity } from "../types";
import "leaflet/dist/leaflet.css";

const gameStore = useGameStore();
const totalRussianCities = computed(() => gameStore.totalRussianCities);

// Map configuration centered on Russia
const zoom = ref(4);
const center = ref([55.7558, 37.6176] as [number, number]); // Moscow coordinates

// Alphabet switch - default to Cyrillic
const useCyrillic = ref(true);

// Computed property for current city display name
const currentCityDisplayName = computed(() => {
  if (!gameStore.currentRussianCity) return "";
  return useCyrillic.value 
    ? gameStore.currentRussianCity.nameRu 
    : gameStore.currentRussianCity.name;
});

const getCityRadius = (city: RussianCity) => {
  // Scale radius based on population (larger cities get bigger dots)
  const minRadius = 6;
  const maxRadius = 15;
  const minPop = 100000;
  const maxPop = 12000000; // Approximate population of Moscow
  
  const normalizedPop = Math.log(city.population / minPop) / Math.log(maxPop / minPop);
  return Math.max(minRadius, Math.min(maxRadius, minRadius + (maxRadius - minRadius) * normalizedPop));
};

const getCityMarkerOptions = (city: RussianCity) => {
  const status = gameStore.getRussianCityStatus(city.id);
  
  switch (status) {
    case "correct":
      return {
        color: "#4caf50",
        fillColor: "#4caf50",
        fillOpacity: 0.8,
        weight: 3,
      };
    default:
      return {
        color: "#2196f3",
        fillColor: "#2196f3",
        fillOpacity: 0.6,
        weight: 2,
      };
  }
};

const handleCityClick = (cityId: string, cityName: string) => {
  if (!gameStore.currentRussianCity) return;
  
  gameStore.makeRussianCityGuess(cityId, cityName);
};

const onMapReady = () => {
  // Map is ready, we can add any additional setup here if needed
};

const restartGame = () => {
  gameStore.initializeGame();
};

onMounted(() => {
  // Initialize the Russian cities game if not already initialized
  if (gameStore.gameMode === "guessRussianCities" && !gameStore.currentRussianCity) {
    gameStore.initializeGame();
  }
});
</script>

<style scoped lang="scss">
.russian-city-guessing-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--background-light);
}

.progress-indicator {
  padding: 15px 20px;
  background-color: var(--background-off);
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  color: var(--text-primary);
  
  .score {
    margin-left: 20px;
    color: var(--primary-color);
  }

  .accuracy {
    margin-left: 20px;
    color: var(--secondary-color);
    font-weight: 700;
  }
}

.question-area {
  padding: 20px;
  text-align: center;
  background-color: var(--background-light);
  border-bottom: 1px solid var(--border-color);

  .alphabet-switch {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 15px;

    .switch-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      user-select: none;
    }

    .switch-input {
      display: none;
    }

    .switch-slider {
      position: relative;
      width: 50px;
      height: 24px;
      background-color: var(--border-color);
      border-radius: 12px;
      transition: var(--transition-default);
      cursor: pointer;

      &::before {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        background-color: white;
        border-radius: 50%;
        transition: var(--transition-default);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
    }

    .switch-input:checked + .switch-slider {
      background-color: var(--primary-color);

      &::before {
        transform: translateX(26px);
      }
    }

    .switch-text {
      font-size: 0.9em;
      font-weight: 600;
      color: var(--text-secondary);
      min-width: 60px;
    }
  }

  .instruction-text {
    margin-bottom: 10px;
    color: var(--text-secondary);
    font-size: 1.1em;
  }

  .target-name {
    margin-bottom: 15px;
    color: var(--primary-color);
    font-size: 1.8em;
    font-weight: 600;
  }

  .controls {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.map-container {
  flex: 1;
  position: relative;

  .map {
    height: 100%;
    width: 100%;
  }
}

.game-complete {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--background-light);
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  z-index: 1000;

  h2 {
    margin-bottom: 20px;
    color: var(--success-color);
  }

  .restart-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 1.1em;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-default);

    &:hover {
      background-color: var(--primary-light);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
    }  }
}

// Style for city markers on hover
:global(.leaflet-interactive:hover) {
  cursor: pointer;
}
</style>
