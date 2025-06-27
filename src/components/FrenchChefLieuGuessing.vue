<template>
  <div class="french-chef-lieu-guessing-container">
    <div class="progress-indicator">
      Chef-lieux français
      {{
        totalFrenchChefLieux -
        frenchChefLieuStore.availableFrenchChefLieux.length +
        1
      }}
      /
      {{ totalFrenchChefLieux }}
      <span class="score">Score : {{ baseStore.score }}</span>
      <span class="accuracy">Précision : {{ baseStore.accuracy }}%</span>
    </div>

    <div class="question-area">
      <p class="instruction-text">Trouve le chef-lieu sur la carte :</p>
      <h2 class="target-name">
        {{ frenchChefLieuStore.currentQuestionDisplay }}
      </h2>

      <div class="controls">
        <SkipButton v-if="frenchChefLieuStore.currentFrenchChefLieu" />
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
        <!-- Chef-lieu markers -->
        <l-circle-marker
          v-for="chefLieu in validChefLieux"
          :key="`${chefLieu.id}-${frenchChefLieuStore.getFrenchChefLieuStatus(chefLieu.id)}`"
          :lat-lng="[chefLieu.lat, chefLieu.lng]"
          :radius="getChefLieuRadius(chefLieu)"
          :options="getChefLieuMarkerOptions(chefLieu)"
          @click="handleChefLieuClick(chefLieu.id, chefLieu.name)"
        />
      </l-map>
    </div>

    <div v-if="frenchChefLieuStore.isGameComplete" class="game-complete">
      <h2>Félicitations ! Tu as trouvé tous les chef-lieux français !</h2>
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
import { ref, onMounted, computed, watch } from "vue";
import { LMap, LTileLayer, LCircleMarker } from "@vue-leaflet/vue-leaflet";
import { useFrenchChefLieuStore } from "../store/frenchChefLieuStore";
import { useBaseGameStore } from "../store/baseGameStore";
import SkipButton from "./SkipButton.vue";
import { logGameCompletion } from "../utils/completionLogger";
import type { FrenchChefLieu } from "../types";
import "leaflet/dist/leaflet.css";

const frenchChefLieuStore = useFrenchChefLieuStore();
const baseStore = useBaseGameStore();
const totalFrenchChefLieux = computed(
  () => frenchChefLieuStore.totalFrenchChefLieux,
);

// Map configuration centered on France
const zoom = ref(6);
const center = ref([46.603354, 1.888334] as [number, number]); // France center
const mapRef = ref(null); // Map reference

// Store initial map state
const initialZoom = 6;
const initialCenter = [46.603354, 1.888334] as [number, number];

// Map options to disable zoom control
const mapOptions = {
  zoomControl: false,
};

// Helper function to validate coordinates
const isValidCoordinate = (lat: number, lng: number): boolean => {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
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

// Computed property for valid chef-lieux (filter out any with invalid coordinates)
const validChefLieux = computed(() => {
  return frenchChefLieuStore.frenchChefLieux.filter(
    (chefLieu) =>
      isValidCoordinate(chefLieu.lat, chefLieu.lng) &&
      // Only show metropolitan France chef-lieux
      !chefLieu.id.startsWith("97"),
  );
});

const getChefLieuRadius = (chefLieu: FrenchChefLieu) => {
  // Use a consistent radius for all chef-lieux
  const baseRadius = 6;

  // Make capital cities slightly larger
  const majorCities = ["75", "13", "69", "31", "59", "44", "67", "33", "35"];
  if (majorCities.includes(chefLieu.id)) {
    return baseRadius + 2;
  }

  return baseRadius;
};

const getChefLieuMarkerOptions = (chefLieu: FrenchChefLieu) => {
  const status = frenchChefLieuStore.getFrenchChefLieuStatus(chefLieu.id);

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

const handleChefLieuClick = (chefLieuId: string, chefLieuName: string) => {
  if (!frenchChefLieuStore.currentFrenchChefLieu) return;

  frenchChefLieuStore.makeFrenchChefLieuGuess(chefLieuId, chefLieuName);
};

const onMapReady = () => {
  // Map is ready, we can add any additional setup here if needed
};

const centerMap = () => {
  if (mapRef.value) {
    // Reset zoom and center to initial values
    zoom.value = initialZoom;
    center.value = [...initialCenter];

    // Use Leaflet's setView method for smooth transition
    const leafletMap = (mapRef.value as any).leafletObject;
    if (leafletMap) {
      leafletMap.setView(initialCenter, initialZoom, { animate: true });
    }
  }
};

const restartGame = () => {
  frenchChefLieuStore.initializeGame();
};

watch(
  () => frenchChefLieuStore.isGameComplete,
  (isComplete) => {
    if (isComplete) {
      logGameCompletion({
        modeName: "Chef-lieux français (carte)",
        totalTime: baseStore.elapsedTime,
        finalScore: baseStore.score,
        accuracy: baseStore.accuracy,
      });
    }
  },
);

onMounted(() => {
  // Initialize the French chef-lieux game if not already initialized
  if (!frenchChefLieuStore.currentFrenchChefLieu) {
    frenchChefLieuStore.initializeGame();
  }
});
</script>

<style scoped lang="scss">
.french-chef-lieu-guessing-container {
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

// Style for chef-lieu markers on hover
:global(.leaflet-interactive:hover) {
  cursor: pointer;
}

// Hide default Leaflet zoom controls
:global(.leaflet-control-zoom) {
  display: none !important;
}
</style>
