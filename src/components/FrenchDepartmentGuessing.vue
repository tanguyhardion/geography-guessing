<template>
  <div class="map-guessing-container">
    <div class="progress-indicator">
      Département
      {{ totalDepartments - departmentStore.availableDepartments.length + 1 }} /
      {{ totalDepartments }}
      <span class="score">Score : {{ baseStore.score }}</span>
      <span class="accuracy">Précision : {{ baseStore.accuracy }}%</span>
    </div>

    <div class="question-area">
      <p class="instruction-text">Trouve le département sur la carte :</p>
      <h2 class="target-name">{{ departmentStore.currentQuestionDisplay }}</h2>
      <SkipButton v-if="departmentStore.currentDepartment" />
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
          v-if="geojson"
          :geojson="geojson"
          :options="geojsonOptions"
        />
      </l-map>
    </div>

    <div v-if="showCompletionPopup" class="game-complete">
      <h2>Félicitations ! Tu as deviné tous les départements !</h2>
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
import { LMap, LTileLayer, LGeoJson } from "@vue-leaflet/vue-leaflet";
import { useDepartmentStore } from "../store/departmentStore";
import { useBaseGameStore } from "../store/baseGameStore";
import SkipButton from "./SkipButton.vue";
import { logGameCompletion } from "../utils/completionLogger";
import "leaflet/dist/leaflet.css";

const departmentStore = useDepartmentStore();
const baseStore = useBaseGameStore();
const totalDepartments = computed(() => departmentStore.totalDepartments);

const zoom = ref(6);
const center = ref([46.603354, 1.888334] as [number, number]);
const mapRef = ref(null); // Map reference
const geojson = ref(null);
const mapLayers = ref(new Map()); // Store reference to map layers by department code

// Store initial map state
const initialZoom = 6;
const initialCenter = [46.603354, 1.888334] as [number, number];

// Map options to disable zoom control
const mapOptions = {
  zoomControl: false,
};

const getDepartmentStatus = (departmentCode: string) => {
  return departmentStore.getDepartmentStatus(departmentCode);
};

const getDepartmentStyle = (status: string) => {
  switch (status) {
    case "correct":
    case "correctBoth":
      return {
        weight: 2,
        color: "#4caf50",
        fillColor: "#4caf50",
        fillOpacity: 0.6,
      };
    case "correctName":
    case "correctChefLieu":
      return {
        weight: 2,
        color: "#ff9800",
        fillColor: "#ff9800",
        fillOpacity: 0.6,
      };
    default:
      return {
        weight: 2,
        color: "#3388ff",
        fillColor: "#3388ff",
        fillOpacity: 0.2,
      };
  }
};

const geojsonOptions = {
  style: (feature: any) => {
    const departmentCode = feature.properties.code;
    const status = getDepartmentStatus(departmentCode);
    return getDepartmentStyle(status);
  },
  onEachFeature: (feature: any, layer: any) => {
    const departmentCode = feature.properties.code;

    // Store layer reference for later style updates
    mapLayers.value.set(departmentCode, layer);

    layer.on({
      mouseover: (e: any) => {
        const status = getDepartmentStatus(departmentCode);
        const hoverStyle = getDepartmentStyle(status);
        e.target.setStyle({
          ...hoverStyle,
          weight: 4,
          fillOpacity: Math.min(hoverStyle.fillOpacity + 0.3, 1),
        });
      },
      mouseout: (e: any) => {
        const status = getDepartmentStatus(departmentCode);
        e.target.setStyle(getDepartmentStyle(status));
      },
      click: (e: any) => {
        const departmentName = feature.properties.nom; // Get department name from GeoJSON
        handleDepartmentClick(departmentCode, departmentName);
      },
    });
  },
};

const forceLayerStyleUpdate = (departmentCode: string, style: any) => {
  const layer = mapLayers.value.get(departmentCode);
  if (layer) {
    layer.setStyle(style);
  }
};

const handleDepartmentClick = (
  departmentCode: string,
  departmentName?: string,
) => {
  if (!departmentStore.currentDepartment) return;

  const currentDepartmentId = departmentStore.currentDepartment.id;
  departmentStore.makeGuess(departmentCode, departmentName);

  // If this was a correct guess, immediately update the visual style
  if (departmentCode === currentDepartmentId) {
    // Find the layer that was clicked and update its style
    // We need to wait for the next tick for the status to be updated
    setTimeout(() => {
      const status = getDepartmentStatus(departmentCode);
      // Find the layer in the geojson and update it
      if (geojson.value) {
        // Force re-render of the layer style
        const layerStyle = getDepartmentStyle(status);
        // This will be handled by Vue's reactivity when the geojsonOptions style function is called
        // But we need to force an immediate visual update
        forceLayerStyleUpdate(departmentCode, layerStyle);
      }
    }, 0);
  }
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
  departmentStore.initializeGame();
};

const showCompletionPopup = ref(false);

// Watch for game completion and delay popup
watch(
  () => departmentStore.isGameComplete,
  (isComplete) => {
    if (isComplete) {
      logGameCompletion({
        modeName: "Départements français (carte)",
        totalTime: baseStore.elapsedTime,
        finalScore: baseStore.score,
        accuracy: baseStore.accuracy,
      });
      showCompletionPopup.value = false;
      setTimeout(() => {
        showCompletionPopup.value = true;
      }, 1200); // 1.2s delay for toast breathing room
    } else {
      showCompletionPopup.value = false;
    }
  },
);

onMounted(async () => {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson",
    );
    geojson.value = await response.json();
  } catch (error) {
    // Silently handle error
  }
});
</script>

<style scoped lang="scss">
.map-guessing-container {
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

    &:hover {
      background-color: #f4f4f4;
      border-color: transparent;
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
    color: var(--text-primary);

    p {
      margin: 5px 0;
      font-size: 1.1em;

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

    &:hover {
      background-color: var(--primary-light);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
    }
  }
}

// Hide default Leaflet zoom controls
:global(.leaflet-control-zoom) {
  display: none !important;
}
</style>
