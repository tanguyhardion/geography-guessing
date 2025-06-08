import { defineStore } from "pinia";
import type { GameMode, Continent } from "../types";
import { useDepartmentStore } from "./departmentStore";
import { useFlagStore } from "./flagStore";
import { useCountryMapStore } from "./countryMapStore";
import { useRussianCityStore } from "./russianCityStore";
import { useFrenchChefLieuStore } from "./frenchChefLieuStore";

interface AppGameState {
  selectedGameType: "departments" | "flags" | "map";
}

export const useAppGameStore = defineStore("appGame", {
  state: (): AppGameState => ({
    selectedGameType: "map",
  }),

  getters: {
    // Current game mode based on selected game type and specific mode
    currentGameMode(): GameMode {
      const departmentStore = useDepartmentStore();
      return departmentStore.gameMode;
    },

    // Game state checks
    isInFlagMode(): boolean {
      return this.selectedGameType === "flags";
    },

    isInCountryMapMode(): boolean {
      return this.selectedGameType === "map";
    },    isInRussianCitiesMode(): boolean {
      const departmentStore = useDepartmentStore();
      return departmentStore.gameMode === "guessRussianCities";
    },

    isInFrenchChefLieuxMode(): boolean {
      const departmentStore = useDepartmentStore();
      return departmentStore.gameMode === "guessFrenchChefLieux";
    },    // Check if any game is complete
    isGameComplete(): boolean {
      if (this.selectedGameType === "flags") {
        const flagStore = useFlagStore();
        return flagStore.isGameComplete;
      } else if (this.isInRussianCitiesMode) {
        const russianCityStore = useRussianCityStore();
        return russianCityStore.isGameComplete;
      } else if (this.isInFrenchChefLieuxMode) {
        const frenchChefLieuStore = useFrenchChefLieuStore();
        return frenchChefLieuStore.isGameComplete;
      } else if (this.currentGameMode === "guessCountryMapLocation") {
        const countryMapStore = useCountryMapStore();
        return countryMapStore.isGameComplete;
      } else {
        const departmentStore = useDepartmentStore();
        return departmentStore.isGameComplete;
      }
    },    // Get current question display from appropriate store
    currentQuestionDisplay(): string {
      if (this.selectedGameType === "flags") {
        const flagStore = useFlagStore();
        return flagStore.currentCountry?.id || "";
      } else if (this.isInRussianCitiesMode) {
        const russianCityStore = useRussianCityStore();
        return russianCityStore.currentQuestionDisplay;
      } else if (this.isInFrenchChefLieuxMode) {
        const frenchChefLieuStore = useFrenchChefLieuStore();
        return frenchChefLieuStore.currentQuestionDisplay;
      } else if (this.currentGameMode === "guessCountryMapLocation") {
        const countryMapStore = useCountryMapStore();
        return countryMapStore.currentQuestionDisplay;
      } else {
        const departmentStore = useDepartmentStore();
        return departmentStore.currentQuestionDisplay;
      }
    },

    // Get current flag for flag mode
    currentFlag(): string {
      if (this.selectedGameType === "flags") {
        const flagStore = useFlagStore();
        return flagStore.currentFlag;
      }
      return "";
    },

    // Available continents for flag mode
    availableContinents(): string[] {
      const flagStore = useFlagStore();
      return flagStore.availableContinents;
    },
  },

  actions: {    // Initialize the appropriate game based on selected type
    initializeGame() {
      if (this.selectedGameType === "flags") {
        const flagStore = useFlagStore();
        flagStore.initializeGame();
      } else if (this.isInRussianCitiesMode) {
        const russianCityStore = useRussianCityStore();
        russianCityStore.initializeGame();
      } else if (this.isInFrenchChefLieuxMode) {
        const frenchChefLieuStore = useFrenchChefLieuStore();
        frenchChefLieuStore.initializeGame();
      } else if (this.currentGameMode === "guessCountryMapLocation") {
        const countryMapStore = useCountryMapStore();
        countryMapStore.initializeGame();
      } else {
        const departmentStore = useDepartmentStore();
        departmentStore.initializeGame();
      }
    },

    // Set game mode (for departments)
    setGameMode(mode: GameMode) {
      const departmentStore = useDepartmentStore();
      departmentStore.setGameMode(mode);
    },

    // Set selected game type
    setSelectedGameType(gameType: "departments" | "flags" | "map") {
      this.selectedGameType = gameType;
      this.initializeGame();
    },

    // Set selected continent for flag mode
    setSelectedContinent(continent: Continent | "all") {
      const flagStore = useFlagStore();
      flagStore.setSelectedContinent(continent);
    },

    // Set reverse flag mode
    setReverseFlagMode(isReverse: boolean) {
      const flagStore = useFlagStore();
      flagStore.setReverseFlagMode(isReverse);
    },    // Skip current question
    skipCurrent() {
      if (this.selectedGameType === "flags") {
        const flagStore = useFlagStore();
        flagStore.skipFlag();
      } else if (this.isInRussianCitiesMode) {
        const russianCityStore = useRussianCityStore();
        russianCityStore.skipRussianCity();
      } else if (this.isInFrenchChefLieuxMode) {
        const frenchChefLieuStore = useFrenchChefLieuStore();
        frenchChefLieuStore.skipFrenchChefLieu();
      } else if (this.currentGameMode === "guessCountryMapLocation") {
        const countryMapStore = useCountryMapStore();
        countryMapStore.skipCountryMap();
      } else if (this.currentGameMode === "guessMapLocation") {
        const departmentStore = useDepartmentStore();
        departmentStore.skipDepartment();
      } else {
        const departmentStore = useDepartmentStore();
        departmentStore.skipDepartment();
      }
    },    // Make guess (delegates to appropriate store)
    makeGuess(id: string, name?: string) {
      if (this.selectedGameType === "flags") {
        // Handle flag mode
        return;
      } else if (this.isInRussianCitiesMode) {
        const russianCityStore = useRussianCityStore();
        russianCityStore.makeRussianCityGuess(id, name);
      } else if (this.isInFrenchChefLieuxMode) {
        const frenchChefLieuStore = useFrenchChefLieuStore();
        frenchChefLieuStore.makeFrenchChefLieuGuess(id, name);
      } else if (this.currentGameMode === "guessCountryMapLocation") {
        const countryMapStore = useCountryMapStore();
        countryMapStore.makeCountryMapGuess(id, name);
      } else if (this.currentGameMode === "guessMapLocation") {
        const departmentStore = useDepartmentStore();
        departmentStore.makeGuess(id, name);
      } else {
        const departmentStore = useDepartmentStore();
        departmentStore.makeGuess(id, name);
      }
    },

    // Make flag guess (text input)
    makeFlagGuess(guess: string) {
      if (this.selectedGameType === "flags") {
        const flagStore = useFlagStore();
        flagStore.makeFlagGuess(guess);
      }
    },

    // Make flag guess by clicking flag
    makeFlagGuessByFlag(flagCountryId: string) {
      if (this.selectedGameType === "flags") {
        const flagStore = useFlagStore();
        flagStore.makeFlagGuessByFlag(flagCountryId);
      }
    },
  },
});

// Re-export all stores for convenience
export { useDepartmentStore } from "./departmentStore";
export { useFlagStore } from "./flagStore";
export { useCountryMapStore } from "./countryMapStore";
export { useRussianCityStore } from "./russianCityStore";
export { useFrenchChefLieuStore } from "./frenchChefLieuStore";
export { useBaseGameStore } from "./baseGameStore";
