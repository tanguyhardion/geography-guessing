// Composable for country map guessing logic extracted from CountryMapGuessing.vue
// This keeps the component clean and logic reusable/testable
import { ref, computed, watch, onMounted } from "vue";
import { useCountryMapStore } from "../store/countryMapStore";
import { useBaseGameStore } from "../store/baseGameStore";
import { logGameCompletion } from "../utils/completionLogger";

// Move geojson URL to a constant for maintainability
const COUNTRIES_GEOJSON_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson";

// Accept optional callbacks for game complete/restart for better decoupling
export function useCountryMapGuessing({
  onGameComplete,
  onGameRestart,
}: {
  onGameComplete?: () => void;
  onGameRestart?: () => void;
} = {}) {
  const countryMapStore = useCountryMapStore();
  const baseStore = useBaseGameStore();
  const totalCountries = computed(() => countryMapStore.totalCountries);

  // GeoJSON and map state
  const geojson = ref<any>(null);
  const zoom = ref(2);
  const center = ref<[number, number]>([20, 0]);
  const mapRef = ref(null);
  const mapLayers = ref(new Map());
  const initialZoom = 2;
  const initialCenter = [20, 0] as [number, number];

  // Filtered geojson data based on selected continent
  const filteredGeojson = computed(() => {
    if (!geojson.value) return null;
    if (
      !countryMapStore.selectedContinent ||
      countryMapStore.selectedContinent === "all"
    ) {
      return geojson.value;
    }
    const continentCountryIds = countryMapStore.continentCountries.map(
      (c) => c.id,
    );
    const geoJsonData = geojson.value as any;
    const filteredFeatures = geoJsonData.features.filter((feature: any) => {
      const countryCode = getCountryCode(feature);
      return countryCode && continentCountryIds.includes(countryCode);
    });
    return {
      ...geoJsonData,
      features: filteredFeatures,
    };
  });

  // Helper to extract country code from geojson feature
  function getCountryCode(feature: any) {
    return feature.properties?.ADM0_A3 || feature.id || null;
  }

  // Map options to disable zoom control
  const mapOptions = { zoomControl: false };

  // Get country status for styling
  const getCountryStatus = (countryCode: string) => {
    return countryMapStore.getCountryStatus(countryCode);
  };

  // Style countries based on their status
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
          color: "#2196f3",
          fillColor: "#2196f3",
          fillOpacity: 0.3,
        };
    }
  };

  // GeoJSON options for map interaction
  const geoJsonOptions = {
    style: (feature: any) => {
      const countryCode = getCountryCode(feature);
      const status = countryCode ? getCountryStatus(countryCode) : "default";
      return getCountryStyle(status);
    },
    onEachFeature: (feature: any, layer: any) => {
      const countryCode = getCountryCode(feature);
      if (countryCode) {
        mapLayers.value.set(countryCode, layer);
        layer.on({
          click: () => {
            countryMapStore.makeCountryMapGuess(countryCode);
          },
          mouseover: (e: any) => {
            const layer = e.target;
            const status = getCountryStatus(countryCode);
            const hoverStyle = getCountryStyle(status);
            layer.setStyle({
              ...hoverStyle,
              weight: Math.max(hoverStyle.weight + 1, 3),
              fillOpacity: Math.min(hoverStyle.fillOpacity + 0.2, 1),
            });
          },
          mouseout: (e: any) => {
            const layer = e.target;
            const status = getCountryStatus(countryCode);
            layer.setStyle(getCountryStyle(status));
          },
        });
      }
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

  const restartGame = () => {
    countryMapStore.initializeGame();
    if (onGameRestart) onGameRestart(); // Notify parent if provided
  };

  const onMapReady = () => {
    // Map is ready, can add additional setup if needed
  };

  // Log game completion and notify parent if callback provided
  watch(
    () => countryMapStore.isGameComplete,
    (isComplete) => {
      if (isComplete) {
        logGameCompletion({
          modeName: "Pays du monde (carte)",
          totalTime: baseStore.elapsedTime,
          finalScore: baseStore.score,
          accuracy: baseStore.accuracy,
        });
        if (onGameComplete) onGameComplete();
      }
    },
  );

  onMounted(async () => {
    if (!countryMapStore.currentCountry) {
      countryMapStore.initializeGame();
    }
    try {
      const response = await fetch(COUNTRIES_GEOJSON_URL);
      geojson.value = await response.json();
    } catch (error) {
      // Silently handle error
    }
  });

  // TODO: If map logic grows, split into useCountryMap (map only) and useCountryMapGame (game only)

  return {
    countryMapStore,
    baseStore,
    totalCountries,
    filteredGeojson,
    zoom,
    center,
    mapRef,
    mapOptions,
    geoJsonOptions,
    centerMap,
    restartGame,
    onMapReady,
  };
}
