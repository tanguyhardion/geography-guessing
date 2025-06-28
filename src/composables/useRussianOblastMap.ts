// useRussianOblastMap.ts
// Composable for handling Leaflet map logic for Russian oblast guessing
import { ref, onMounted, onUnmounted } from "vue";
import { useRussianOblastStore } from "../store/russianOblastStore";

export function useRussianOblastMap() {
  const russianOblastStore = useRussianOblastStore();
  const zoom = ref(3);
  const center = ref([64.6863, 97.7453] as [number, number]);
  const mapRef = ref(null);
  const geojson = ref(null);
  const mapLayers = ref(new Map());

  const initialZoom = 3;
  const initialCenter = [64.6863, 97.7453] as [number, number];

  const mapOptions = { zoomControl: false };

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

  const geoJsonOptions = {
    style: (feature: any) => {
      const status = russianOblastStore.getRussianOblastStatus(
        feature.properties.iso,
      );
      return getOblastStyle(status);
    },
    onEachFeature: (feature: any, layer: any) => {
      const oblastId = feature.properties.iso;
      mapLayers.value.set(oblastId, layer);
      layer.on({
        click: () => {}, // To be injected by component
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

  const centerMap = () => {
    if (mapRef.value) {
      zoom.value = initialZoom;
      center.value = [...initialCenter];
      const leafletMap = (mapRef.value as any).leafletObject;
      if (leafletMap) {
        leafletMap.setView(initialCenter, initialZoom, { animate: true });
      }
    }
  };

  const onMapReady = () => {
    // Map is ready, can add additional setup if needed
  };

  onMounted(async () => {
    try {
      const response = await fetch("/geography-guessing/oblasts.json");
      geojson.value = await response.json();
    } catch (error) {
      console.warn("Failed to load oblasts GeoJSON:", error);
    }
  });

  onUnmounted(() => {
    mapLayers.value.clear();
  });

  return {
    zoom,
    center,
    mapRef,
    geojson,
    mapOptions,
    geoJsonOptions,
    centerMap,
    forceLayerStyleUpdate,
    mapLayers,
    onMapReady,
  };
}
