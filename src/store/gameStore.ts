import { defineStore } from "pinia";
import { departments } from "../data/departments";
import type { Department, GameMode, DepartmentStatus } from "../types";

interface GameState {
  departments: Department[];
  currentDepartment: Department | null;
  gameMode: GameMode;
  departmentStatus: DepartmentStatus;
  score: number;
  message: string | null;
  availableDepartments: Department[];
  currentGuessType: "name" | "chefLieu" | null;
  guessedParts: {
    [departmentId: string]: { nameGuessed: boolean; chefLieuGuessed: boolean };
  };
}

export const useGameStore = defineStore("game", {
  state: (): GameState => ({
    departments,
    currentDepartment: null,
    gameMode: "guessChefLieu",
    departmentStatus: {},
    score: 0,
    message: null,
    availableDepartments: [...departments],
    currentGuessType: null,
    guessedParts: {},
  }),
  getters: {
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
    totalDepartments: (state) => state.departments.length,
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
        return {
          id: d.id,
          status,
        };
      });
    },
    currentQuestionDisplay: (state) => {
      if (!state.currentDepartment) return "";
      if (state.gameMode === "guessChefLieu") {
        return state.currentDepartment.name;
      } else if (state.gameMode === "guessDepartmentName") {
        return state.currentDepartment.chefLieu;
      } else if (state.gameMode === "guessBoth") {
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
      return "";
    },
  },
  actions: {
    _clearTemporaryIncorrectStatuses() {
      for (const id in this.departmentStatus) {
        if (this.departmentStatus[id] === "incorrect") {
          if (
            this.gameMode !== "guessBoth" ||
            !this.guessedParts[id] ||
            (!this.guessedParts[id].nameGuessed &&
              !this.guessedParts[id].chefLieuGuessed)
          ) {
            this.departmentStatus[id] = "default";
          } else if (
            this.gameMode === "guessBoth" &&
            this.guessedParts[id] &&
            (this.guessedParts[id].nameGuessed ||
              this.guessedParts[id].chefLieuGuessed) &&
            !(
              this.guessedParts[id].nameGuessed &&
              this.guessedParts[id].chefLieuGuessed
            )
          ) {
            this.departmentStatus[id] = "correctName";
          }
        }
      }
    },
    initializeGame() {
      this.availableDepartments = [...this.departments];
      this.departmentStatus = {};
      this.score = 0;
      this.message = null;
      this.guessedParts = {};
      this.departments.forEach((dep) => {
        this.guessedParts[dep.id] = {
          nameGuessed: false,
          chefLieuGuessed: false,
        };
      });
      this.selectRandomDepartment();
    },
    selectRandomDepartment() {
      if (this.availableDepartments.length === 0) {
        this.currentDepartment = null;
        this.currentGuessType = null;
        this.message =
          "Félicitations ! Vous avez deviné tous les départements !";
        return;
      }

      const randomIndex = Math.floor(
        Math.random() * this.availableDepartments.length
      );
      this.currentDepartment = this.availableDepartments[randomIndex];

      if (this.gameMode === "guessBoth") {
        const parts = this.guessedParts[this.currentDepartment.id];
        if (!parts || (parts.nameGuessed && parts.chefLieuGuessed)) {
          this.currentGuessType = Math.random() < 0.5 ? "name" : "chefLieu";
        } else if (!parts.nameGuessed && !parts.chefLieuGuessed) {
          this.currentGuessType = Math.random() < 0.5 ? "name" : "chefLieu";
        } else if (!parts.nameGuessed) {
          this.currentGuessType = "chefLieu";
        } else {
          this.currentGuessType = "name";
        }
      } else {
        this.currentGuessType = null;
      }
      if (
        this.message !==
        "Félicitations ! Vous avez deviné tous les départements !"
      ) {
        this.message = null;
      }
    },
    makeGuess(departmentId: string) {
      if (!this.currentDepartment) return;

      const currentDeptId = this.currentDepartment.id;

      if (this.gameMode === "guessBoth") {
        if (!this.guessedParts[currentDeptId]) { // Should be initialized, but good safeguard
          this.guessedParts[currentDeptId] = { nameGuessed: false, chefLieuGuessed: false };
        }

        if (departmentId === currentDeptId) { // User clicked the correct department for the current question
          if (this.currentGuessType === "name") { // Name was shown, so user implicitly guessed chef-lieu by identifying the department
            this.guessedParts[currentDeptId].chefLieuGuessed = true;
            this.message = `Chef-lieu correct pour ${this.currentDepartment.name} !`;
          } else if (this.currentGuessType === "chefLieu") { // Chef-lieu was shown, user implicitly guessed name
            this.guessedParts[currentDeptId].nameGuessed = true;
            this.message = `Nom correct pour ${this.currentDepartment.chefLieu} !`;
          }

          if (this.guessedParts[currentDeptId].nameGuessed && this.guessedParts[currentDeptId].chefLieuGuessed) {
            this.departmentStatus[currentDeptId] = "correctBoth";
            this.score++;
            this.message = `Correct pour ${this.currentDepartment.name} / ${this.currentDepartment.chefLieu} !`;
            this.availableDepartments = this.availableDepartments.filter(dep => dep.id !== currentDeptId);
            this._clearTemporaryIncorrectStatuses(); // Clear reds for other departments
            setTimeout(() => {
              this.selectRandomDepartment();
              this.clearMessageWithDelay();
            }, 1000);
          } else {
            // Only one part guessed, set status to blue
            this.departmentStatus[currentDeptId] = this.guessedParts[currentDeptId].nameGuessed ? "correctName" : "correctChefLieu";
            this.message += " Maintenant, devinez l'autre partie !";
            // Flip currentGuessType to ask for the other part of the SAME department
            this.currentGuessType = this.currentGuessType === "name" ? "chefLieu" : "name";
            this.clearMessageWithDelay();
          }
        } else { // User clicked an incorrect department ID
          this.departmentStatus[departmentId] = "incorrect"; // Mark the clicked (wrong) one red
          this.message = "Incorrect. Essayez encore ou passez.";
          this.clearMessageWithDelay();
        }
      } else { // Handle other game modes: "guessChefLieu" or "guessDepartmentName"
        if (departmentId === currentDeptId) {
          this.departmentStatus[departmentId] = "correctBoth"; // Green for these modes
          this._clearTemporaryIncorrectStatuses();
          this.score++;
          this.message = "Correct !";
          this.availableDepartments = this.availableDepartments.filter(dep => dep.id !== departmentId);
          setTimeout(() => {
            this.selectRandomDepartment();
            this.clearMessageWithDelay();
          }, 1000);
        } else {
          this.departmentStatus[departmentId] = "incorrect";
          this.message = "Incorrect. Essayez encore ou passez.";
          this.clearMessageWithDelay();
        }
      }
    },
    skipDepartment() {
      if (!this.currentDepartment) return;
      this._clearTemporaryIncorrectStatuses();

      if (this.gameMode === "guessBoth") {
        this.message = `Passé. C'était : ${this.currentDepartment.name} (${this.currentDepartment.chefLieu})`;
      } else {
        this.message = "Passé.";
      }
      this.selectRandomDepartment();
      this.clearMessageWithDelay();
    },
    setGameMode(mode: GameMode) {
      this.gameMode = mode;
      this.initializeGame();
    },
    clearMessageWithDelay() {
      if (
        this.message ===
        "Félicitations ! Vous avez deviné tous les départements !"
      ) {
        return;
      }
      setTimeout(() => {
        this.message = null;
      }, 2000);
    },
  },
});
