import { defineStore } from "pinia";
import { frenchChefLieux } from "../data/frenchChefLieux";
import type { FrenchChefLieu, FrenchChefLieuStatus } from "../types";
import { useBaseGameStore, SUCCESS_DELAY } from "./baseGameStore";

// Constants
const COMPLETION_MESSAGE = "Félicitations ! Tu as trouvé tous les chef-lieux français !";

interface FrenchChefLieuGameState {
  frenchChefLieux: FrenchChefLieu[];
  currentFrenchChefLieu: FrenchChefLieu | null;
  frenchChefLieuStatus: FrenchChefLieuStatus;
  availableFrenchChefLieux: FrenchChefLieu[];
}

// Helper function to filter metropolitan France chef-lieux
function isMetropolitanChefLieu(chefLieu: FrenchChefLieu): boolean {
  // Include metropolitan France departments (01-95) and Corsica (2A, 2B)
  // Exclude overseas departments (971, 972, 973, 974, 976)
  return !chefLieu.id.startsWith("97");
}

export const useFrenchChefLieuStore = defineStore("frenchChefLieux", {
  state: (): FrenchChefLieuGameState => ({
    frenchChefLieux,
    currentFrenchChefLieu: null,
    frenchChefLieuStatus: {},
    availableFrenchChefLieux: [...frenchChefLieux],
  }),

  getters: {
    // Status getters
    getFrenchChefLieuStatus: (state) => (chefLieuId: string) => {
      return state.frenchChefLieuStatus[chefLieuId] || "default";
    },

    // Totals
    totalFrenchChefLieux: (state) => {
      // Only include metropolitan France chef-lieux for the game
      return state.frenchChefLieux.filter(isMetropolitanChefLieu).length;
    },

    // Display content
    currentQuestionDisplay: (state) => {
      return state.currentFrenchChefLieu?.name || "";
    },

    // Game state checks
    isGameComplete: (state) => {
      return state.availableFrenchChefLieux.length === 0;
    },
  },

  actions: {
    // Game initialization
    initializeGame() {
      const baseStore = useBaseGameStore();
      baseStore.resetGameState();
      this.initializeFrenchChefLieuGame();
    },

    initializeFrenchChefLieuGame() {
      // Only include metropolitan France chef-lieux for the game
      this.availableFrenchChefLieux = this.frenchChefLieux.filter(isMetropolitanChefLieu);
      this.frenchChefLieuStatus = {};
      this.selectRandomFrenchChefLieu();
    },

    // Random selection
    selectRandomFrenchChefLieu() {
      if (this.availableFrenchChefLieux.length === 0) {
        this.currentFrenchChefLieu = null;
        this.handleGameCompletion();
        return;
      }

      const randomIndex = Math.floor(Math.random() * this.availableFrenchChefLieux.length);
      this.currentFrenchChefLieu = this.availableFrenchChefLieux[randomIndex];
    },

    // French chef-lieu guessing
    makeFrenchChefLieuGuess(chefLieuId: string, chefLieuName?: string) {
      if (!this.currentFrenchChefLieu) return;

      const currentChefLieuId = this.currentFrenchChefLieu.id;
      const isCorrect = chefLieuId === currentChefLieuId;

      if (isCorrect) {
        this.handleCorrectFrenchChefLieuGuess(this.currentFrenchChefLieu);
      } else {
        this.handleIncorrectFrenchChefLieuGuess(chefLieuId, chefLieuName);
      }
    },

    handleCorrectFrenchChefLieuGuess(chefLieu: FrenchChefLieu) {
      const baseStore = useBaseGameStore();
      baseStore.recordCorrectGuess();

      this.frenchChefLieuStatus[chefLieu.id] = "correct";
      baseStore.setMessage(`Correct ! C'est bien ${chefLieu.name}.`);
      this.removeFrenchChefLieuFromAvailable(chefLieu.id);
      this.scheduleNextQuestion();
    },

    handleIncorrectFrenchChefLieuGuess(chefLieuId: string, chefLieuName?: string) {
      const baseStore = useBaseGameStore();
      baseStore.recordIncorrectGuess();

      if (chefLieuId) {
        // Find the clicked chef-lieu name
        const clickedChefLieu = this.frenchChefLieux.find((c) => c.id === chefLieuId);
        const clickedName = clickedChefLieu ? clickedChefLieu.name : chefLieuName;

        if (clickedName) {
          baseStore.setMessage(`Incorrect. Tu as cliqué sur ${clickedName}. Essaie encore ou passe.`);
        } else {
          baseStore.setMessage("Incorrect. Essaie encore ou passe.");
        }
      } else {
        baseStore.setMessage("Incorrect. Essaie encore ou passe.");
      }
      baseStore.clearMessageWithDelay();
    },    // Skip functionality
    skipFrenchChefLieu() {
      if (!this.currentFrenchChefLieu) return;

      const baseStore = useBaseGameStore();
      baseStore.setMessage("Passé");

      setTimeout(() => {
        this.selectRandomFrenchChefLieu();
        baseStore.clearMessageWithDelay();
      }, 100);
    },

    handleGameCompletion() {
      const baseStore = useBaseGameStore();
      baseStore.setMessage(COMPLETION_MESSAGE);
    },

    scheduleNextQuestion() {
      setTimeout(() => {
        this.selectRandomFrenchChefLieu();
      }, SUCCESS_DELAY);
    },

    removeFrenchChefLieuFromAvailable(chefLieuId: string) {
      this.availableFrenchChefLieux = this.availableFrenchChefLieux.filter(
        (c) => c.id !== chefLieuId
      );
    },
  },
});
