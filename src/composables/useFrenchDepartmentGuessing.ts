// Composable for French department map guessing logic extracted from FrenchDepartmentGuessing.vue
// This keeps the component clean and logic reusable/testable
import { ref, computed, watch, onMounted } from "vue";
import { useDepartmentStore } from "../store/departmentStore";
import { useBaseGameStore } from "../store/baseGameStore";
import { logGameCompletion } from "../utils/completionLogger";

export function useFrenchDepartmentGuessing() {
  const departmentStore = useDepartmentStore();
  const baseStore = useBaseGameStore();
  const totalDepartments = computed(() => departmentStore.totalDepartments);

  const zoom = ref(6);
  const center = ref<[number, number]>([46.603354, 1.888334]);
  const mapRef = ref(null);
  const geojson = ref<any>(null);
  const mapLayers = ref(new Map());
  const initialZoom = 6;
  const initialCenter = [46.603354, 1.888334] as [number, number];

  const mapOptions = { zoomControl: false };

  const getDepartmentStatus = (departmentCode: string) => {
    return departmentStore.getDepartmentStatus(departmentCode);
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

  // GeoJSON options for the map
  const geojsonOptions = {
    style: (feature: any) => {
      const code = feature.properties?.code || feature.id;
      const status = getDepartmentStatus(code);
      return getDepartmentStyle(status);
    },
    onEachFeature: (feature: any, layer: any) => {
      const code = feature.properties?.code || feature.id;
      layer.on({
        click: () => {
          departmentStore.makeGuess(code);
        },
        mouseover: (e: any) => {
          const layer = e.target;
          const status = getDepartmentStatus(code);
          const hoverStyle = getDepartmentStyle(status);
          layer.setStyle({
            ...hoverStyle,
            weight: Math.max(hoverStyle.weight + 1, 3),
            fillOpacity: Math.min(hoverStyle.fillOpacity + 0.2, 1),
          });
        },
        mouseout: (e: any) => {
          const layer = e.target;
          const status = getDepartmentStatus(code);
          layer.setStyle(getDepartmentStyle(status));
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

  const restartGame = () => {
    departmentStore.initializeGame();
  };

  const onMapReady = () => {
    // Map is ready, can add additional setup if needed
  };

  // Completion popup logic
  const showCompletionPopup = computed(() => departmentStore.isGameComplete);

  // Log game completion
  watch(
    () => departmentStore.isGameComplete,
    (isComplete) => {
      if (isComplete) {
        logGameCompletion({
          modeName: "Départements français (carte)",
          totalTime: baseStore.elapsedTime,
          finalScore: baseStore.score,
          accuracy: baseStore.accuracy,
        });
      }
    },
  );

  onMounted(async () => {
    if (!departmentStore.currentDepartment) {
      departmentStore.initializeGame();
    }
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson",
      );
      geojson.value = await response.json();
    } catch (error) {
      // Silently handle error
    }
  });

  return {
    departmentStore,
    baseStore,
    totalDepartments,
    geojson,
    geojsonOptions,
    zoom,
    center,
    mapRef,
    mapOptions,
    centerMap,
    restartGame,
    onMapReady,
    showCompletionPopup,
  };
}
