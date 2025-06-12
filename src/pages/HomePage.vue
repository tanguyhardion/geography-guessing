<template>
  <div class="homepage">
    <h1>Quiz Géographique</h1>

    <div class="game-selector">
      <div
        class="game-type"
        :class="{ active: selectedGame === 'map' }"
        @click="selectedGame = 'map'"
        :key="
          selectedGame === 'map'
            ? 'map-active-' + animationKeySuffix
            : 'map-inactive'
        "
      >
        <div class="nouveau-indicator"></div>
        <h2>Géographie Interactive</h2>
        <p>Cartes interactives pour apprendre la géographie</p>
      </div>

      <div
        class="game-type"
        :class="{ active: selectedGame === 'departments' }"
        @click="selectedGame = 'departments'"
        :key="
          selectedGame === 'departments'
            ? 'departments-active-' + animationKeySuffix
            : 'departments-inactive'
        "
      >
        <h2>Départements Français</h2>
        <p>Teste tes connaissances sur les départements français</p>
      </div>

      <div
        class="game-type"
        :class="{ active: selectedGame === 'flags' }"
        @click="selectedGame = 'flags'"
        :key="
          selectedGame === 'flags'
            ? 'flags-active-' + animationKeySuffix
            : 'flags-inactive'
        "
      >
        <h2>Pays du Monde</h2>
        <p>Devine les drapeaux et capitales des pays du monde</p>
      </div>
    </div>
    <div v-if="selectedGame === 'departments'" class="mode-buttons">
      <h3>Mode de jeu:</h3>
      <button @click="startGame('guessChefLieu')">
        Numéro à partir du chef-lieu
      </button>
      <button @click="startGame('guessDepartmentName')">
        Numéro à partir du nom
      </button>
      <button @click="startGame('guessBoth')">
        Numéro à partir du nom ou du chef-lieu
      </button>
    </div>
    <div v-else-if="selectedGame === 'map'" class="mode-buttons">
      <h3>Mode de jeu:</h3>
      <button @click="startGame('guessMapLocation')">
        Départements français
      </button>
      <button @click="startGame('guessFrenchChefLieux')">
        Chef-lieux français
      </button>
      <button @click="startGame('guessCountryMapLocation')">
        Pays du monde
      </button>
      <button @click="startGame('guessRussianCities')">Villes de Russie</button>
      <button
        @click="startGame('guessRussianOblasts')"
        class="button-with-ribbon"
      >
        Oblasts de Russie
        <div class="nouveau-ribbon">Nouveau</div>
      </button>
    </div>
    <div
      v-else-if="selectedGame === 'flags' && !showContinentSelection"
      class="mode-buttons"
    >
      <h3>Mode de jeu:</h3>
      <button @click="selectFlagMode('normal')">Pays depuis le drapeau</button>
      <button @click="selectFlagMode('reverse')">Drapeau depuis le pays</button>
      <button @click="selectFlagMode('capitals')">
        Pays depuis la capitale
      </button>
      <button @click="selectFlagMode('reverseCapitals')">
        Capitale depuis le pays
      </button>
    </div>
    <div
      v-else-if="selectedGame === 'flags' && showContinentSelection"
      class="continent-selection"
    >
      <h3>Continent :</h3>
      <div class="continent-buttons">
        <button
          @click="selectContinent('all')"
          class="continent-button all-continents button-with-ribbon"
        >
          Tous les continents
        </button>
        <button
          v-for="continent in availableContinents"
          :key="continent"
          @click="selectContinent(continent as Continent)"
          class="continent-button button-with-ribbon"
        >
          {{ continent }}
        </button>
      </div>
      <button @click="goBack" class="back-button button-with-ribbon">
        Retour
      </button>
    </div>

    <!-- Footer with credits -->
    <footer class="page-footer">
      <p class="made-by">
        Made with ❤️ by
        <a
          href="https://linkedin.com/in/tanguy-hardion"
          target="_blank"
          rel="noopener noreferrer"
          class="creator-link"
        >
          Tanguy Hardion
        </a>
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useAppGameStore } from "../store/gameStoreAdapter";
import type { GameMode, Continent } from "../types";

const emit = defineEmits(["mode-selected"]);
const appGameStore = useAppGameStore();
const selectedGame = ref<"departments" | "flags" | "map">(
  appGameStore.selectedGameType,
);
const animationKeySuffix = ref(0);
const selectedFlagMode = ref<
  "normal" | "reverse" | "capitals" | "reverseCapitals" | null
>(null);
const showContinentSelection = ref(false);

const availableContinents = computed(() => appGameStore.availableContinents);

// Watch for changes in selectedGame and save to store
watch(selectedGame, (newGameType, oldGameType) => {
  appGameStore.setSelectedGameType(newGameType);
  if (newGameType !== oldGameType) {
    animationKeySuffix.value++; // Increment key suffix to force re-render
  }
});

const selectFlagMode = (
  mode: "normal" | "reverse" | "capitals" | "reverseCapitals",
) => {
  selectedFlagMode.value = mode;
  showContinentSelection.value = true;
};

const selectContinent = (continent: Continent | "all") => {
  appGameStore.setSelectedContinent(continent);

  if (selectedFlagMode.value === "normal") {
    startGame("guessFlags");
  } else if (selectedFlagMode.value === "reverse") {
    startReverseFlagMode();
  } else if (selectedFlagMode.value === "capitals") {
    startCapitalsMode();
  } else if (selectedFlagMode.value === "reverseCapitals") {
    startReverseCapitalsMode();
  }
};

const goBack = () => {
  showContinentSelection.value = false;
  selectedFlagMode.value = null;
};

const startGame = (mode: GameMode) => {
  appGameStore.setReverseFlagMode(false);
  appGameStore.setGameMode(mode); // This will also initialize the game via the store action
  emit("mode-selected");
};

const startReverseFlagMode = () => {
  appGameStore.setReverseFlagMode(true);
  appGameStore.setGameMode("guessFlags");
  emit("mode-selected");
};

const startCapitalsMode = () => {
  appGameStore.setReverseFlagMode(false);
  appGameStore.setGameMode("guessWorldCapitals");
  emit("mode-selected");
};

const startReverseCapitalsMode = () => {
  appGameStore.setReverseFlagMode(false);
  appGameStore.setGameMode("guessCountryFromCapital");
  emit("mode-selected");
};
</script>

<style scoped lang="scss">
.homepage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 24px;
  background-color: var(--background-light);
  width: 100%;
  flex: 1;
  overflow-x: hidden;
}

h1 {
  margin-bottom: 30px;
  font-size: 2.2em;
  background: linear-gradient(
    -45deg,
    #3b82f6,
    #6366f1,
    #8b5cf6,
    #a855f7,
    #c084fc,
    #60a5fa,
    #3b82f6,
    #6366f1
  );
  background-size: 400% 400%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  animation: gradientMove 4s ease-in-out infinite;
}

@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
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
  width: 220px;
  max-width: 100%;
  padding: 20px;
  border: 3px solid transparent;
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

.nouveau-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #ff8c00, #ffd700);
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 2;
  animation: pulse-new 2s infinite;
}

@keyframes pulse-new {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.4);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.game-type:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.game-type.active {
  background-color: #e8f0fe;
  border: 3px solid var(--primary-color);
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

.continent-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 10px;
}

.continent-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: 30px;
  width: 100%;
}

.continent-button {
  padding: 12px 20px;
  font-size: 1em;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: var(--transition-default);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  min-width: 140px;
  flex: 1;
  text-align: center;
}

.continent-button:hover {
  background-color: var(--secondary-dark);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.continent-button.all-continents {
  background-color: var(--primary-color);
  font-weight: 600;
}

.continent-button.all-continents:hover {
  background-color: var(--primary-light);
}

.back-button {
  padding: 10px 20px;
  font-size: 0.95em;
  background-color: var(--border-color);
  color: var(--text-primary);
  border: none;
  border-radius: 24px;
  cursor: pointer;
  transition: var(--transition-default);
}

.page-footer {
  margin-top: auto;
  padding: 20px 24px 16px;
  width: 100%;
  text-align: center;
  background-color: var(--background-light);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.made-by {
  font-size: 0.85em;
  color: var(--text-secondary);
  margin: 0;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.made-by:hover {
  opacity: 1;
}

.creator-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition-default);
}

.creator-link:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

/* Responsive adjustments for mobile */
@media (max-width: 768px) {
  .homepage {
    padding: 16px;
  }

  .page-footer {
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
    width: 100%;
    font-size: 1em;
  }

  .continent-buttons {
    gap: 8px;
  }
  .continent-button {
    min-width: 120px;
    padding: 10px 16px;
    font-size: 0.9em;
    flex: 1 1 calc(50% - 6px);
  }
}

@media (max-width: 480px) {
  .homepage {
    padding: 12px;
  }

  .page-footer {
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
  .continent-button {
    min-width: 100px;
    padding: 8px 12px;
    font-size: 0.85em;
    flex: 1 1 calc(50% - 4px);
  }
}

/* Nouveau ribbon styles */
.button-with-ribbon {
  position: relative;
  overflow: hidden;
}

.nouveau-ribbon {
  position: absolute;
  top: 12px;
  right: -25px;
  background: linear-gradient(135deg, #ff8c00, #ffd700);
  color: white;
  padding: 4px 30px;
  font-size: 0.7em;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transform: rotate(45deg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.nouveau-ribbon::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4) 45%,
    rgba(255, 255, 255, 0.8) 50%,
    rgba(255, 255, 255, 0.4) 55%,
    transparent
  );
  animation: shimmer 3s infinite;
  z-index: 2;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  50% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Shadow triangles for 3D effect - moved to after pseudo-element styling */
.button-with-ribbon::before {
  content: "";
  position: absolute;
  top: 12px;
  right: -25px;
  width: calc(100% + 50px);
  height: 24px;
  transform: rotate(45deg);
  pointer-events: none;
  z-index: 0;
}

.button-with-ribbon::after {
  content: "";
  position: absolute;
  top: 12px;
  right: -25px;
  width: calc(100% + 50px);
  height: 24px;
  transform: rotate(45deg);
  pointer-events: none;
  z-index: 0;
}

/* Ensure ribbon visibility on hover */
.button-with-ribbon:hover .nouveau-ribbon {
  background: linear-gradient(135deg, #ff9500, #ffdb00);
}
</style>
