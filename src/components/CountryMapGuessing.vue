<template>
  <div class="country-map-guessing-container">
    <div class="progress-indicator">
      Pays
      {{ totalCountries - gameStore.availableCountries.length + 1 }} /
      {{ totalCountries }}
      <span class="score">Score : {{ gameStore.score }}</span>
      <span class="accuracy">Précision : {{ gameStore.accuracy }}%</span>
    </div>

    <div class="question-area">
      <p class="instruction-text">Trouve le pays sur la carte :</p>
      <h2 class="target-name">{{ gameStore.currentQuestionDisplay }}</h2>
      <SkipButton v-if="gameStore.currentCountry" />
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
        <l-geo-json
          v-if="geojson"
          :geojson="geojson"
          :options="geojsonOptions"
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
import { LMap, LTileLayer, LGeoJson } from "@vue-leaflet/vue-leaflet";
import { useGameStore } from "../store/gameStore";
import SkipButton from "./SkipButton.vue";
import "leaflet/dist/leaflet.css";

const gameStore = useGameStore();
const totalCountries = computed(() => gameStore.totalCountries);

const zoom = ref(2);
const center = ref([20, 0] as [number, number]); // World center
const geojson = ref(null);
const mapLayers = ref(new Map()); // Store reference to map layers by country code

const getCountryStatus = (countryCode: string) => {
  return gameStore.getCountryStatus(countryCode);
};

const getCountryStyle = (status: string) => {
  switch (status) {
    case "correct":
      return {
        weight: 2,
        color: "#4caf50",
        fillColor: "#4caf50",
        fillOpacity: 0.6,
      };
    default:
      return {
        weight: 1,
        color: "#3388ff",
        fillColor: "#3388ff",
        fillOpacity: 0.2,
      };
  }
};

const geojsonOptions = {
  style: (feature: any) => {
    const countryCode = feature.properties.ISO_A2?.toLowerCase();
    if (!countryCode) return getCountryStyle("default");

    const status = getCountryStatus(countryCode);
    return getCountryStyle(status);
  },
  onEachFeature: (feature: any, layer: any) => {
    const countryCode = feature.properties.ISO_A2?.toLowerCase();
    if (!countryCode) return;

    // Store layer reference for later style updates
    mapLayers.value.set(countryCode, layer);

    // Get French country name from our countries data
    const country = gameStore.countries.find((c) => c.id === countryCode);
    const frenchName = country
      ? country.name
      : feature.properties.NAME || feature.properties.NAME_EN;

    layer.on({
      mouseover: (e: any) => {
        const status = getCountryStatus(countryCode);
        const hoverStyle = getCountryStyle(status);
        e.target.setStyle({
          ...hoverStyle,
          weight: 3,
          fillOpacity: Math.min(hoverStyle.fillOpacity + 0.3, 1),
        });

        // Show tooltip with French name
        if (frenchName) {
          layer
            .bindTooltip(frenchName, {
              permanent: false,
              direction: "center",
              className: "country-tooltip",
            })
            .openTooltip();
        }
      },
      mouseout: (e: any) => {
        const status = getCountryStatus(countryCode);
        e.target.setStyle(getCountryStyle(status));

        // Close tooltip
        layer.closeTooltip();
      },
      click: (e: any) => {
        const countryName =
          feature.properties.NAME || feature.properties.NAME_EN;
        handleCountryClick(countryCode, countryName);
      },
    });
  },
};

const forceLayerStyleUpdate = (countryCode: string, style: any) => {
  const layer = mapLayers.value.get(countryCode);
  if (layer) {
    layer.setStyle(style);
  }
};

const handleCountryClick = (countryCode: string, countryName?: string) => {
  if (!gameStore.currentCountry) return;

  const currentCountryId = gameStore.currentCountry.id;
  gameStore.makeCountryMapGuess(countryCode, countryName);

  // If this was a correct guess, immediately update the visual style
  if (countryCode === currentCountryId) {
    // Find the layer that was clicked and update its style
    // We need to wait for the next tick for the status to be updated
    setTimeout(() => {
      const status = getCountryStatus(countryCode);
      const layerStyle = getCountryStyle(status);
      forceLayerStyleUpdate(countryCode, layerStyle);
    }, 0);
  }
};

const onMapReady = () => {
  // Map is ready, we can add any additional setup here if needed
};

const restartGame = () => {
  gameStore.initializeGame();
};

onMounted(async () => {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson",
    );
    geojson.value = await response.json();
  } catch (error) {
    console.error("Error loading GeoJSON:", error);
  }
});
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
</style>
