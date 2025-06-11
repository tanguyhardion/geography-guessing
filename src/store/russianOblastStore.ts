import { defineStore } from "pinia";
import { russianOblasts } from "../data/russianOblasts";
import type { RussianOblast, RussianOblastStatus } from "../types";
import { useBaseGameStore, SUCCESS_DELAY } from "./baseGameStore";
import { selectRandomItemWeighted } from "../utils/randomSelection";

// Constants
const COMPLETION_MESSAGE =
  "Félicitations ! Tu as localisé toutes les régions ! D'autres régions sont à venir.";

interface RussianOblastGameState {
  russianOblasts: RussianOblast[];
  currentRussianOblast: RussianOblast | null;
  russianOblastStatus: RussianOblastStatus;
  availableRussianOblasts: RussianOblast[];
  previousRussianOblast: RussianOblast | null; // Track previous to avoid immediate re-selection
}

export const useRussianOblastStore = defineStore("russianOblasts", {
  state: (): RussianOblastGameState => ({
    russianOblasts,
    currentRussianOblast: null,
    russianOblastStatus: {},
    availableRussianOblasts: [...russianOblasts],
    previousRussianOblast: null,
  }),

  getters: {
    // Status getters
    getRussianOblastStatus: (state) => (oblastId: string) => {
      return state.russianOblastStatus[oblastId] || "default";
    },

    // Totals
    totalRussianOblasts: (state) => {
      return state.russianOblasts.length;
    },

    // Display content
    currentQuestionDisplay: (state) => {
      return state.currentRussianOblast?.name || "";
    },

    // Game state checks
    isGameComplete: (state) => {
      return state.availableRussianOblasts.length === 0;
    },
  },

  actions: {
    // Game initialization
    initializeGame() {
      const baseStore = useBaseGameStore();
      baseStore.resetGameState();
      this.initializeRussianOblastsGame();
    },

    initializeRussianOblastsGame() {
      this.availableRussianOblasts = [...this.russianOblasts];
      this.russianOblastStatus = {};
      this.previousRussianOblast = null; // Reset previous oblast
      this.selectRandomRussianOblast();
    },

    // Random selection
    selectRandomRussianOblast() {
      if (this.availableRussianOblasts.length === 0) {
        this.handleGameCompletion();
        return;
      }

      // Use improved random selection to avoid immediate re-selection
      this.previousRussianOblast = this.currentRussianOblast;
      this.currentRussianOblast = selectRandomItemWeighted(
        this.availableRussianOblasts,
        this.previousRussianOblast,
      );

      const baseStore = useBaseGameStore();
      baseStore.clearNonCompletionMessage();
    },

    // Russian oblasts guessing
    makeRussianOblastGuess(oblastId: string, oblastName?: string) {
      if (!this.currentRussianOblast) return;

      const currentOblastId = this.currentRussianOblast.id;
      const isCorrect = oblastId === currentOblastId;

      if (isCorrect) {
        this.handleCorrectRussianOblastGuess(this.currentRussianOblast);
      } else {
        this.handleIncorrectRussianOblastGuess(oblastId, oblastName);
      }
    },

    handleCorrectRussianOblastGuess(oblast: RussianOblast) {
      const baseStore = useBaseGameStore();
      baseStore.recordCorrectGuess();

      this.russianOblastStatus[oblast.id] = "correct";
      baseStore.setMessage(`Correct ! C'est bien ${oblast.name}.`);
      this.removeRussianOblastFromAvailable(oblast.id);
      this.scheduleNextQuestion();
    },

    handleIncorrectRussianOblastGuess(oblastId: string, oblastName?: string) {
      const baseStore = useBaseGameStore();
      baseStore.recordIncorrectGuess();

      if (oblastId) {
        // Find the name for the clicked oblast
        const clickedOblast = this.russianOblasts.find((o) => o.id === oblastId);
        const oblastDisplayName = clickedOblast ? clickedOblast.name : oblastName;

        if (oblastDisplayName) {
          baseStore.setMessage(
            `Incorrect. Tu as cliqué sur ${oblastDisplayName}. Essaie encore ou passe.`,
          );
        } else {
          baseStore.setMessage("Incorrect. Essaie encore ou passe.");
        }
      } else {
        baseStore.setMessage("Incorrect. Essaie encore ou passe.");
      }
      baseStore.clearMessageWithDelay();
    },

    // Skip functionality
    skipRussianOblast() {
      if (!this.currentRussianOblast) return;

      const baseStore = useBaseGameStore();
      baseStore.setMessage("Passé.");

      setTimeout(() => {
        this.selectRandomRussianOblast();
        baseStore.clearMessageWithDelay();
      }, 100);
    },

    handleGameCompletion() {
      this.currentRussianOblast = null;
      const baseStore = useBaseGameStore();
      baseStore.setMessage(COMPLETION_MESSAGE);
    },

    scheduleNextQuestion() {
      setTimeout(() => {
        this.selectRandomRussianOblast();
        const baseStore = useBaseGameStore();
        baseStore.clearMessageWithDelay();
      }, SUCCESS_DELAY);
    },

    removeRussianOblastFromAvailable(oblastId: string) {
      this.availableRussianOblasts = this.availableRussianOblasts.filter(
        (oblast) => oblast.id !== oblastId,
      );
    },
  },
});
