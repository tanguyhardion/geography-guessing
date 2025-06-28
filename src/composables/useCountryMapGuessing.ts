// Composable for country map guessing logic extracted from CountryMapGuessing.vue
// This keeps the component clean and logic reusable/testable
import { ref, computed, watch, onMounted } from "vue";
import { useCountryMapStore } from "../store/countryMapStore";
import { useBaseGameStore } from "../store/baseGameStore";
import { logGameCompletion } from "../utils/completionLogger";

export function useCountryMapGuessing() {
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
  };

  const onMapReady = () => {
    // Map is ready, can add additional setup if needed
  };

  // Log game completion
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
      }
    },
  );

  onMounted(async () => {
    if (!countryMapStore.currentCountry) {
      countryMapStore.initializeGame();
    }
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson",
      );
      geojson.value = await response.json();
    } catch (error) {
      // Silently handle error
    }
  });

  return {
    countryMapStore,
    baseStore,
    totalCountries,
    filteredGeojson,
    geojsonOptions: {}, // Placeholder for future geojson options
    zoom,
    center,
    mapRef,
    mapOptions,
    centerMap,
    restartGame,
    onMapReady,
  };
}
