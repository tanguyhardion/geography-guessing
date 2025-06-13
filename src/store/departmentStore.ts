import { defineStore } from "pinia";
import { departments } from "../data/departments";
import type { Department, GameMode, DepartmentStatus } from "../types";
import {
  useBaseGameStore,
  SUCCESS_DELAY,
  type ToastMessage,
} from "./baseGameStore";
import { selectRandomItemWeighted } from "../utils/randomSelection";

// Constants
const COMPLETION_MESSAGE =
  "Félicitations ! Tu as deviné tous les départements !";

// Types
type GuessType = "name" | "chefLieu";
type DepartmentParts = { nameGuessed: boolean; chefLieuGuessed: boolean };

interface DepartmentGameState {
  departments: Department[];
  currentDepartment: Department | null;
  gameMode: GameMode;
  departmentStatus: DepartmentStatus;
  availableDepartments: Department[];
  currentGuessType: GuessType | null;
  guessedParts: Record<string, DepartmentParts>;
  previousDepartment: Department | null; // Track previous to avoid immediate re-selection
}

// Helper functions
function isMetropolitanDepartment(department: Department): boolean {
  // Include metropolitan France departments (01-95) and Corsica (2A, 2B)
  // Exclude overseas departments (971, 972, 973, 974, 976)
  return !department.id.startsWith("97");
}

function getGuessBothDisplay(
  state: DepartmentGameState,
  currentDepartment: Department,
): string {
  if (state.currentGuessType === "name") {
    return currentDepartment.name;
  } else if (state.currentGuessType === "chefLieu") {
    return currentDepartment.chefLieu;
  }

  const parts = state.guessedParts[currentDepartment.id];
  if (parts) {
    if (!parts.nameGuessed && !parts.chefLieuGuessed) {
      return Math.random() < 0.5
        ? currentDepartment.name
        : currentDepartment.chefLieu;
    } else if (!parts.nameGuessed) {
      return currentDepartment.chefLieu;
    } else if (!parts.chefLieuGuessed) {
      return currentDepartment.name;
    }
  }

  return currentDepartment.name;
}

export const useDepartmentStore = defineStore("departments", {
  state: (): DepartmentGameState => ({
    departments,
    currentDepartment: null,
    gameMode: "guessChefLieu",
    departmentStatus: {},
    availableDepartments: [...departments],
    currentGuessType: null,
    guessedParts: {},
    previousDepartment: null,
  }),

  getters: {
    // Status getters
    getDepartmentStatus: (state) => (departmentId: string) => {
      if (state.gameMode === "guessBoth" && state.guessedParts[departmentId]) {
        const parts = state.guessedParts[departmentId];
        if (parts.nameGuessed && parts.chefLieuGuessed) {
          return "correctBoth";
        } else if (parts.nameGuessed || parts.chefLieuGuessed) {
          return "correctName";
        }
      }
      return state.departmentStatus[departmentId] || "default";
    },

    // Totals
    totalDepartments: (state) => {
      if (state.gameMode === "guessMapLocation") {
        return state.departments.filter(isMetropolitanDepartment).length;
      }
      return state.departments.length;
    },

    // Computed lists
    departmentsForList: (state) => {
      // Filter departments for map location mode
      const departmentsToShow =
        state.gameMode === "guessMapLocation"
          ? state.departments.filter(isMetropolitanDepartment)
          : state.departments;

      return departmentsToShow.map((d) => {
        let status: DepartmentStatus[string] =
          state.departmentStatus[d.id] || "default";

        if (state.gameMode === "guessBoth" && state.guessedParts[d.id]) {
          const parts = state.guessedParts[d.id];
          if (parts.nameGuessed && parts.chefLieuGuessed) {
            status = "correctBoth";
          } else if (parts.nameGuessed || parts.chefLieuGuessed) {
            status = "correctName";
          }
        }

        return { id: d.id, status };
      });
    },

    // Display content
    currentQuestionDisplay: (state) => {
      if (!state.currentDepartment) return "";

      switch (state.gameMode) {
        case "guessChefLieu":
          return state.currentDepartment.chefLieu;
        case "guessDepartmentName":
          return state.currentDepartment.name;
        case "guessBoth":
          return getGuessBothDisplay(state, state.currentDepartment);
        case "guessMapLocation":
          return state.currentDepartment.name;
        default:
          return "";
      }
    },

    // Game state checks
    isGameComplete: (state) => {
      return state.availableDepartments.length === 0;
    },
  },

  actions: {
    // Game initialization
    initializeGame() {
      const baseStore = useBaseGameStore();
      baseStore.resetGameState();
      this.initializeDepartmentGame();
    },

    initializeDepartmentGame() {
      if (this.gameMode === "guessMapLocation") {
        // For map location mode, only include metropolitan France departments
        this.availableDepartments = this.departments.filter(
          isMetropolitanDepartment,
        );
      } else {
        this.availableDepartments = [...this.departments];
      }
      this.departmentStatus = {};
      this.previousDepartment = null; // Reset previous department
      this.initializeGuessedParts();
      this.selectRandomDepartment();
    },

    initializeGuessedParts() {
      this.guessedParts = {};
      this.departments.forEach((dep) => {
        this.guessedParts[dep.id] = {
          nameGuessed: false,
          chefLieuGuessed: false,
        };
      });
    },

    // Random selection
    selectRandomDepartment() {
      if (this.availableDepartments.length === 0) {
        this.handleGameCompletion();
        return;
      }

      // Use improved random selection to avoid immediate re-selection
      this.previousDepartment = this.currentDepartment;
      this.currentDepartment = selectRandomItemWeighted(
        this.availableDepartments,
        this.previousDepartment,
      );

      if (this.gameMode === "guessBoth") {
        this.setGuessBothType();
      } else {
        this.currentGuessType = null;
      }

      const baseStore = useBaseGameStore();
      baseStore.clearNonCompletionMessage();
    },

    setGuessBothType() {
      if (!this.currentDepartment) return;

      const parts = this.ensureGuessedPartsExists(this.currentDepartment.id);

      if (parts.nameGuessed && !parts.chefLieuGuessed) {
        this.currentGuessType = "name"; // Show name, ask for chef-lieu
      } else if (!parts.nameGuessed && parts.chefLieuGuessed) {
        this.currentGuessType = "chefLieu"; // Show chef-lieu, ask for name
      } else {
        this.currentGuessType = Math.random() < 0.5 ? "name" : "chefLieu";
      }
    },

    // Guessing logic
    makeGuess(departmentId: string, departmentName?: string) {
      if (!this.currentDepartment) return;

      const currentDeptId = this.currentDepartment.id;
      const isCorrect = departmentId === currentDeptId;

      if (this.gameMode === "guessBoth") {
        this.handleGuessBothGuess(departmentId, isCorrect, departmentName);
      } else {
        this.handleSimpleGuess(departmentId, isCorrect, departmentName);
      }
    },

    handleGuessBothGuess(
      departmentId: string,
      isCorrect: boolean,
      departmentName?: string,
    ) {
      if (!this.currentDepartment) return;

      const currentDeptId = this.currentDepartment.id;
      const parts = this.ensureGuessedPartsExists(currentDeptId);

      if (isCorrect) {
        this.handleCorrectGuessBothGuess(parts, currentDeptId);
      } else {
        this.handleIncorrectGuess(departmentId, departmentName);
      }
    },

    handleCorrectGuessBothGuess(parts: DepartmentParts, currentDeptId: string) {
      if (!this.currentDepartment) return;

      const baseStore = useBaseGameStore();
      baseStore.recordCorrectGuess();

      const partType = this.updateGuessedPart(parts);
      this.setPartialSuccessMessage(partType);

      if (parts.nameGuessed && parts.chefLieuGuessed) {
        this.handleCompleteGuessBothSuccess(currentDeptId);
      } else {
        this.setPartialCorrectStatus(currentDeptId, parts);
        this.scheduleNextQuestion();
      }
    },

    updateGuessedPart(parts: DepartmentParts): string {
      if (this.currentGuessType === "name") {
        parts.chefLieuGuessed = true;
        return "Chef-lieu";
      } else {
        parts.nameGuessed = true;
        return "Nom";
      }
    },

    setPartialSuccessMessage(partType: string) {
      if (!this.currentDepartment) return;

      const baseStore = useBaseGameStore();
      const reference =
        this.currentGuessType === "name"
          ? this.currentDepartment.name
          : this.currentDepartment.chefLieu;
      baseStore.setMessage(`${partType} correct pour ${reference} !`);
    },

    handleCompleteGuessBothSuccess(currentDeptId: string) {
      if (!this.currentDepartment) return;

      const baseStore = useBaseGameStore();
      this.departmentStatus[currentDeptId] = "correctBoth";
      baseStore.setMessage(
        `Correct pour ${this.currentDepartment.name} / ${this.currentDepartment.chefLieu} !`,
      );
      this.removeDepartmentFromAvailable(currentDeptId);
      this.scheduleNextQuestion();
    },

    setPartialCorrectStatus(currentDeptId: string, parts: DepartmentParts) {
      this.departmentStatus[currentDeptId] = parts.nameGuessed
        ? "correctName"
        : "correctChefLieu";
    },

    handleSimpleGuess(
      departmentId: string,
      isCorrect: boolean,
      departmentName?: string,
    ) {
      if (isCorrect) {
        this.handleCorrectSimpleGuess(departmentId);
      } else {
        this.handleIncorrectGuess(departmentId, departmentName);
      }
    },

    handleCorrectSimpleGuess(departmentId: string) {
      const baseStore = useBaseGameStore();
      baseStore.recordCorrectGuess();

      this.departmentStatus[departmentId] = "correctBoth";
      baseStore.setMessage("Correct !");
      this.removeDepartmentFromAvailable(departmentId);
      this.scheduleNextQuestion();
    },
    handleIncorrectGuess(departmentId: string, departmentName?: string) {
      const baseStore = useBaseGameStore();
      baseStore.recordIncorrectGuess();

      // Find the department name from our data if not provided
      const clickedDepartment = this.departments.find(
        (dept) => dept.id === departmentId,
      );
      const displayName = departmentName || clickedDepartment?.name;

      if (displayName) {
        baseStore.setMessage(
          `Incorrect. Tu as cliqué sur ${displayName}. Essaie encore ou passe.`,
        );
      } else {
        baseStore.setMessage("Incorrect. Essaie encore ou passe.");
      }
      baseStore.clearMessageWithDelay();
    }, // Skip functionality
    skipDepartment() {
      if (!this.currentDepartment) return;

      this.setSkipMessage();

      setTimeout(() => {
        this.selectRandomDepartment();
        const baseStore = useBaseGameStore();
        baseStore.clearMessageWithDelay();
      }, 100);
    },
    setSkipMessage() {
      if (!this.currentDepartment) return;

      const baseStore = useBaseGameStore();
      baseStore.setMessage("Passé.");
    },

    // Utility methods
    setGameMode(mode: GameMode) {
      this.gameMode = mode;
      // Only initialize if it's a department-related game mode
      if (
        mode === "guessChefLieu" ||
        mode === "guessDepartmentName" ||
        mode === "guessBoth" ||
        mode === "guessMapLocation"
      ) {
        this.initializeGame();
      }
      // For other modes (world capitals, russian cities, french chef-lieux),
      // let the game adapter handle initialization
    },

    handleGameCompletion() {
      this.currentDepartment = null;
      this.currentGuessType = null;
      const baseStore = useBaseGameStore();
      baseStore.setMessage(COMPLETION_MESSAGE);
    },

    scheduleNextQuestion() {
      setTimeout(() => {
        this.selectRandomDepartment();
        const baseStore = useBaseGameStore();
        baseStore.clearMessageWithDelay();
      }, SUCCESS_DELAY);
    },

    removeDepartmentFromAvailable(departmentId: string) {
      this.availableDepartments = this.availableDepartments.filter(
        (dep) => dep.id !== departmentId,
      );
    },

    ensureGuessedPartsExists(departmentId: string): DepartmentParts {
      if (!this.guessedParts[departmentId]) {
        this.guessedParts[departmentId] = {
          nameGuessed: false,
          chefLieuGuessed: false,
        };
      }
      return this.guessedParts[departmentId];
    },
  },
});
