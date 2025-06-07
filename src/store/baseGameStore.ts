import { defineStore } from "pinia";

// Constants
export const HINT_THRESHOLD = 3;
export const MESSAGE_DELAY = 2000;
export const SUCCESS_DELAY = 1000;

// Shared types
export type ToastMessage = string | { component: any; props: any } | null;

// Base game state interface
export interface BaseGameState {
  score: number;
  totalGuesses: number;
  correctGuesses: number;
  message: ToastMessage;
  incorrectAttempts: number;
}

// Base game store with shared functionality
export const useBaseGameStore = defineStore("baseGame", {
  state: (): BaseGameState => ({
    score: 0,
    totalGuesses: 0,
    correctGuesses: 0,
    message: null,
    incorrectAttempts: 0,
  }),

  getters: {
    // Accuracy calculation (0-100%)
    accuracy: (state) => {
      if (state.totalGuesses === 0) return 100; // No guesses yet, show 100%
      return Math.round((state.correctGuesses / state.totalGuesses) * 100);
    },
  },

  actions: {
    resetGameState() {
      this.score = 0;
      this.totalGuesses = 0;
      this.correctGuesses = 0;
      this.message = null;
      this.incorrectAttempts = 0;
    },

    recordCorrectGuess() {
      this.totalGuesses++;
      this.correctGuesses++;
      this.score++;
    },

    recordIncorrectGuess() {
      this.totalGuesses++;
      this.incorrectAttempts++;
    },

    resetAttempts() {
      this.incorrectAttempts = 0;
    },

    clearMessageWithDelay() {
      if (this.isCompletionMessage()) return;

      setTimeout(() => {
        this.message = null;
      }, MESSAGE_DELAY);
    },

    isCompletionMessage(): boolean {
      return (
        typeof this.message === "string" &&
        this.message.includes("Félicitations")
      );
    },

    clearNonCompletionMessage() {
      if (!this.isCompletionMessage()) {
        this.message = null;
      }
    },    setMessage(message: ToastMessage) {
      this.message = message;
    },
  },
});
