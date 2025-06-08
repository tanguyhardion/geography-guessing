<template>
  <div class="russian-city-guessing-container">
    <div class="progress-indicator">
      Villes de Russie
      {{ totalRussianCities - russianCityStore.availableRussianCities.length + 1 }} /
      {{ totalRussianCities }}
      <span class="score">Score : {{ baseStore.score }}</span>
      <span class="accuracy">Précision : {{ baseStore.accuracy }}%</span>
    </div>
    <div class="question-area">
      <!-- Desktop language switch -->
      <div class="language-switch desktop-only">
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

      <!-- Mobile language menu -->
      <div class="language-menu mobile-only">
        <button class="language-menu-button" @click="toggleLanguageMenu">
          <span>{{ useRussian ? 'RU' : 'FR' }}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <div v-if="showLanguageMenu" class="language-dropdown">
          <button 
            :class="['dropdown-item', { active: !useRussian }]"
            @click="selectLanguage(false)"
          >
            Français
          </button>
          <button 
            :class="['dropdown-item', { active: useRussian }]"
            @click="selectLanguage(true)"
          >
            Русский
          </button>
        </div>
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
import { ref, onMounted, computed, onUnmounted } from "vue";
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

// Mobile language menu
const showLanguageMenu = ref(false);

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

const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value;
};

const selectLanguage = (russian: boolean) => {
  useRussian.value = russian;
  showLanguageMenu.value = false;
};

// Close menu when clicking outside
const closeLanguageMenu = (event: Event) => {
  const target = event.target as HTMLElement;
  const menu = document.querySelector('.language-menu');
  if (menu && !menu.contains(target)) {
    showLanguageMenu.value = false;
  }
};

onMounted(() => {
  // Initialize the Russian cities game if not already initialized
  if (!russianCityStore.currentRussianCity) {
    russianCityStore.initializeGame();
  }
  
  // Add click outside listener for mobile menu
  document.addEventListener('click', closeLanguageMenu);
});

// Clean up event listener
onUnmounted(() => {
  document.removeEventListener('click', closeLanguageMenu);
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
    white-space: nowrap;
  }

  .accuracy {
    margin-left: 20px;
    color: var(--secondary-color);
    font-weight: 700;
    white-space: nowrap;
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
    bottom: 15px;
    left: 15px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    overflow: hidden;
    background-color: var(--background-light);

    .toggle-button {
      padding: 8px 16px;
      border: none;
      background-color: var(--background-light);
      color: var(--text-secondary);
      font-size: 0.85em;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 70px;
      touch-action: manipulation;
      position: relative;
      z-index: 2;

      &:hover:not(.active) {
        background-color: var(--background-off);
        color: var(--text-primary);
      }

      &.active {
        background-color: var(--primary-color);
        color: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
      }
    }
  }

  .language-menu {
    position: absolute;
    bottom: 15px;
    left: 15px;
    display: none;

    .language-menu-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      border: none;
      border-radius: 12px;
      background-color: var(--background-light);
      color: var(--text-secondary);
      font-size: 0.9em;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      touch-action: manipulation;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      min-width: 80px;
      justify-content: space-between;

      &:hover {
        background-color: var(--background-off);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
      }

      svg {
        transition: transform 0.3s ease;
        opacity: 0.7;
      }

      &.open svg {
        transform: rotate(180deg);
      }
    }

    .language-dropdown {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 0;
      background-color: var(--background-light);
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      z-index: 1000;
      min-width: 120px;
      animation: dropdownFadeIn 0.2s ease-out;

      .dropdown-item {
        display: block;
        width: 100%;
        padding: 14px 18px;
        border: none;
        background: none;
        text-align: left;
        font-size: 0.85em;
        font-weight: 600;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;
        touch-action: manipulation;
        margin: 0;
        border-radius: 0;

        &:first-child {
          border-radius: 12px 12px 0 0;
        }

        &:last-child {
          border-radius: 0 0 12px 12px;
        }

        &:only-child {
          border-radius: 12px;
        }

        &:hover {
          background-color: var(--background-off);
          color: var(--text-primary);
        }

        &.active {
          background-color: var(--primary-color);
          color: white;
          position: relative;
        }
      }
    }
  }

  // Show/hide based on screen size
  .desktop-only {
    display: flex;
  }

  .mobile-only {
    display: none;
  }

  @media (max-width: 768px) {
    .desktop-only {
      display: none;
    }

    .mobile-only {
      display: block;
    }

    .language-menu {
      bottom: 10px;
      left: 10px;
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

// Dropdown animation
@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
