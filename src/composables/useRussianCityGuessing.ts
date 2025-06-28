// Composable for Russian city guessing logic extracted from RussianCityGuessing.vue
// This keeps the component clean and logic reusable/testable
import { ref, computed, watch, onMounted } from "vue";
import { useRussianCityStore } from "../store/russianCityStore";
import { useBaseGameStore } from "../store/baseGameStore";
import { logGameCompletion } from "../utils/completionLogger";
import type { RussianCity } from "../types";

export function useRussianCityGuessing() {
  const russianCityStore = useRussianCityStore();
  const baseStore = useBaseGameStore();
  const totalRussianCities = computed(() => russianCityStore.totalRussianCities);

  // Map configuration centered on Russia
  const zoom = ref(3); // More zoomed out
  const center = ref<[number, number]>([61.524, 105.3188]);
  const mapRef = ref(null);
  const initialZoom = 3; // More zoomed out
  const initialCenter = [61.524, 105.3188] as [number, number];
  const mapOptions = { zoomControl: false };

  // Language switching
  const useRussian = ref(false);
  const showLanguageMenu = ref(false);

  const toggleLanguageMenu = () => {
    showLanguageMenu.value = !showLanguageMenu.value;
  };
  const selectLanguage = (russian: boolean) => {
    useRussian.value = russian;
    showLanguageMenu.value = false;
  };

  // Only show valid cities
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
  const validCities = computed(() =>
    russianCityStore.russianCities.filter((c: RussianCity) =>
      isValidCoordinate(c.lat, c.lng),
    ),
  );

  const getCityRadius = (city: RussianCity) => 10;

  const getCityMarkerOptions = (city: RussianCity) => {
    const status = russianCityStore.getRussianCityStatus(city.id);
    switch (status) {
      case "correct":
        return {
          color: "#4caf50",
          fillColor: "#4caf50",
          fillOpacity: 0.7,
        };
      default:
        return {
          color: "#3388ff",
          fillColor: "#3388ff",
          fillOpacity: 0.4,
        };
    }
  };

  const handleCityClick = (id: string, name: string) => {
    russianCityStore.makeRussianCityGuess(id, name);
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
    russianCityStore.initializeGame();
  };

  const onMapReady = () => {
    // Map is ready, can add additional setup if needed
  };

  // Display name based on language
  const currentCityDisplayName = computed(() => {
    const city = russianCityStore.currentRussianCity;
    if (!city) return "";
    return useRussian.value ? city.nameRu : city.name;
  });

  // Log game completion
  watch(
    () => russianCityStore.isGameComplete,
    (isComplete) => {
      if (isComplete) {
        logGameCompletion({
          modeName: "Villes de Russie (carte)",
          totalTime: baseStore.elapsedTime,
          finalScore: baseStore.score,
          accuracy: baseStore.accuracy,
        });
      }
    },
  );

  onMounted(() => {
    if (!russianCityStore.currentRussianCity) {
      russianCityStore.initializeGame();
    }
  });

  return {
    russianCityStore,
    baseStore,
    totalRussianCities,
    validCities,
    getCityRadius,
    getCityMarkerOptions,
    handleCityClick,
    zoom,
    center,
    mapRef,
    mapOptions,
    centerMap,
    restartGame,
    onMapReady,
    useRussian,
    showLanguageMenu,
    toggleLanguageMenu,
    selectLanguage,
    currentCityDisplayName,
  };
}
