<template>
  <div class="country-map-guessing-container">
    <div class="progress-indicator">
      Pays
      {{ totalCountries - countryMapStore.availableCountries.length + 1 }} /
      {{ totalCountries }}
      <span class="score">Score : {{ baseStore.score }}</span>
      <span class="accuracy">Précision : {{ baseStore.accuracy }}%</span>
    </div>

    <div class="question-area">
      <p class="instruction-text">Trouve le pays sur la carte :</p>
      <h2 class="target-name">{{ countryMapStore.currentQuestionDisplay }}</h2>
      <SkipButton v-if="countryMapStore.currentCountry" />
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
        <l-geo-json
          v-if="filteredGeojson"
          :key="`geojson-${countryMapStore.selectedContinent || 'all'}-${countryMapStore.continentCountries.length}`"
          :geojson="filteredGeojson"
          :options="geojsonOptions"
        />
      </l-map>
    </div>

    <div v-if="countryMapStore.isGameComplete" class="game-complete">
      <h2>Félicitations ! Tu as localisé tous les pays !</h2>
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
import { LMap, LTileLayer, LGeoJson } from "@vue-leaflet/vue-leaflet";
import { useCountryMapGuessing } from "../composables/useCountryMapGuessing";
import "leaflet/dist/leaflet.css";

// Register map components locally for <script setup>
defineProps();
defineEmits();

// All country map guessing logic is now handled by the composable
// This keeps the component clean and maintainable
const {
  countryMapStore,
  baseStore,
  totalCountries,
  filteredGeojson,
  geojsonOptions,
  zoom,
  center,
  mapRef,
  mapOptions,
  centerMap,
  restartGame,
  onMapReady,
} = useCountryMapGuessing();
</script>

<style scoped lang="scss">
.country-map-guessing-container {
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

    p {
      margin: 5px 0;
      color: var(--text-primary);

      strong {
        color: var(--primary-color);
      }
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

// Custom tooltip styling
:global(.country-tooltip) {
  background-color: var(--background-dark) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 8px !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  padding: 8px 12px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;

  &::before {
    border-top-color: var(--background-dark) !important;
  }
}

// Hide default Leaflet zoom controls
:global(.leaflet-control-zoom) {
  display: none !important;
}
</style>
