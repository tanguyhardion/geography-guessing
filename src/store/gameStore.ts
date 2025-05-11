import { defineStore } from 'pinia';
import { departments } from '../data/departments';
import type { Department, GameMode, DepartmentStatus } from '../types';

interface GameState {
  departments: Department[];
  currentDepartment: Department | null;
  gameMode: GameMode;
  departmentStatus: DepartmentStatus;
  score: number;
  message: string | null;
  availableDepartments: Department[];
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    departments,
    currentDepartment: null,
    gameMode: 'guessChefLieu',
    departmentStatus: {},
    score: 0,
    message: null,
    availableDepartments: [...departments],
  }),
  getters: {
    getDepartmentStatus: (state) => (departmentId: string) => {
      return state.departmentStatus[departmentId] || 'default';
    },
    totalDepartments: (state) => state.departments.length,
    departmentsForList: (state) => {
      return state.departments.map(d => ({ id: d.id, status: state.departmentStatus[d.id] || 'default' }));
    }
  },
  actions: {
    _clearTemporaryIncorrectStatuses() {
      for (const id in this.departmentStatus) {
        if (this.departmentStatus[id] === 'incorrect') {
          this.departmentStatus[id] = 'default';
        }
      }
    },
    initializeGame() {
      this.availableDepartments = [...this.departments];
      this.departmentStatus = {};
      this.score = 0;
      this.message = null; // Clear message on new game
      this.selectRandomDepartment();
    },
    selectRandomDepartment() {
      if (this.availableDepartments.length === 0) {
        this.currentDepartment = null;
        this.message = 'Félicitations ! Vous avez deviné tous les départements !';
        return;
      }
      const randomIndex = Math.floor(Math.random() * this.availableDepartments.length);
      this.currentDepartment = this.availableDepartments[randomIndex];
    },
    makeGuess(departmentId: string) {
      if (!this.currentDepartment) return;

      // Do NOT clear temporary incorrect statuses here if we want multiple reds for the current question.

      const guessedCorrectly = departmentId === this.currentDepartment.id;

      if (guessedCorrectly) {
        this.departmentStatus[departmentId] = 'correct';
        this._clearTemporaryIncorrectStatuses(); // Clear all reds now that the question is correctly answered.
        this.score++;
        this.message = 'Correct !';
        this.availableDepartments = this.availableDepartments.filter(dep => dep.id !== departmentId);
        
        setTimeout(() => {
          this.selectRandomDepartment();
          this.clearMessageWithDelay();
        }, 1000);

      } else {
        // If incorrect, just mark this one as incorrect. Others remain red if already marked.
        this.departmentStatus[departmentId] = 'incorrect'; 
        this.message = 'Incorrect. Essayez encore ou passez.';
        this.clearMessageWithDelay();
      }
    },
    skipDepartment() {
      this._clearTemporaryIncorrectStatuses(); // Clear any red marks from the skipped question.
      this.selectRandomDepartment();
      this.message = 'Passé.';
      this.clearMessageWithDelay(); // Clear "Skipped" message
    },
    setGameMode(mode: GameMode) {
      this.gameMode = mode;
      this.initializeGame();
    },
    clearMessageWithDelay() { // Removed clearIncorrectStatusOnTimeout parameter
      if (this.message === 'Félicitations ! Vous avez deviné tous les départements !') {
        return; // Don't clear the final congratulations message
      }
      setTimeout(() => {
        this.message = null;
        // No longer clearing statuses from here; it's handled by explicit actions.
      }, 2000);
    },
  },
});
