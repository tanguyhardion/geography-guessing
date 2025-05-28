<template>
  <div class="map-guessing-container">
    <div class="progress-indicator">
      Département {{ totalDepartments - gameStore.availableDepartments.length + 1 }}
      / {{ totalDepartments }}
      <span class="score">Score : {{ gameStore.score }}</span>
    </div>
    
    <div class="question-area">
      <p class="instruction-text">Trouvez le département sur la carte :</p>
      <h2 class="target-name">{{ gameStore.currentQuestionDisplay }}</h2>
      <SkipButton v-if="gameStore.currentDepartment" />
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
      <button @click="restartGame" class="restart-button">
        Recommencer
      </button>
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
const totalDepartments = computed(() => gameStore.totalDepartments);

const zoom = ref(6);
const center = ref([46.603354, 1.888334] as [number, number]);
const geojson = ref(null);

const getDepartmentStatus = (departmentCode: string) => {
  return gameStore.getDepartmentStatus(departmentCode);
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
      },      click: (e: any) => {
        const departmentName = feature.properties.nom; // Get department name from GeoJSON
        handleDepartmentClick(departmentCode, departmentName);
      },
    });
  },
};

const handleDepartmentClick = (departmentCode: string, departmentName?: string) => {
  if (!gameStore.currentDepartment) return;
  gameStore.makeGuess(departmentCode, departmentName);
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
      "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson"
    );
    geojson.value = await response.json();
  } catch (error) {
    console.error("Error loading GeoJSON:", error);
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
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);    }
  }
}
</style>
