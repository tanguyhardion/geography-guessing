<template>
  <div class="homepage">
    <h1>Quiz Géographique</h1>

    <div class="game-selector">
      <div
        class="game-type"
        :class="{ active: selectedGame === 'departments' }"
        @click="selectedGame = 'departments'"
      >
        <h2>Départements Français</h2>
        <p>Testez vos connaissances sur les départements français</p>
      </div>

      <div
        class="game-type"
        :class="{ active: selectedGame === 'flags' }"
        @click="selectedGame = 'flags'"
      >
        <h2>Drapeaux du Monde</h2>
        <p>Devinez les drapeaux des pays du monde</p>
      </div>
    </div>

    <div v-if="selectedGame === 'departments'" class="mode-buttons">
      <h3>Mode de jeu:</h3>
      <button @click="startGame('guessChefLieu')">Chef-lieux</button>
      <button @click="startGame('guessDepartmentName')">
        Nom des départements
      </button>
      <button @click="startGame('guessBoth')">Chef-lieux et noms</button>
    </div>    <div v-else-if="selectedGame === 'flags'" class="mode-buttons">
      <h3>Mode de jeu:</h3>
      <button @click="startGame('guessFlags')">Deviner le pays depuis le drapeau</button>
      <button @click="startReverseFlagMode">Deviner le drapeau depuis le pays</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useGameStore } from "../store/gameStore";
import type { GameMode } from "../types";

const emit = defineEmits(["mode-selected"]);
const gameStore = useGameStore();
const selectedGame = ref<"departments" | "flags">("departments");

const startGame = (mode: GameMode) => {
  gameStore.setReverseFlagMode(false);
  gameStore.setGameMode(mode); // This will also initialize the game via the store action
  emit("mode-selected");
};

const startReverseFlagMode = () => {
  gameStore.setReverseFlagMode(true);
  gameStore.setGameMode("guessFlags");
  emit("mode-selected");
};
</script>

<style scoped lang="scss">
.homepage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  padding: 24px;
  background-color: var(--background-light);
  max-width: 100%;
  overflow-x: hidden;
}

h1 {
  margin-bottom: 30px;
  font-size: 2.2em;
  background: linear-gradient(
    to right,
    var(--primary-color),
    var(--primary-dark)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
}

h2 {
  margin-bottom: 12px;
  font-size: 1.5em;
  color: var(--text-primary);
  font-weight: 600;
}

h3 {
  margin-bottom: 20px;
  font-size: 1.3em;
  color: var(--primary-color);
  font-weight: 500;
}

.game-selector {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 35px;
  gap: 15px;
  flex-wrap: wrap;
}

.game-type {
  width: 250px;
  max-width: 100%;
  padding: 20px;
  border: none;
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  transition: var(--transition-default);
  background-color: var(--background-off);
  box-shadow: var(--card-shadow);
  position: relative;
  overflow: hidden;
  flex: 1;
  min-width: 200px;
}

.game-type:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.game-type.active {
  background-color: #e8f0fe;
  border-left: 4px solid var(--primary-color);
  border-top: 4px solid var(--primary-color);
}

.game-type p {
  color: var(--text-secondary);
  font-size: 0.95em;
  margin-top: 12px;
  line-height: 1.4;
}

.mode-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 10px;
}

.mode-buttons button {
  display: block;
  width: 100%;
  max-width: 320px;
  padding: 15px;
  font-size: 1.1em;
  margin: 8px 0;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: var(--transition-default);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.mode-buttons button:hover {
  background-color: var(--primary-light);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.mode-buttons button:active {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Responsive adjustments for mobile */
@media (max-width: 768px) {
  .homepage {
    padding: 16px;
  }
  
  .game-selector {
    flex-direction: column;
    gap: 20px;
  }

  .game-type {
    width: 100%;
    margin-bottom: 0;
    min-width: unset;
  }

  h1 {
    font-size: 1.8em;
    margin-bottom: 25px;
  }

  .mode-buttons button {
    max-width: 100%;
    font-size: 1em;
  }
}

@media (max-width: 480px) {
  .homepage {
    padding: 12px;
  }
  
  h1 {
    font-size: 1.6em;
    margin-bottom: 20px;
  }
  
  .game-type {
    padding: 16px;
  }
  
  h2 {
    font-size: 1.3em;
  }
}
</style>
