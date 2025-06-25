import { defineStore } from "pinia";
import type { GameMode, Continent } from "../types";
import { useDepartmentStore } from "./departmentStore";
import { useFlagStore } from "./flagStore";
import { useCountryMapStore } from "./countryMapStore";
import { useRussianCityStore } from "./russianCityStore";
import { useRussianOblastStore } from "./russianOblastStore";
import { useFrenchChefLieuStore } from "./frenchChefLieuStore";
import { useWorldCapitalsStore } from "./worldCapitalsStore";

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
    },
    isInRussianCitiesMode(): boolean {
      const departmentStore = useDepartmentStore();
      return departmentStore.gameMode === "guessRussianCities";
    },

    isInRussianOblastsMode(): boolean {
      const departmentStore = useDepartmentStore();
      return departmentStore.gameMode === "guessRussianOblasts";
    },

    isInFrenchChefLieuxMode(): boolean {
      const departmentStore = useDepartmentStore();
      return departmentStore.gameMode === "guessFrenchChefLieux";
    },

    isInWorldCapitalsMode(): boolean {
      const departmentStore = useDepartmentStore();
      const result = departmentStore.gameMode === "guessWorldCapitals";
      return result;
    },

    isInCountryFromCapitalMode(): boolean {
      const departmentStore = useDepartmentStore();
      return departmentStore.gameMode === "guessCountryFromCapital";
    }, // Check if any game is complete
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
      } else if (this.isInWorldCapitalsMode) {
        const worldCapitalsStore = useWorldCapitalsStore();
        return worldCapitalsStore.isGameComplete;
      } else if (this.isInCountryFromCapitalMode) {
        const worldCapitalsStore = useWorldCapitalsStore();
        return worldCapitalsStore.isGameComplete;
      } else if (this.currentGameMode === "guessCountryMapLocation") {
        const countryMapStore = useCountryMapStore();
        return countryMapStore.isGameComplete;
      } else {
        const departmentStore = useDepartmentStore();
        return departmentStore.isGameComplete;
      }
    }, // Get current question display from appropriate store
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
      } else if (this.isInWorldCapitalsMode) {
        const worldCapitalsStore = useWorldCapitalsStore();
        return worldCapitalsStore.currentQuestionDisplay;
      } else if (this.isInCountryFromCapitalMode) {
        const worldCapitalsStore = useWorldCapitalsStore();
        return worldCapitalsStore.currentQuestionDisplay;
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
      if (this.selectedGameType === "flags") {
        const flagStore = useFlagStore();
        return flagStore.availableContinents;
      } else if (this.isInWorldCapitalsMode) {
        const worldCapitalsStore = useWorldCapitalsStore();
        return worldCapitalsStore.availableContinents;
      } else if (this.isInCountryFromCapitalMode) {
        const worldCapitalsStore = useWorldCapitalsStore();
        return worldCapitalsStore.availableContinents;
      } else if (
        this.currentGameMode === "guessCountryMapLocation" ||
        this.selectedGameType === "map"
      ) {
        const countryMapStore = useCountryMapStore();
        return countryMapStore.availableContinents;
      }
      return [];
    },
  },

  actions: {
    // Reset all stores to ensure clean state when switching game modes
    resetAllStores() {
      const flagStore = useFlagStore();
      const worldCapitalsStore = useWorldCapitalsStore();
      const countryMapStore = useCountryMapStore();
      const russianCityStore = useRussianCityStore();
      const frenchChefLieuStore = useFrenchChefLieuStore();

      flagStore.resetStore();
      worldCapitalsStore.resetStore();
      countryMapStore.resetStore();
      // Note: Other stores don't have resetStore methods yet, but flagStore, worldCapitalsStore
      // and countryMapStore are the main concerns since they persist selectedContinent across mode switches
    },

    // Initialize the appropriate game based on selected type
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
      } else if (this.isInWorldCapitalsMode) {
        const worldCapitalsStore = useWorldCapitalsStore();
        worldCapitalsStore.initializeGame();
      } else if (this.isInCountryFromCapitalMode) {
        const worldCapitalsStore = useWorldCapitalsStore();
        worldCapitalsStore.initializeGame();
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

      // Handle initialization for non-department modes
      if (mode === "guessWorldCapitals") {
        const worldCapitalsStore = useWorldCapitalsStore();
        worldCapitalsStore.initializeGame();
      } else if (mode === "guessCountryFromCapital") {
        const worldCapitalsStore = useWorldCapitalsStore();
        worldCapitalsStore.setReverseCapitalsMode(true);
        worldCapitalsStore.initializeGame();
      } else if (mode === "guessRussianCities") {
        const russianCityStore = useRussianCityStore();
        russianCityStore.initializeGame();
      } else if (mode === "guessFrenchChefLieux") {
        const frenchChefLieuStore = useFrenchChefLieuStore();
        frenchChefLieuStore.initializeGame();
      } else if (mode === "guessCountryMapLocation") {
        const countryMapStore = useCountryMapStore();
        countryMapStore.initializeGame();
      }
    },

    // Set selected game type
    setSelectedGameType(gameType: "departments" | "flags" | "map") {
      // Reset all stores before switching to ensure clean state
      this.resetAllStores();
      this.selectedGameType = gameType;
      this.initializeGame();
    },

    // Set selected continent for flag mode
    setSelectedContinent(continent: Continent | "all") {
      if (this.selectedGameType === "flags") {
        const flagStore = useFlagStore();
        flagStore.setSelectedContinent(continent);
        // Reinitialize the flag game with the new continent selection
        flagStore.initializeFlagGame();
      } else if (
        this.currentGameMode === "guessCountryMapLocation" ||
        this.selectedGameType === "map"
      ) {
        const countryMapStore = useCountryMapStore();
        countryMapStore.setSelectedContinent(continent);
        // Only reinitialize if we're already in country map mode
        if (this.currentGameMode === "guessCountryMapLocation") {
          countryMapStore.initializeCountryMapGame();
        }
      }
      // Always set continent for world capitals store as well, in case we're about to enter that mode
      const worldCapitalsStore = useWorldCapitalsStore();
      worldCapitalsStore.setSelectedContinent(continent);
    },

    // Set reverse flag mode
    setReverseFlagMode(isReverse: boolean) {
      const flagStore = useFlagStore();
      flagStore.setReverseFlagMode(isReverse);
    }, // Skip current question
    skipCurrent() {
      // Check specific modes first (these take priority over general game types)
      if (this.isInWorldCapitalsMode) {
        const worldCapitalsStore = useWorldCapitalsStore();
        worldCapitalsStore.skipCapital();
      } else if (this.isInCountryFromCapitalMode) {
        const worldCapitalsStore = useWorldCapitalsStore();
        worldCapitalsStore.skipCapital();
      } else if (this.isInRussianCitiesMode) {
        const russianCityStore = useRussianCityStore();
        russianCityStore.skipRussianCity();
      } else if (this.isInRussianOblastsMode) {
        const russianOblastStore = useRussianOblastStore();
        russianOblastStore.skipRussianOblast();
      } else if (this.isInFrenchChefLieuxMode) {
        const frenchChefLieuStore = useFrenchChefLieuStore();
        frenchChefLieuStore.skipFrenchChefLieu();
      } else if (this.currentGameMode === "guessCountryMapLocation") {
        const countryMapStore = useCountryMapStore();
        countryMapStore.skipCountryMap();
      } else if (this.currentGameMode === "guessMapLocation") {
        const departmentStore = useDepartmentStore();
        departmentStore.skipDepartment();
      } else if (this.selectedGameType === "flags") {
        const flagStore = useFlagStore();
        flagStore.skipFlag();
      } else {
        const departmentStore = useDepartmentStore();
        departmentStore.skipDepartment();
      }
    }, // Make guess (delegates to appropriate store)
    makeGuess(id: string, name?: string) {
      if (this.selectedGameType === "flags") {
        // Handle flag mode
        return;
      } else if (this.isInRussianCitiesMode) {
        const russianCityStore = useRussianCityStore();
        russianCityStore.makeRussianCityGuess(id, name);
      } else if (this.isInRussianOblastsMode) {
        const russianOblastStore = useRussianOblastStore();
        russianOblastStore.makeRussianOblastGuess(id, name);
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
      } else if (this.isInWorldCapitalsMode) {
        const worldCapitalsStore = useWorldCapitalsStore();
        worldCapitalsStore.makeCapitalsGuess(guess);
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
export { useWorldCapitalsStore } from "./worldCapitalsStore";
export { useBaseGameStore } from "./baseGameStore";
