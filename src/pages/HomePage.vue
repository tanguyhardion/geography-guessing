<template>
  <div class="homepage">
    <div class="stats-icon" @click="goToStats" title="Voir les statistiques">
      <!-- Simple bar chart SVG icon -->
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--primary-color)"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="12" width="4" height="8" />
        <rect x="9" y="8" width="4" height="12" />
        <rect x="15" y="4" width="4" height="16" />
      </svg>
    </div>
    <h1>Quiz Géographique</h1>
    <span class="mobile-title-spacer"></span>
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
      <button v-click-animate @click="startGame('guessChefLieu')">
        Numéro à partir du chef-lieu
      </button>
      <button v-click-animate @click="startGame('guessDepartmentName')">
        Numéro à partir du nom
      </button>
      <button v-click-animate @click="startGame('guessBoth')">
        Numéro à partir du nom ou du chef-lieu
      </button>
    </div>
    <div
      v-else-if="selectedGame === 'map' && !showCountryMapContinentSelection"
      class="mode-buttons"
    >
      <h3>Mode de jeu:</h3>
      <button v-click-animate @click="startGame('guessMapLocation')">
        Départements français
      </button>
      <button v-click-animate @click="startGame('guessFrenchChefLieux')">
        Chef-lieux français
      </button>
      <button v-click-animate @click="selectCountryMapMode()">
        Pays du monde
      </button>
      <button v-click-animate @click="startGame('guessRussianCities')">
        Villes de Russie
      </button>
      <button v-click-animate @click="startGame('guessRussianOblasts')">
        Oblasts de Russie
      </button>
    </div>
    <div
      v-else-if="selectedGame === 'map' && showCountryMapContinentSelection"
      class="continent-selection"
    >
      <h3>Continent :</h3>
      <div class="continent-buttons">
        <button
          v-click-animate
          @click="selectCountryMapContinent('all')"
          class="continent-button all-continents"
        >
          Tous les continents
        </button>
        <button
          v-click-animate
          v-for="continent in availableContinents"
          :key="continent"
          @click="selectCountryMapContinent(continent as Continent)"
          class="continent-button"
        >
          {{ continent }}
        </button>
      </div>
      <button v-click-animate @click="goBackFromCountryMap" class="back-button">
        Retour
      </button>
    </div>
    <div
      v-else-if="selectedGame === 'flags' && !showContinentSelection"
      class="mode-buttons"
    >
      <h3>Mode de jeu:</h3>
      <button v-click-animate @click="selectFlagMode('normal')">
        Pays depuis le drapeau
      </button>
      <button v-click-animate @click="selectFlagMode('reverse')">
        Drapeau depuis le pays
      </button>
      <button v-click-animate @click="selectFlagMode('capitals')">
        Pays depuis la capitale
      </button>
      <button v-click-animate @click="selectFlagMode('reverseCapitals')">
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
          v-click-animate
          @click="selectContinent('all')"
          class="continent-button all-continents"
        >
          Tous les continents
        </button>
        <button
          v-click-animate
          v-for="continent in availableContinents"
          :key="continent"
          @click="selectContinent(continent as Continent)"
          class="continent-button"
        >
          {{ continent }}
        </button>
      </div>
      <button v-click-animate @click="goBack" class="back-button">
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
import { useRouter } from "vue-router";
import type { GameMode, Continent } from "../types";

const emit = defineEmits(["mode-selected"]);
const appGameStore = useAppGameStore();
const router = useRouter();
const selectedGame = ref<"departments" | "flags" | "map">(
  appGameStore.selectedGameType,
);
const animationKeySuffix = ref(0);
const selectedFlagMode = ref<
  "normal" | "reverse" | "capitals" | "reverseCapitals" | null
>(null);
const showContinentSelection = ref(false);
const showCountryMapContinentSelection = ref(false);

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
  appGameStore.setGameMode(mode);
  router.push({ name: "Game" });
};

const startReverseFlagMode = () => {
  appGameStore.setReverseFlagMode(true);
  appGameStore.setGameMode("guessFlags");
  router.push({ name: "Game" });
};

const startCapitalsMode = () => {
  appGameStore.setReverseFlagMode(false);
  appGameStore.setGameMode("guessWorldCapitals");
  router.push({ name: "Game" });
};

const startReverseCapitalsMode = () => {
  appGameStore.setReverseFlagMode(false);
  appGameStore.setGameMode("guessCountryFromCapital");
  router.push({ name: "Game" });
};

const selectCountryMapMode = () => {
  showCountryMapContinentSelection.value = true;
};

const selectCountryMapContinent = (continent: Continent | "all") => {
  appGameStore.setSelectedContinent(continent);
  startGame("guessCountryMapLocation");
};

const goBackFromCountryMap = () => {
  showCountryMapContinentSelection.value = false;
};

function goToStats() {
  window.dispatchEvent(new CustomEvent("navigate-stats"));
}
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

.stats-icon {
  position: absolute;
  top: 24px;
  right: 24px;
  background: var(--background-off);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  padding: 8px;
  cursor: pointer;
  transition:
    box-shadow 0.2s,
    background 0.2s;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-icon:hover {
  background: var(--primary-light);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
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

@media (max-width: 600px) {
  h1 {
    font-size: 1.6em;
    margin: 12px 0;
  }
  .game-selector {
    margin-bottom: 28px;
  }
  .mobile-title-spacer {
    height: 18vw;
    max-height: 38px;
    min-height: 18px;
    width: 100%;
    display: block;
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
</style>
