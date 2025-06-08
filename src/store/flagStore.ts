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
const COMPLETION_MESSAGE = "Félicitations ! Tu as deviné tous les drapeaux !";

interface FlagGameState {
  countries: Country[];
  currentCountry: Country | null;
  countryStatus: CountryStatus;
  availableCountries: Country[];
  userGuessInput: string;
  reverseFlagMode: boolean;
  selectedContinent: Continent | "all" | null;
  previousCountry: Country | null; // Track previous to avoid immediate re-selection
}

export const useFlagStore = defineStore("flags", {
  state: (): FlagGameState => ({
    countries,
    currentCountry: null,
    countryStatus: {},
    availableCountries: [...countries],
    userGuessInput: "",
    reverseFlagMode: false,
    selectedContinent: null,
    previousCountry: null,
  }),

  getters: {
    // Status getters
    getCountryStatus: (state) => (countryId: string) => {
      return state.countryStatus[countryId] || "default";
    },

    // Totals
    totalCountries: (state) => {
      if (state.selectedContinent && state.selectedContinent !== "all") {
        return state.countries.filter(
          (country) => country.continent === state.selectedContinent,
        ).length;
      }
      return state.countries.length;
    },

    // Available continents
    availableContinents: (state) => {
      const continents = new Set(state.countries.map((c) => c.continent));
      return Array.from(continents).sort();
    },

    // Current flag display
    currentFlag: (state) => {
      if (state.currentCountry) {
        return `https://flagcdn.com/${state.currentCountry.id}.svg`;
      }
      return "";
    },

    // Countries filtered by continent for display
    continentCountries: (state) => {
      if (state.selectedContinent && state.selectedContinent !== "all") {
        return state.countries.filter(
          (country) => country.continent === state.selectedContinent,
        );
      }
      return state.countries;
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
      this.initializeFlagGame();
    },

    initializeFlagGame() {
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
        this.previousCountry
      );

      const baseStore = useBaseGameStore();
      baseStore.resetAttempts();
      baseStore.clearNonCompletionMessage();
    },

    // Flag guessing by text input
    makeFlagGuess(guess: string) {
      if (!this.currentCountry) return;

      const currentCountry = this.currentCountry;
      const isCorrect = areStringsSimilar(guess, currentCountry.name);

      if (isCorrect) {
        this.handleCorrectFlagGuess(currentCountry);
      } else {
        this.handleIncorrectFlagGuess(currentCountry);
      }

      this.userGuessInput = "";
    },

    // Flag guessing by clicking on flag
    makeFlagGuessByFlag(flagCountryId: string) {
      if (!this.currentCountry) return;

      const currentCountry = this.currentCountry;
      const isCorrect = flagCountryId === currentCountry.id;

      if (isCorrect) {
        this.handleCorrectFlagByFlagGuess(currentCountry);
      } else {
        this.handleIncorrectFlagByFlagGuess(flagCountryId);
      }
    },

    handleCorrectFlagGuess(country: Country) {
      const baseStore = useBaseGameStore();
      baseStore.recordCorrectGuess();

      this.countryStatus[country.id] = "correct";
      baseStore.resetAttempts();
      baseStore.setMessage(`Correct ! C'est bien ${country.name}.`);
      this.removeCountryFromAvailable(country.id);
      this.scheduleNextQuestion();
    },

    handleCorrectFlagByFlagGuess(country: Country) {
      const baseStore = useBaseGameStore();
      baseStore.recordCorrectGuess();

      this.countryStatus[country.id] = "correct";
      baseStore.resetAttempts();
      baseStore.setMessage(
        `Correct ! C'était bien le drapeau de ${country.name}.`,
      );
      this.removeCountryFromAvailable(country.id);
      this.scheduleNextQuestion();
    },

    handleIncorrectFlagGuess(country: Country) {
      const baseStore = useBaseGameStore();
      baseStore.recordIncorrectGuess();

      this.setFlagHintMessage(country);
      baseStore.clearMessageWithDelay();
    },

    handleIncorrectFlagByFlagGuess(flagCountryId: string) {
      const baseStore = useBaseGameStore();
      baseStore.recordIncorrectGuess();

      baseStore.setMessage("Incorrect. Essaie encore ou passe.");
      baseStore.clearMessageWithDelay();
    },

    setFlagHintMessage(country: Country) {
      const baseStore = useBaseGameStore();
      if (baseStore.incorrectAttempts >= HINT_THRESHOLD) {
        const firstLetter = country.name.charAt(0);
        baseStore.setMessage(
          `Indice : Le pays commence par "${firstLetter}". Essaie encore ou passe.`,
        );
      } else {
        baseStore.setMessage("Incorrect. Essaie encore ou passe.");
      }
    },

    // Skip functionality
    skipFlag() {
      if (!this.currentCountry) return;

      const baseStore = useBaseGameStore();

      // In reverse flag mode (country -> flag), don't show country name since user already knows it
      // In standard flag mode (flag -> country), show country name so user learns what it was
      if (this.reverseFlagMode) {
        baseStore.setMessage("Passé.");
      } else {
        baseStore.setMessage({
          component: SkipToast,
          props: {
            prefix: "Passé. C'était : ",
            departmentName: this.currentCountry.name,
          },
        });
      }

      baseStore.resetAttempts();

      setTimeout(() => {
        this.selectRandomCountry();
        baseStore.clearMessageWithDelay();
      }, 100);
    },

    // Utility methods
    setReverseFlagMode(mode: boolean) {
      this.reverseFlagMode = mode;
    },

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
