import { defineStore } from "pinia";
import { departments } from "../data/departments";
import { countries } from "../data/countries";
import type {
  Department,
  Country,
  GameMode,
  DepartmentStatus,
  CountryStatus,
  Continent,
} from "../types";
import { areStringsSimilar } from "../utils/stringUtils";
import SkipToast from "../components/SkipToast.vue";

// Constants
const HINT_THRESHOLD = 3;
const MESSAGE_DELAY = 2000;
const SUCCESS_DELAY = 1000;
const COMPLETION_MESSAGES = {
  departments: "Félicitations ! Vous avez deviné tous les départements !",
  flags: "Félicitations ! Vous avez deviné tous les drapeaux !",
} as const;

// Types
type GuessType = "name" | "chefLieu";
type DepartmentParts = { nameGuessed: boolean; chefLieuGuessed: boolean };
type ToastMessage = string | { component: any; props: any } | null;

interface GameState {
  departments: Department[];
  countries: Country[];
  currentDepartment: Department | null;
  currentCountry: Country | null;
  gameMode: GameMode;
  departmentStatus: DepartmentStatus;
  countryStatus: CountryStatus;
  score: number;
  message: ToastMessage;
  availableDepartments: Department[];
  availableCountries: Country[];
  currentGuessType: GuessType | null;
  guessedParts: Record<string, DepartmentParts>;
  userGuessInput: string;
  incorrectAttempts: number;
  reverseFlagMode: boolean;
  selectedContinent: Continent | "all" | null;
}

export const useGameStore = defineStore("game", {
  state: (): GameState => ({
    departments,
    countries,
    currentDepartment: null,
    currentCountry: null,
    gameMode: "guessChefLieu",
    departmentStatus: {},
    countryStatus: {},
    score: 0,
    message: null,
    availableDepartments: [...departments],
    availableCountries: [...countries],
    currentGuessType: null,
    guessedParts: {},
    userGuessInput: "",
    incorrectAttempts: 0,
    reverseFlagMode: false,
    selectedContinent: null,
  }),

  getters: {
    // Status getters
    getDepartmentStatus: (state) => (departmentId: string) => {
      if (state.gameMode === "guessBoth" && state.guessedParts[departmentId]) {
        const parts = state.guessedParts[departmentId];
        if (parts.nameGuessed && parts.chefLieuGuessed) {
          return "correctBoth";
        } else if (parts.nameGuessed || parts.chefLieuGuessed) {
          return state.departmentStatus[departmentId] === "incorrect"
            ? "incorrect"
            : "correctName";
        }
      }
      return state.departmentStatus[departmentId] || "default";
    },

    getCountryStatus: (state) => (countryId: string) => {
      return state.countryStatus[countryId] || "default";
    }, // Totals
    totalDepartments: (state) => state.departments.length,
    totalCountries: (state) => {
      if (state.selectedContinent && state.selectedContinent !== "all") {
        return state.countries.filter(
          (country) => country.continent === state.selectedContinent
        ).length;
      }
      return state.countries.length;
    },

    // Available continents
    availableContinents: (state) => {
      const continents = new Set(state.countries.map((c) => c.continent));
      return Array.from(continents).sort();
    },

    // Computed lists
    departmentsForList: (state) => {
      return state.departments.map((d) => {
        let status: DepartmentStatus[string] =
          state.departmentStatus[d.id] || "default";

        if (state.gameMode === "guessBoth" && state.guessedParts[d.id]) {
          const parts = state.guessedParts[d.id];
          if (parts.nameGuessed && parts.chefLieuGuessed) {
            status = "correctBoth";
          } else if (parts.nameGuessed || parts.chefLieuGuessed) {
            if (state.departmentStatus[d.id] !== "incorrect") {
              status = "correctName";
            }
          }
        }

        return { id: d.id, status };
      });
    },

    // Display content
    currentQuestionDisplay: (state) => {
      if (state.gameMode === "guessFlags") {
        return state.currentCountry?.id || "";
      }

      if (!state.currentDepartment) return "";      switch (state.gameMode) {
        case "guessChefLieu":
          return state.currentDepartment.chefLieu;
        case "guessDepartmentName":
          return state.currentDepartment.name;
        case "guessBoth":
          return getGuessBothDisplay(state);
        case "guessMapLocation":
          return state.currentDepartment.name;
        default:
          return "";
      }
    },

    currentFlag: (state) => {
      if (state.gameMode === "guessFlags" && state.currentCountry) {
        return `https://flagcdn.com/${state.currentCountry.id}.svg`;
      }
      return "";
    },

    // Game state checks
    isGameComplete: (state) => {
      if (state.gameMode === "guessFlags") {
        return state.availableCountries.length === 0;
      }
      return state.availableDepartments.length === 0;
    },

    isInFlagMode: (state) => state.gameMode === "guessFlags",
  },

  actions: {
    // Game initialization
    initializeGame() {
      this.resetGameState();

      if (this.isInFlagMode) {
        this.initializeFlagGame();
      } else {
        this.initializeDepartmentGame();
      }
    },

    resetGameState() {
      this.score = 0;
      this.message = null;
      this.userGuessInput = "";
      this.incorrectAttempts = 0;
    },
    initializeFlagGame() {
      let filteredCountries = [...this.countries];

      // Filter by continent if one is selected
      if (this.selectedContinent && this.selectedContinent !== "all") {
        filteredCountries = filteredCountries.filter(
          (country) => country.continent === this.selectedContinent
        );
      }

      this.availableCountries = filteredCountries;
      this.countryStatus = {};
      this.selectRandomCountry();
    },

    initializeDepartmentGame() {
      this.availableDepartments = [...this.departments];
      this.departmentStatus = {};
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
    selectRandomCountry() {
      if (this.availableCountries.length === 0) {
        this.handleGameCompletion("flags");
        return;
      }

      const randomIndex = Math.floor(
        Math.random() * this.availableCountries.length
      );
      this.currentCountry = this.availableCountries[randomIndex];
      this.resetAttempts();
      this.clearNonCompletionMessage();
    },

    selectRandomDepartment() {
      if (this.availableDepartments.length === 0) {
        this.handleGameCompletion("departments");
        return;
      }

      const randomIndex = Math.floor(
        Math.random() * this.availableDepartments.length
      );
      this.currentDepartment = this.availableDepartments[randomIndex];

      if (this.gameMode === "guessBoth") {
        this.setGuessBothType();
      } else {
        this.currentGuessType = null;
      }

      this.clearNonCompletionMessage();
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
    makeGuess(departmentId: string) {
      if (this.isInFlagMode || !this.currentDepartment) return;

      const currentDeptId = this.currentDepartment.id;
      const isCorrect = departmentId === currentDeptId;

      if (this.gameMode === "guessBoth") {
        this.handleGuessBothGuess(departmentId, isCorrect);
      } else {
        this.handleSimpleGuess(departmentId, isCorrect);
      }
    },

    handleGuessBothGuess(departmentId: string, isCorrect: boolean) {
      if (!this.currentDepartment) return;

      const currentDeptId = this.currentDepartment.id;
      const parts = this.ensureGuessedPartsExists(currentDeptId);

      if (isCorrect) {
        this.handleCorrectGuessBothGuess(parts, currentDeptId);
      } else {
        this.handleIncorrectGuess(departmentId);
      }
    },

    handleCorrectGuessBothGuess(parts: DepartmentParts, currentDeptId: string) {
      if (!this.currentDepartment) return;

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

      const reference =
        this.currentGuessType === "name"
          ? this.currentDepartment.name
          : this.currentDepartment.chefLieu;
      this.message = `${partType} correct pour ${reference} !`;
    },

    handleCompleteGuessBothSuccess(currentDeptId: string) {
      if (!this.currentDepartment) return;

      this.departmentStatus[currentDeptId] = "correctBoth";
      this.score++;
      this.message = `Correct pour ${this.currentDepartment.name} / ${this.currentDepartment.chefLieu} !`;
      this.removeDepartmentFromAvailable(currentDeptId);
      this.clearTemporaryIncorrectStatuses();
      this.scheduleNextQuestion();
    },

    setPartialCorrectStatus(currentDeptId: string, parts: DepartmentParts) {
      this.departmentStatus[currentDeptId] = parts.nameGuessed
        ? "correctName"
        : "correctChefLieu";
    },

    handleSimpleGuess(departmentId: string, isCorrect: boolean) {
      if (isCorrect) {
        this.handleCorrectSimpleGuess(departmentId);
      } else {
        this.handleIncorrectGuess(departmentId);
      }
    },

    handleCorrectSimpleGuess(departmentId: string) {
      this.departmentStatus[departmentId] = "correctBoth";
      this.clearTemporaryIncorrectStatuses();
      this.score++;
      this.message = "Correct !";
      this.removeDepartmentFromAvailable(departmentId);
      this.scheduleNextQuestion();
    },

    handleIncorrectGuess(departmentId: string) {
      this.departmentStatus[departmentId] = "incorrect";
      this.message = "Incorrect. Essaie encore ou passe.";
      this.clearMessageWithDelay();
    },

    // Flag guessing
    makeFlagGuess(guess: string) {
      if (!this.isInFlagMode || !this.currentCountry) return;

      const currentCountry = this.currentCountry;
      const isCorrect = areStringsSimilar(guess, currentCountry.name);

      if (isCorrect) {
        this.handleCorrectFlagGuess(currentCountry);
      } else {
        this.handleIncorrectFlagGuess(currentCountry);
      }

      this.userGuessInput = "";
    },

    makeFlagGuessByFlag(flagCountryId: string) {
      if (!this.isInFlagMode || !this.currentCountry) return;

      const currentCountry = this.currentCountry;
      const isCorrect = flagCountryId === currentCountry.id;

      if (isCorrect) {
        this.handleCorrectFlagByFlagGuess(currentCountry);
      } else {
        this.handleIncorrectFlagByFlagGuess(flagCountryId);
      }
    },

    handleCorrectFlagGuess(country: Country) {
      this.countryStatus[country.id] = "correct";
      this.clearDepartmentIncorrectStatuses(); // Only clear department statuses, not country statuses
      this.score++;
      this.resetAttempts();
      this.message = `Correct ! C'est bien ${country.name}.`;
      this.removeCountryFromAvailable(country.id);
      this.scheduleNextQuestion();
    },

    handleCorrectFlagByFlagGuess(country: Country) {
      this.countryStatus[country.id] = "correct";
      this.clearDepartmentIncorrectStatuses(); // Only clear department statuses, not country statuses
      this.score++;
      this.resetAttempts();
      this.message = `Correct ! C'était bien le drapeau de ${country.name}.`;
      this.removeCountryFromAvailable(country.id);
      this.scheduleNextQuestion();
    },

    handleIncorrectFlagGuess(country: Country) {
      this.countryStatus[country.id] = "incorrect";
      this.incorrectAttempts++;
      this.setFlagHintMessage(country);
      this.clearMessageWithDelay();
    },

    handleIncorrectFlagByFlagGuess(flagCountryId: string) {
      this.countryStatus[flagCountryId] = "incorrect";
      this.incorrectAttempts++;

      this.message = "Incorrect. Essaie encore ou passe.";

      this.clearMessageWithDelay();
    },

    setFlagHintMessage(country: Country) {
      if (this.incorrectAttempts >= HINT_THRESHOLD) {
        const firstLetter = country.name.charAt(0);
        this.message = `Indice : Le pays commence par "${firstLetter}". Essaie encore ou passe.`;
      } else {
        this.message = "Incorrect. Essaie encore ou passe.";
      }
    },

    // Skip functionality
    skipDepartment() {
      if (this.isInFlagMode) {
        this.skipFlag();
        return;
      }

      if (!this.currentDepartment) return;

      this.clearTemporaryIncorrectStatuses();
      this.setSkipMessage();
      this.selectRandomDepartment();
      this.clearMessageWithDelay();
    },    skipFlag() {
      if (!this.isInFlagMode || !this.currentCountry) return;

      this.clearDepartmentIncorrectStatuses(); // Only clear department statuses, keep flag statuses
      
      // In reverse flag mode (country -> flag), don't show country name since user already knows it
      // In standard flag mode (flag -> country), show country name so user learns what it was
      if (this.reverseFlagMode) {
        this.message = "Passé.";
      } else {
        this.message = {
          component: SkipToast,
          props: {
            prefix: "Passé. C'était : ",
            departmentName: this.currentCountry.name
          }
        };
      }
      
      this.resetAttempts();

      setTimeout(() => {
        this.selectRandomCountry();
        this.clearMessageWithDelay();
      }, 100);
    },

    setSkipMessage() {
      if (!this.currentDepartment) return;

      if (this.gameMode === "guessBoth") {
        this.message = {
          component: SkipToast,
          props: {
            prefix: "Passé. C'était : ",
            departmentName: this.currentDepartment.name,
            chefLieu: this.currentDepartment.chefLieu
          }
        };
      } else {
        this.message = "Passé.";
      }
    },

    // Utility methods
    setGameMode(mode: GameMode) {
      this.gameMode = mode;
      this.initializeGame();
    },
    setReverseFlagMode(mode: boolean) {
      this.reverseFlagMode = mode;
    },

    setSelectedContinent(continent: Continent | "all" | null) {
      this.selectedContinent = continent;
    },

    clearTemporaryIncorrectStatuses() {
      this.clearDepartmentIncorrectStatuses();
      this.clearCountryIncorrectStatuses();
    },

    clearDepartmentIncorrectStatuses() {
      Object.keys(this.departmentStatus).forEach((id) => {
        if (this.departmentStatus[id] === "incorrect") {
          if (this.shouldResetDepartmentStatus(id)) {
            this.departmentStatus[id] = "default";
          } else if (this.shouldSetPartialStatus(id)) {
            this.departmentStatus[id] = "correctName";
          }
        }
      });
    },

    shouldResetDepartmentStatus(id: string): boolean {
      return (
        this.gameMode !== "guessBoth" ||
        !this.guessedParts[id] ||
        (!this.guessedParts[id].nameGuessed &&
          !this.guessedParts[id].chefLieuGuessed)
      );
    },

    shouldSetPartialStatus(id: string): boolean {
      const parts = this.guessedParts[id];
      return (
        this.gameMode === "guessBoth" &&
        parts &&
        (parts.nameGuessed || parts.chefLieuGuessed) &&
        !(parts.nameGuessed && parts.chefLieuGuessed)
      );
    },

    clearCountryIncorrectStatuses() {
      Object.keys(this.countryStatus).forEach((id) => {
        if (this.countryStatus[id] === "incorrect") {
          this.countryStatus[id] = "default";
        }
      });
    },

    clearMessageWithDelay() {
      if (this.isCompletionMessage()) return;

      setTimeout(() => {
        this.message = null;
      }, MESSAGE_DELAY);
    },

    isCompletionMessage(): boolean {
      return (
        typeof this.message === "string" && (
          this.message === COMPLETION_MESSAGES.departments ||
          this.message === COMPLETION_MESSAGES.flags
        )
      );
    },

    clearNonCompletionMessage() {
      if (!this.isCompletionMessage()) {
        this.message = null;
      }
    },

    handleGameCompletion(type: "departments" | "flags") {
      this.currentDepartment = null;
      this.currentCountry = null;
      this.currentGuessType = null;
      this.message = COMPLETION_MESSAGES[type];
    },

    scheduleNextQuestion() {
      setTimeout(() => {
        if (this.isInFlagMode) {
          this.selectRandomCountry();
        } else {
          this.selectRandomDepartment();
        }
        this.clearMessageWithDelay();
      }, SUCCESS_DELAY);
    },

    resetAttempts() {
      this.incorrectAttempts = 0;
    },

    removeDepartmentFromAvailable(departmentId: string) {
      this.availableDepartments = this.availableDepartments.filter(
        (dep) => dep.id !== departmentId
      );
    },

    removeCountryFromAvailable(countryId: string) {
      this.availableCountries = this.availableCountries.filter(
        (country) => country.id !== countryId
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

// Helper functions
function getGuessBothDisplay(state: GameState): string {
  if (!state.currentDepartment) return "";

  if (state.currentGuessType === "name") {
    return state.currentDepartment.name;
  } else if (state.currentGuessType === "chefLieu") {
    return state.currentDepartment.chefLieu;
  }

  const parts = state.guessedParts[state.currentDepartment.id];
  if (parts) {
    if (!parts.nameGuessed && !parts.chefLieuGuessed) {
      return Math.random() < 0.5
        ? state.currentDepartment.name
        : state.currentDepartment.chefLieu;
    } else if (!parts.nameGuessed) {
      return state.currentDepartment.chefLieu;
    } else if (!parts.chefLieuGuessed) {
      return state.currentDepartment.name;
    }
  }

  return state.currentDepartment.name;
}
