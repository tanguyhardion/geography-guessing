<template>
  <l-map :zoom="zoom" :center="center" :use-global-leaflet="false" class="map">
    <l-tile-layer
      url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
      attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
    />
    <l-geo-json v-if="geojson" :geojson="geojson" :options="geojsonOptions" />
  </l-map>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { LMap, LTileLayer, LGeoJson } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";

const zoom = ref(6);
const center = ref([46.603354, 1.888334] as [number, number]);
const geojson = ref(null);

const geojsonOptions = {
  style: {
    weight: 2,
    color: "#3388ff",
    fillOpacity: 0.2,
  },
  onEachFeature: (feature: any, layer: any) => {
    layer.on({
      mouseover: (e: any) => {
        e.target.setStyle({
          weight: 4,
          color: "#ff6200",
          fillOpacity: 0.5,
        });
      },
      mouseout: (e: any) => {
        e.target.setStyle({
          weight: 2,
          color: "#3388ff",
          fillOpacity: 0.2,
        });
      },
    });
  },
};

onMounted(async () => {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson",
    );
    geojson.value = await response.json();
  } catch (error) {
    console.error("Error loading GeoJSON:", error);
  }
});
</script>

<style scoped>
.map {
  height: 100vh;
  width: 100vw;
}
</style>
