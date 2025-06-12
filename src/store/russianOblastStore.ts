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
    }, // Russian oblasts guessing
    makeRussianOblastGuess(
      oblastId: string,
      oblastName?: string,
      useRussian?: boolean,
    ) {
      if (!this.currentRussianOblast) return;

      const currentOblastId = this.currentRussianOblast.id;
      const isCorrect = oblastId === currentOblastId;

      if (isCorrect) {
        this.handleCorrectRussianOblastGuess(
          this.currentRussianOblast,
          useRussian,
        );
      } else {
        this.handleIncorrectRussianOblastGuess(
          oblastId,
          oblastName,
          useRussian,
        );
      }
    },
    handleCorrectRussianOblastGuess(
      oblast: RussianOblast,
      useRussian?: boolean,
    ) {
      const baseStore = useBaseGameStore();
      baseStore.recordCorrectGuess();

      this.russianOblastStatus[oblast.id] = "correct";
      const displayName = useRussian ? oblast.nameRu : oblast.name;
      baseStore.setMessage(`Correct ! C'est bien ${displayName}.`);
      this.removeRussianOblastFromAvailable(oblast.id);
      this.scheduleNextQuestion();
    },
    handleIncorrectRussianOblastGuess(
      oblastId: string,
      oblastName?: string,
      useRussian?: boolean,
    ) {
      const baseStore = useBaseGameStore();
      baseStore.recordIncorrectGuess();

      if (oblastId) {
        // Find the clicked oblast and get the correct name based on language preference
        const clickedOblast = this.russianOblasts.find(
          (o) => o.id === oblastId,
        );
        const displayName = clickedOblast
          ? useRussian
            ? clickedOblast.nameRu
            : clickedOblast.name
          : oblastName;

        if (displayName) {
          baseStore.setMessage(
            `Incorrect. Tu as cliqué sur ${displayName}. Essaie encore ou passe.`,
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
