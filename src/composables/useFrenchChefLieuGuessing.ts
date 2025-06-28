// Composable for French chef-lieu guessing logic extracted from FrenchChefLieuGuessing.vue
// This keeps the component clean and logic reusable/testable
import { ref, computed, watch, onMounted } from "vue";
import { useFrenchChefLieuStore } from "../store/frenchChefLieuStore";
import { useBaseGameStore } from "../store/baseGameStore";
import { logGameCompletion } from "../utils/completionLogger";
import type { FrenchChefLieu } from "../types";

export function useFrenchChefLieuGuessing() {
  const frenchChefLieuStore = useFrenchChefLieuStore();
  const baseStore = useBaseGameStore();
  const totalFrenchChefLieux = computed(
    () => frenchChefLieuStore.totalFrenchChefLieux,
  );

  // Map configuration centered on France
  const zoom = ref(6);
  const center = ref<[number, number]>([46.603354, 1.888334]);
  const mapRef = ref(null);
  const initialZoom = 6;
  const initialCenter = [46.603354, 1.888334] as [number, number];
  const mapOptions = { zoomControl: false };

  // Helper function to validate coordinates
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

  // Only show valid chef-lieux
  const validChefLieux = computed(() =>
    frenchChefLieuStore.frenchChefLieux.filter((c: FrenchChefLieu) =>
      isValidCoordinate(c.lat, c.lng),
    ),
  );

  const getChefLieuRadius = (chefLieu: FrenchChefLieu) => {
    // Optionally adjust radius based on zoom or other logic
    return 10;
  };

  const getChefLieuMarkerOptions = (chefLieu: FrenchChefLieu) => {
    const status = frenchChefLieuStore.getFrenchChefLieuStatus(chefLieu.id);
    switch (status) {
      case "correct":
        return {
          color: "#4caf50",
          fillColor: "#4caf50",
          fillOpacity: 0.7,
        };
      default:
        // Only 'correct' and 'default' are valid statuses
        return {
          color: "#3388ff",
          fillColor: "#3388ff",
          fillOpacity: 0.4,
        };
    }
  };

  // Use the correct guessing method from the store
  const handleChefLieuClick = (id: string, name: string) => {
    frenchChefLieuStore.makeFrenchChefLieuGuess(id, name);
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
    frenchChefLieuStore.initializeGame();
  };

  const onMapReady = () => {
    // Map is ready, can add additional setup if needed
  };

  // Log game completion
  watch(
    () => frenchChefLieuStore.isGameComplete,
    (isComplete) => {
      if (isComplete) {
        logGameCompletion({
          modeName: "Chef-lieux français (carte)",
          totalTime: baseStore.elapsedTime,
          finalScore: baseStore.score,
          accuracy: baseStore.accuracy,
        });
      }
    },
  );

  onMounted(() => {
    if (!frenchChefLieuStore.currentFrenchChefLieu) {
      frenchChefLieuStore.initializeGame();
    }
  });

  return {
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
  };
}
