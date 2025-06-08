import { defineStore } from "pinia";
import { countries } from "../data/countries";
import type { Country, CountryStatus, Continent } from "../types";
import {
  useBaseGameStore,
  HINT_THRESHOLD,
  SUCCESS_DELAY,
} from "./baseGameStore";
import { areStringsSimilar } from "../utils/stringUtils";
import { selectRandomItemWeighted } from "../utils/randomSelection";
import SkipToast from "../components/SkipToast.vue";

// Constants
const COMPLETION_MESSAGE =
  "Félicitations ! Tu as deviné toutes les capitales !";

interface WorldCapitalsGameState {
  countries: Country[];
  currentCountry: Country | null;
  countryStatus: CountryStatus;
  availableCountries: Country[];
  userGuessInput: string;
  selectedContinent: Continent | "all" | null;
  previousCountry: Country | null; // Track previous to avoid immediate re-selection
}

export const useWorldCapitalsStore = defineStore("worldCapitals", {
  state: (): WorldCapitalsGameState => ({
    countries,
    currentCountry: null,
    countryStatus: {},
    availableCountries: [...countries],
    userGuessInput: "",
    selectedContinent: null,
    previousCountry: null,
  }),

  getters: {
    // Status getters
    getCountryStatus: (state) => (countryId: string) => {
      return state.countryStatus[countryId] || "none";
    },

    // Game state checks
    isGameComplete: (state) => {
      return state.availableCountries.length === 0;
    },

    // Game display getters
    currentQuestionDisplay: (state) => {
      return state.currentCountry ? state.currentCountry.capital : "";
    },

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

    // Available continents for capitals mode
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
  },

  actions: {
    // Game initialization
    initializeGame() {
      const baseStore = useBaseGameStore();
      baseStore.resetGameState();
      this.initializeWorldCapitalsGame();
    },

    initializeWorldCapitalsGame() {
      let filteredCountries = [...this.countries];

      // Filter by continent if one is selected
      if (this.selectedContinent && this.selectedContinent !== "all") {
        filteredCountries = filteredCountries.filter(
          (country) => country.continent === this.selectedContinent,
        );
      } else {
      }

      this.availableCountries = filteredCountries;
      this.countryStatus = {};
      this.previousCountry = null; // Reset previous country
      this.userGuessInput = ""; // Clear any input
      this.selectRandomCountry();
    },

    // Complete reset for when switching game modes
    resetStore() {
      this.currentCountry = null;
      this.countryStatus = {};
      this.availableCountries = [...this.countries];
      this.userGuessInput = "";
      this.selectedContinent = null;
      this.previousCountry = null;
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
      baseStore.resetAttempts();
      baseStore.clearNonCompletionMessage();
    },

    // Capital guessing by text input
    makeCapitalsGuess(guess: string) {
      if (!this.currentCountry) return;

      const currentCountry = this.currentCountry;
      const isCorrect = areStringsSimilar(
        guess.replace("-", " "),
        currentCountry.name.replace("-", " "),
      );

      if (isCorrect) {
        this.handleCorrectCapitalsGuess(currentCountry);
      } else {
        this.handleIncorrectCapitalsGuess(currentCountry);
      }

      this.userGuessInput = "";
    },

    handleCorrectCapitalsGuess(country: Country) {
      const baseStore = useBaseGameStore();
      baseStore.recordCorrectGuess();

      this.countryStatus[country.id] = "correct";
      baseStore.resetAttempts();
      baseStore.setMessage(`Correct ! C'est bien ${country.name}.`);
      this.removeCountryFromAvailable(country.id);
      this.scheduleNextQuestion();
    },

    handleIncorrectCapitalsGuess(country: Country) {
      const baseStore = useBaseGameStore();
      baseStore.recordIncorrectGuess();

      this.setCapitalsHintMessage(country);
      baseStore.clearMessageWithDelay();
    },

    setCapitalsHintMessage(country: Country) {
      const baseStore = useBaseGameStore();
      if (baseStore.incorrectAttempts >= HINT_THRESHOLD) {
        const firstLetter = country.name.charAt(0);
        baseStore.setMessage(
          `Indice : Le pays commence par "${firstLetter}". Essaie encore ou passe.`,
        );
      } else {
        baseStore.setMessage("Incorrect. Essaie encore ou passe.");
      }
    }, // Skip functionality
    skipCapital() {
      if (!this.currentCountry) {
        return;
      }

      const countryBeingSkipped = this.currentCountry;

      const baseStore = useBaseGameStore();
      baseStore.setMessage({
        component: SkipToast,
        props: {
          prefix: "C'était : ",
          departmentName: countryBeingSkipped.name,
        },
      });

      baseStore.resetAttempts();

      setTimeout(() => {
        this.selectRandomCountry();
        const baseStore = useBaseGameStore();
        baseStore.clearMessageWithDelay();
      }, 100);
    },

    // Utility methods
    setSelectedContinent(continent: Continent | "all" | null) {
      this.selectedContinent = continent;
    },

    setUserGuessInput(input: string) {
      this.userGuessInput = input;
    },

    handleGameCompletion() {
      this.currentCountry = null;
      const baseStore = useBaseGameStore();
      baseStore.setMessage(COMPLETION_MESSAGE);
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
  },
});
