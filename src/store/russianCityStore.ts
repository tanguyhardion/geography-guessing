import { defineStore } from "pinia";
import { russianCities } from "../data/russianCities";
import type { RussianCity, RussianCityStatus } from "../types";
import { useBaseGameStore, SUCCESS_DELAY } from "./baseGameStore";

// Constants
const COMPLETION_MESSAGE = "Félicitations ! Tu as localisé toutes les villes ! D'autres villes sont à venir.";

interface RussianCityGameState {
  russianCities: RussianCity[];
  currentRussianCity: RussianCity | null;
  russianCityStatus: RussianCityStatus;
  availableRussianCities: RussianCity[];
}

export const useRussianCityStore = defineStore("russianCities", {
  state: (): RussianCityGameState => ({
    russianCities,
    currentRussianCity: null,
    russianCityStatus: {},
    availableRussianCities: [...russianCities],
  }),

  getters: {
    // Status getters
    getRussianCityStatus: (state) => (cityId: string) => {
      return state.russianCityStatus[cityId] || "default";
    },

    // Totals
    totalRussianCities: (state) => {
      return state.russianCities.length;
    },

    // Display content
    currentQuestionDisplay: (state) => {
      return state.currentRussianCity?.name || "";
    },

    // Game state checks
    isGameComplete: (state) => {
      return state.availableRussianCities.length === 0;
    },
  },

  actions: {
    // Game initialization
    initializeGame() {
      const baseStore = useBaseGameStore();
      baseStore.resetGameState();
      this.initializeRussianCitiesGame();
    },

    initializeRussianCitiesGame() {
      this.availableRussianCities = [...this.russianCities];
      this.russianCityStatus = {};
      this.selectRandomRussianCity();
    },

    // Random selection
    selectRandomRussianCity() {
      if (this.availableRussianCities.length === 0) {
        this.handleGameCompletion();
        return;
      }

      const randomIndex = Math.floor(Math.random() * this.availableRussianCities.length);
      this.currentRussianCity = this.availableRussianCities[randomIndex];
      
      const baseStore = useBaseGameStore();
      baseStore.clearNonCompletionMessage();
    },

    // Russian cities guessing
    makeRussianCityGuess(cityId: string, cityName?: string) {
      if (!this.currentRussianCity) return;

      const currentCityId = this.currentRussianCity.id;
      const isCorrect = cityId === currentCityId;

      if (isCorrect) {
        this.handleCorrectRussianCityGuess(this.currentRussianCity);
      } else {
        this.handleIncorrectRussianCityGuess(cityId, cityName);
      }
    },

    handleCorrectRussianCityGuess(city: RussianCity) {
      const baseStore = useBaseGameStore();
      baseStore.recordCorrectGuess();

      this.russianCityStatus[city.id] = "correct";
      baseStore.setMessage(`Correct ! C'est bien ${city.name}.`);
      this.removeRussianCityFromAvailable(city.id);
      this.scheduleNextQuestion();
    },

    handleIncorrectRussianCityGuess(cityId: string, cityName?: string) {
      const baseStore = useBaseGameStore();
      baseStore.recordIncorrectGuess();

      if (cityId) {
        // Find the French name for the clicked city
        const clickedCity = this.russianCities.find((c) => c.id === cityId);
        const frenchName = clickedCity ? clickedCity.name : cityName;

        if (frenchName) {
          baseStore.setMessage(`Incorrect. Tu as cliqué sur ${frenchName}. Essaie encore ou passe.`);
        } else {
          baseStore.setMessage("Incorrect. Essaie encore ou passe.");
        }
      } else {
        baseStore.setMessage("Incorrect. Essaie encore ou passe.");
      }
      baseStore.clearMessageWithDelay();
    },

    // Skip functionality
    skipRussianCity() {
      if (!this.currentRussianCity) return;

      const baseStore = useBaseGameStore();
      baseStore.setMessage("Passé.");

      setTimeout(() => {
        this.selectRandomRussianCity();
        baseStore.clearMessageWithDelay();
      }, 100);
    },

    handleGameCompletion() {
      this.currentRussianCity = null;
      const baseStore = useBaseGameStore();
      baseStore.setMessage(COMPLETION_MESSAGE);
    },

    scheduleNextQuestion() {
      setTimeout(() => {
        this.selectRandomRussianCity();
        const baseStore = useBaseGameStore();
        baseStore.clearMessageWithDelay();
      }, SUCCESS_DELAY);
    },

    removeRussianCityFromAvailable(cityId: string) {
      this.availableRussianCities = this.availableRussianCities.filter(
        (city) => city.id !== cityId,
      );
    },
  },
});
