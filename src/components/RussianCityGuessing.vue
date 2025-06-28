<template>
  <div class="russian-city-guessing-container">
    <div class="progress-indicator">
      Villes de Russie
      {{
        totalRussianCities - russianCityStore.availableRussianCities.length + 1
      }}
      /
      {{ totalRussianCities }}
      <span class="score">Score : {{ baseStore.score }}</span>
      <span class="accuracy">Précision : {{ baseStore.accuracy }}%</span>
    </div>
    <div class="question-area">
      <!-- Desktop language switch -->
      <div class="language-switch desktop-only">
        <button
          v-click-animate
          :class="['toggle-button', { active: !useRussian }]"
          @click="useRussian = false"
        >
          Français
        </button>
        <button
          v-click-animate
          :class="['toggle-button', { active: useRussian }]"
          @click="useRussian = true"
        >
          Русский
        </button>
      </div>

      <!-- Mobile language menu -->
      <div class="language-menu mobile-only">
        <button
          v-click-animate
          class="language-menu-button"
          @click="toggleLanguageMenu"
        >
          <span>{{ useRussian ? "RU" : "FR" }}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              stroke-width="1.5"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <div v-if="showLanguageMenu" class="language-dropdown">
          <button
            v-click-animate
            :class="['dropdown-item', { active: !useRussian }]"
            @click="selectLanguage(false)"
          >
            Français
          </button>
          <button
            v-click-animate
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
      <button
        v-click-animate
        @click="centerMap"
        class="center-map-button"
        title="Centrer la carte"
      >
        <img
          src="https://cdn-icons-png.flaticon.com/128/795/795653.png"
          alt="Center map"
          width="24"
          height="24"
        />
      </button>
      <l-map
        ref="mapRef"
        :zoom="zoom"
        :center="center"
        :use-global-leaflet="false"
        :options="mapOptions"
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
      <h2>Félicitations ! Tu as localisé toutes les villes !</h2>
      <div class="summary">
        <p><strong>Temps final :</strong> {{ baseStore.formattedTime }}</p>
        <p><strong>Score final :</strong> {{ baseStore.score }}</p>
        <p><strong>Précision :</strong> {{ baseStore.accuracy }}%</p>
      </div>
      <button v-click-animate @click="restartGame" class="restart-button">
        Recommencer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import SkipButton from "./SkipButton.vue";
import { LMap, LTileLayer, LCircleMarker } from "@vue-leaflet/vue-leaflet";
import { useRussianCityGuessing } from "../composables/useRussianCityGuessing";
import type { RussianCity } from "../types";
import "leaflet/dist/leaflet.css";

defineProps();
defineEmits();

// All Russian city guessing logic is now handled by the composable
// This keeps the component clean and maintainable
const {
  russianCityStore,
  baseStore,
  totalRussianCities,
  validCities,
  getCityRadius,
  getCityMarkerOptions,
  handleCityClick,
  zoom,
  center,
  mapRef,
  mapOptions,
  centerMap,
  restartGame,
  onMapReady,
  useRussian,
  showLanguageMenu,
  toggleLanguageMenu,
  selectLanguage,
  currentCityDisplayName,
} = useRussianCityGuessing();
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

  .center-map-button {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1000;
    background-color: white;
    border: 2px solid rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    width: 30px;
    height: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
    color: #333;
    outline: none;

    // Prevent default browser button styling
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;

    // Prevent focus outline and color changes
    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    &:focus:not(:focus-visible) {
      outline: none;
    }

    &:active {
      background-color: #e8e8e8;
    }

    // Ensure image inherits styling
    img {
      pointer-events: none;
      opacity: 0.8;
    }
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

  .summary {
    margin-bottom: 20px;
    text-align: left;
    font-size: 0.9em;
    color: var(--text-primary);

    p {
      margin: 5px 0;
    }
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
  }
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

// Hide default Leaflet zoom controls
:global(.leaflet-control-zoom) {
  display: none !important;
}
</style>
