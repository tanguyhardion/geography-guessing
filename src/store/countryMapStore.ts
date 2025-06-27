import { defineStore } from "pinia";
import { sovereignStates } from "../data/sovereignStates";
import type { SovereignState, CountryStatus, Continent } from "../types";
import { useBaseGameStore, SUCCESS_DELAY } from "./baseGameStore";
import { selectRandomItemWeighted } from "../utils/randomSelection";
import SkipToast from "../components/SkipToast.vue";

// Constants
const COMPLETION_MESSAGE = "Félicitations ! Tu as localisé tous les pays !";

interface CountryMapGameState {
  countries: SovereignState[];
  currentCountry: SovereignState | null;
  countryStatus: CountryStatus;
  availableCountries: SovereignState[];
  previousCountry: SovereignState | null; // Track previous to avoid immediate re-selection
  selectedContinent: Continent | "all" | null; // Add continent filtering
}

export const useCountryMapStore = defineStore("countryMap", {
  state: (): CountryMapGameState => ({
    countries: sovereignStates,
    currentCountry: null,
    countryStatus: {},
    availableCountries: [...sovereignStates],
    previousCountry: null,
    selectedContinent: null,
  }),

  getters: {
    // Status getters
    getCountryStatus: (state) => (countryId: string) => {
      return state.countryStatus[countryId] || "default";
    },

    // Totals
    totalCountries: (state) => {
      let filteredCountries = [...state.countries];

      // Filter by continent if one is selected
      if (state.selectedContinent && state.selectedContinent !== "all") {
        filteredCountries = filteredCountries.filter(
          (country) => country.continent === state.selectedContinent,
        );
      }

      return filteredCountries.length;
    },

    // Available continents for map mode
    availableContinents(): string[] {
      const continents = [...new Set(this.countries.map((c) => c.continent))];
      return continents.sort();
    },

    // Countries filtered by continent
    continentCountries: (state) => {
      if (state.selectedContinent && state.selectedContinent !== "all") {
        return state.countries.filter(
          (country) => country.continent === state.selectedContinent,
        );
      }
      return state.countries;
    },

    // Display content
    currentQuestionDisplay: (state) => {
      return state.currentCountry?.name || "";
    },

    // Game state checks
    isGameComplete: (state) => {
      return state.availableCountries.length === 0;
    },
  },

  actions: {
    // Game initialization
    initializeGame() {
      const baseStore = useBaseGameStore();
      baseStore.resetGameState();
      this.initializeCountryMapGame();
    },

    initializeCountryMapGame() {
      let filteredCountries = [...this.countries];

      // Filter by continent if one is selected
      if (this.selectedContinent && this.selectedContinent !== "all") {
        filteredCountries = filteredCountries.filter(
          (country) => country.continent === this.selectedContinent,
        );
      }

      this.availableCountries = filteredCountries;
      this.countryStatus = {};
      this.previousCountry = null; // Reset previous country
      this.selectRandomCountry();
    },

    // Random selection
    selectRandomCountry() {
      if (this.availableCountries.length === 0) {
        this.handleGameCompletion();
        return;
      }

      // Use improved random selection to avoid immediate re-selection
      this.previousCountry = this.currentCountry;
      this.currentCountry = selectRandomItemWeighted(
        this.availableCountries,
        this.previousCountry,
      );

      const baseStore = useBaseGameStore();
      baseStore.clearNonCompletionMessage();
    },

    // Country map guessing
    makeCountryMapGuess(countryId: string, countryName?: string) {
      if (!this.currentCountry) return;

      const currentCountryId = this.currentCountry.id;
      const isCorrect = countryId === currentCountryId;

      if (isCorrect) {
        this.handleCorrectCountryMapGuess(this.currentCountry);
      } else {
        this.handleIncorrectCountryMapGuess(countryId, countryName);
      }
    },

    handleCorrectCountryMapGuess(country: SovereignState) {
      const baseStore = useBaseGameStore();
      baseStore.recordCorrectGuess();

      this.countryStatus[country.id] = "correct";
      baseStore.setMessage(`Correct ! C'est bien ${country.name}.`);
      this.removeCountryFromAvailable(country.id);
      this.scheduleNextQuestion();
    },

    handleIncorrectCountryMapGuess(countryId: string, countryName?: string) {
      const baseStore = useBaseGameStore();
      baseStore.recordIncorrectGuess();

      if (countryId) {
        // Find the French name for the clicked country
        const clickedCountry = this.countries.find((c) => c.id === countryId);
        const frenchName = clickedCountry ? clickedCountry.name : countryName;

        if (frenchName) {
          baseStore.setMessage(
            `Incorrect. Tu as cliqué sur ${frenchName}. Essaie encore ou passe.`,
          );
        } else {
          baseStore.setMessage("Incorrect. Essaie encore ou passe.");
        }
      } else {
        baseStore.setMessage("Incorrect. Essaie encore ou passe.");
      }
      baseStore.clearMessageWithDelay();
    }, // Skip functionality
    skipCountryMap() {
      if (!this.currentCountry) return;

      const baseStore = useBaseGameStore();
      baseStore.setMessage({
        component: SkipToast,
        props: {
          prefix: "Passé. C'était : ",
          departmentName: this.currentCountry.name,
        },
      });

      setTimeout(() => {
        this.selectRandomCountry();
        baseStore.clearMessageWithDelay();
      }, 100);
    },

    handleGameCompletion() {
      this.currentCountry = null;
      const baseStore = useBaseGameStore();
      baseStore.setMessage(COMPLETION_MESSAGE);
      baseStore.stopTimer();
    },

    scheduleNextQuestion() {
      setTimeout(() => {
        this.selectRandomCountry();
        const baseStore = useBaseGameStore();
        baseStore.clearMessageWithDelay();
      }, SUCCESS_DELAY);
    },

    removeCountryFromAvailable(countryId: string) {
      this.availableCountries = this.availableCountries.filter(
        (country) => country.id !== countryId,
      );
    },

    // Set selected continent
    setSelectedContinent(continent: Continent | "all" | null) {
      this.selectedContinent = continent;
    },

    // Complete reset for when switching game modes
    resetStore() {
      this.currentCountry = null;
      this.countryStatus = {};
      this.availableCountries = [...this.countries];
      this.selectedContinent = null;
      this.previousCountry = null;
    },
  },
});
