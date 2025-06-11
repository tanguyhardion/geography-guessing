import { createPinia } from "pinia";

export const pinia = createPinia();

// Export all stores
export { useBaseGameStore } from "./baseGameStore";
export { useDepartmentStore } from "./departmentStore";
export { useFlagStore } from "./flagStore";
export { useCountryMapStore } from "./countryMapStore";
export { useRussianCityStore } from "./russianCityStore";
export { useRussianOblastStore } from "./russianOblastStore";
export { useFrenchChefLieuStore } from "./frenchChefLieuStore";
export { useWorldCapitalsStore } from "./worldCapitalsStore";
export { useAppGameStore } from "./gameStoreAdapter";

// Legacy export for backwards compatibility
export { useAppGameStore as useGameStore } from "./gameStoreAdapter";
