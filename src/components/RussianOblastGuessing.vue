<template>
  <div class="russian-oblast-guessing-container">
    <div class="progress-indicator">
      Oblasts de Russie
      {{
        totalRussianOblasts -
        russianOblastStore.availableRussianOblasts.length +
        1
      }}
      /
      {{ totalRussianOblasts }}
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
          English
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
          <span>{{ useRussian ? "RU" : "EN" }}</span>
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
            English
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

      <p class="instruction-text">Trouve la région sur la carte :</p>

      <h2 class="target-name">{{ currentOblastDisplayName }}</h2>

      <div class="controls">
        <SkipButton v-if="russianOblastStore.currentRussianOblast" />
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
        <!-- Oblast polygons from GeoJSON -->
        <l-geo-json
          v-if="geojson"
          :geojson="geojson"
          :options="geoJsonOptions"
        />
      </l-map>
    </div>

    <div v-if="russianOblastStore.isGameComplete" class="game-complete">
      <h2>Félicitations ! Tu as localisé toutes les régions !</h2>
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
import { ref, onMounted, computed, onUnmounted, watch } from "vue";
import { LMap, LTileLayer, LGeoJson } from "@vue-leaflet/vue-leaflet";
import { useRussianOblastStore } from "../store/russianOblastStore";
import { useBaseGameStore } from "../store/baseGameStore";
import SkipButton from "./SkipButton.vue";
import { logGameCompletion } from "../utils/completionLogger";
import "leaflet/dist/leaflet.css";

const russianOblastStore = useRussianOblastStore();
const baseStore = useBaseGameStore();
const totalRussianOblasts = computed(
  () => russianOblastStore.totalRussianOblasts,
);

// Map configuration centered on Russia
const zoom = ref(3);
const center = ref([64.6863, 97.7453] as [number, number]); // Geographic center of Russia
const mapRef = ref(null); // Map reference

// Store initial map state
const initialZoom = 3;
const initialCenter = [64.6863, 97.7453] as [number, number];

// Map options to disable zoom control
const mapOptions = {
  zoomControl: false,
};

// Language switch - default to Russian
const useRussian = ref(true);

// Mobile language menu
const showLanguageMenu = ref(false);

// GeoJSON data
const geojson = ref(null);
const mapLayers = ref(new Map()); // Store reference to map layers by oblast ID

// Computed property for current oblast display name
const currentOblastDisplayName = computed(() => {
  if (!russianOblastStore.currentRussianOblast) return "";
  return useRussian.value && russianOblastStore.currentRussianOblast.nameRu
    ? russianOblastStore.currentRussianOblast.nameRu
    : russianOblastStore.currentRussianOblast.name;
});

// GeoJSON options for styling
const geoJsonOptions = {
  style: (feature: any) => {
    const status = russianOblastStore.getRussianOblastStatus(
      feature.properties.iso,
    );
    return getOblastStyle(status);
  },
  onEachFeature: (feature: any, layer: any) => {
    const oblastId = feature.properties.iso;

    // Store layer reference for later style updates
    mapLayers.value.set(oblastId, layer);

    layer.on({
      click: () =>
        handleOblastClick(feature.properties.iso, feature.properties.name),
      mouseover: (e: any) => {
        const layer = e.target;
        const status = russianOblastStore.getRussianOblastStatus(oblastId);
        const hoverStyle = getOblastStyle(status);
        layer.setStyle({
          ...hoverStyle,
          weight: Math.max(hoverStyle.weight + 1, 3),
          fillOpacity: Math.min(hoverStyle.fillOpacity + 0.2, 1),
        });
      },
      mouseout: (e: any) => {
        const layer = e.target;
        const status = russianOblastStore.getRussianOblastStatus(oblastId);
        layer.setStyle(getOblastStyle(status));
      },
    });
  },
};

const getOblastStyle = (status: string) => {
  switch (status) {
    case "correct":
      return {
        color: "#4caf50",
        fillColor: "#4caf50",
        fillOpacity: 0.6,
        weight: 2,
      };
    default:
      return {
        color: "#2196f3",
        fillColor: "#2196f3",
        fillOpacity: 0.3,
        weight: 1,
      };
  }
};

const forceLayerStyleUpdate = (oblastId: string, style: any) => {
  const layer = mapLayers.value.get(oblastId);
  if (layer) {
    layer.setStyle(style);
  }
};

const handleOblastClick = (oblastId: string, oblastName: string) => {
  if (!russianOblastStore.currentRussianOblast) return;

  const currentOblastId = russianOblastStore.currentRussianOblast.id;
  russianOblastStore.makeRussianOblastGuess(
    oblastId,
    oblastName,
    useRussian.value,
  );

  // If this was a correct guess, immediately update the visual style
  if (oblastId === currentOblastId) {
    // Force immediate visual update
    setTimeout(() => {
      const status = russianOblastStore.getRussianOblastStatus(oblastId);
      const layerStyle = getOblastStyle(status);
      forceLayerStyleUpdate(oblastId, layerStyle);
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
  russianOblastStore.initializeGame();
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
  const menu = document.querySelector(".language-menu");
  if (menu && !menu.contains(target)) {
    showLanguageMenu.value = false;
  }
};

onMounted(async () => {
  // Initialize the Russian oblasts game if not already initialized
  if (!russianOblastStore.currentRussianOblast) {
    russianOblastStore.initializeGame();
  }

  // Add click outside listener for mobile menu
  document.addEventListener("click", closeLanguageMenu); // Load GeoJSON data from public folder
  try {
    const response = await fetch("/geography-guessing/oblasts.json");
    geojson.value = await response.json();
  } catch (error) {
    // Silently handle error
    console.warn("Failed to load oblasts GeoJSON:", error);
  }
});

// Watch for game completion and log to localStorage
watch(
  () => russianOblastStore.isGameComplete,
  (isComplete) => {
    if (isComplete) {
      logGameCompletion({
        modeName: "Russian Oblasts Map",
        totalTime: baseStore.elapsedTime,
        finalScore: baseStore.score,
        accuracy: baseStore.accuracy,
      });
    }
  },
);

// Clean up event listener
onUnmounted(() => {
  document.removeEventListener("click", closeLanguageMenu);
});
</script>

<style scoped lang="scss">
.russian-oblast-guessing-container {
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

// Style for oblast polygons on hover
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

// Hide default Leaflet zoom controls
:global(.leaflet-control-zoom) {
  display: none !important;
}
</style>
