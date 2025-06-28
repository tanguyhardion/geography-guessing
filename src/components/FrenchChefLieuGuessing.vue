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
        aria-label="Centrer la carte"
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
import SkipButton from "./SkipButton.vue";
import { LMap, LTileLayer, LCircleMarker } from "@vue-leaflet/vue-leaflet";
import { useFrenchChefLieuGuessing } from "../composables/useFrenchChefLieuGuessing";
import type { FrenchChefLieu } from "../types";
import "leaflet/dist/leaflet.css";

defineProps();
defineEmits();

// All French chef-lieu guessing logic is now handled by the composable
// This keeps the component clean and maintainable
const {
  frenchChefLieuStore,
  baseStore,
  totalFrenchChefLieux,
  validChefLieux,
  getChefLieuRadius,
  getChefLieuMarkerOptions,
  handleChefLieuClick,
  zoom,
  center,
  mapRef,
  mapOptions,
  centerMap,
  restartGame,
  onMapReady,
} = useFrenchChefLieuGuessing();
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
