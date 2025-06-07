<template>
  <div class="russian-city-guessing-container">
    <div class="progress-indicator">
      Villes russes
      {{ totalRussianCities - russianCityStore.availableRussianCities.length + 1 }} /
      {{ totalRussianCities }}
      <span class="score">Score : {{ baseStore.score }}</span>
      <span class="accuracy">Précision : {{ baseStore.accuracy }}%</span>
    </div>
    <div class="question-area">
      <div class="language-switch">
        <button
          :class="['toggle-button', { active: !useRussian }]"
          @click="useRussian = false"
        >
          Français
        </button>
        <button
          :class="['toggle-button', { active: useRussian }]"
          @click="useRussian = true"
        >
          Русский
        </button>
      </div>

      <p class="instruction-text">Trouve la ville sur la carte :</p>
      <h2 class="target-name">{{ currentCityDisplayName }}</h2>

      <div class="controls">
        <SkipButton v-if="russianCityStore.currentRussianCity" />
      </div>
    </div>

    <div class="map-container">
      <l-map
        :zoom="zoom"
        :center="center"
        :use-global-leaflet="false"
        class="map"
        @ready="onMapReady"
      >
        <l-tile-layer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
        />
        <!-- City markers -->
        <l-circle-marker
          v-for="city in validCities"
          :key="`${city.id}-${russianCityStore.getRussianCityStatus(city.id)}`"
          :lat-lng="[city.lat, city.lng]"
          :radius="getCityRadius(city)"
          :options="getCityMarkerOptions(city)"
          @click="handleCityClick(city.id, city.name)"
        />
      </l-map>
    </div>

    <div v-if="russianCityStore.isGameComplete" class="game-complete">
      <h2>{{ baseStore.message }}</h2>
      <button @click="restartGame" class="restart-button">Recommencer</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { LMap, LTileLayer, LCircleMarker } from "@vue-leaflet/vue-leaflet";
import { useRussianCityStore } from "../store/russianCityStore";
import { useBaseGameStore } from "../store/baseGameStore";
import SkipButton from "./SkipButton.vue";
import type { RussianCity } from "../types";
import "leaflet/dist/leaflet.css";

const russianCityStore = useRussianCityStore();
const baseStore = useBaseGameStore();
const totalRussianCities = computed(() => russianCityStore.totalRussianCities);

// Map configuration centered on Russia
const zoom = ref(4);
const center = ref([55.7558, 37.6176] as [number, number]); // Moscow coordinates

// Language switch - default to Russian
const useRussian = ref(true);

// Computed property for current city display name
const currentCityDisplayName = computed(() => {
  if (!russianCityStore.currentRussianCity) return "";
  return useRussian.value
    ? russianCityStore.currentRussianCity.nameRu
    : russianCityStore.currentRussianCity.name;
});

// Helper function to validate coordinates
const isValidCoordinate = (lat: number, lng: number): boolean => {
  return (
    typeof lat === 'number' && 
    typeof lng === 'number' && 
    !isNaN(lat) && 
    !isNaN(lng) && 
    isFinite(lat) && 
    isFinite(lng) &&
    lat >= -90 && 
    lat <= 90 && 
    lng >= -180 && 
    lng <= 180
  );
};

// Computed property for valid cities (filter out any with invalid coordinates)
const validCities = computed(() => {
  return russianCityStore.russianCities.filter(city => 
    isValidCoordinate(city.lat, city.lng)
  );
});

const getCityRadius = (city: RussianCity) => {
  // Scale radius based on population (larger cities get bigger dots)
  const minRadius = 4;
  const maxRadius = 20;
  const minPop = 200000; // Lowered to include all cities in dataset
  const maxPop = 12000000; // Approximate population of Moscow

  // Ensure population is valid and within bounds
  if (!city.population || city.population <= 0) {
    return minRadius;
  }

  // Clamp population to minimum to avoid negative logarithms
  const clampedPop = Math.max(city.population, minPop);

  // Use a more sensitive scaling with power function for greater differentiation
  const normalizedPop = Math.log(clampedPop / minPop) / Math.log(maxPop / minPop);
  const poweredScale = Math.pow(Math.max(0, normalizedPop), 0.7); // Ensure non-negative input

  const radius = minRadius + (maxRadius - minRadius) * poweredScale;
  
  // Final safety check to ensure we return a valid number
  return isNaN(radius) ? minRadius : Math.max(minRadius, Math.min(maxRadius, radius));
};

const getCityMarkerOptions = (city: RussianCity) => {
  const status = russianCityStore.getRussianCityStatus(city.id);

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
  if (!russianCityStore.currentRussianCity) return;

  russianCityStore.makeRussianCityGuess(cityId, cityName);
};

const onMapReady = () => {
  // Map is ready, we can add any additional setup here if needed
};

const restartGame = () => {
  russianCityStore.initializeGame();
};

onMounted(() => {
  // Initialize the Russian cities game if not already initialized
  if (!russianCityStore.currentRussianCity) {
    russianCityStore.initializeGame();
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
  position: relative;

  .language-switch {
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;

    .toggle-button {
      padding: 8px 16px;
      border: 1px solid var(--border-color);
      background-color: var(--background-light);
      color: var(--text-secondary);
      font-size: 0.85em;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition-default);
      min-width: 80px;

      &:first-child {
        border-radius: 6px 6px 0 0;
        border-bottom: none;
      }

      &:last-child {
        border-radius: 0 0 6px 6px;
        border-top: none;
      }

      &:hover:not(.active) {
        background-color: var(--background-off);
      }

      &.active {
        background-color: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
        z-index: 1;
        position: relative;
      }
    }
  }

  .instruction-text {
    margin-bottom: 15px;
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
    }
  }
}

// Style for city markers on hover
:global(.leaflet-interactive:hover) {
  cursor: pointer;
}
</style>
