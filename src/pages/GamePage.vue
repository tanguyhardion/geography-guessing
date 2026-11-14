<template>
  <div class="game">
    <GameHud :title="mode.title" :continent="continent" />

    <main class="stage" :class="`board-${mode.board}`">
      <div v-if="phase === 'loading'" class="notice" role="status">
        <span class="spinner" aria-hidden="true"></span>
        Chargement de la carte…
      </div>

      <div v-else-if="phase === 'error'" class="notice" role="alert">
        <p>La carte n'a pas pu être chargée. Vérifie ta connexion.</p>
        <button type="button" class="btn btn-primary" @click="boot">
          Réessayer
        </button>
      </div>

      <template v-else>
        <PromptPanel
          v-if="game.current && mode.board !== 'text'"
          :question="game.current"
        />
        <!-- Feedback floats over the board, never over the question. -->
        <div class="board-area">
          <div v-if="mode.board === 'text'" class="text-layout">
            <PromptPanel v-if="game.current" :question="game.current" stacked />
            <TextBoard v-if="game.current" />
          </div>
          <MapBoard v-else-if="mode.board === 'map'" :geo="geo" />
          <ChoiceGrid v-else :variant="mode.board" />
          <FeedbackToast />
        </div>
        <CompletionCard v-if="game.complete" />
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, shallowRef, watch } from "vue";
import { useRoute } from "vue-router";
import type { FeatureCollection } from "geojson";
import { getMode, parseContinent, type ModeDef } from "../game/modes";
import { loadGeoJson } from "../game/geo";
import { useGameStore } from "../store/game";
import GameHud from "../components/GameHud.vue";
import PromptPanel from "../components/PromptPanel.vue";
import FeedbackToast from "../components/FeedbackToast.vue";
import CompletionCard from "../components/CompletionCard.vue";
import MapBoard from "../components/boards/MapBoard.vue";
import TextBoard from "../components/boards/TextBoard.vue";
import ChoiceGrid from "../components/boards/ChoiceGrid.vue";

const route = useRoute();
const game = useGameStore();

// The router guard guarantees the mode exists before this page is entered.
const mode = computed(() => getMode(route.params.modeId) as ModeDef);
const continent = computed(() =>
  mode.value.continents ? parseContinent(route.query.continent) : "all",
);

const phase = ref<"loading" | "error" | "ready">("loading");
const geo = shallowRef<FeatureCollection | null>(null);
let bootId = 0;

async function boot() {
  const id = ++bootId;
  const target = mode.value;
  const mapConfig = target.map;
  geo.value = null;
  game.stop();

  let availableIds: Set<string> | undefined;
  const geoUrl = mapConfig?.geoUrl ?? mapConfig?.backdropUrl;
  if (mapConfig && geoUrl) {
    phase.value = "loading";
    try {
      const data = await loadGeoJson(geoUrl);
      if (id !== bootId) return; // navigated elsewhere meanwhile
      if (mapConfig.geoUrl) {
        const key = mapConfig.featureKey ?? "id";
        // Only ask for regions that are really drawn on the map.
        availableIds = new Set(
          data.features.map((f) => String(f.properties?.[key] ?? "")),
        );
      }
      geo.value = data;
    } catch (error) {
      if (id !== bootId) return;
      console.warn("Map data failed to load:", error);
      phase.value = "error";
      return;
    }
  }

  game.start(target, continent.value, availableIds);
  phase.value = "ready";
}

watch([mode, continent], boot, { immediate: true });

onUnmounted(() => {
  bootId++;
  game.stop();
});
</script>

<style scoped lang="scss">
.game {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
}

.stage {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.board-area {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.text-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: min(520px, 100%);
  margin: 0 auto;
  // Sits in the upper part of the screen so the on-screen keyboard
  // does not cover the input on phones.
  padding: clamp(64px, 14vh, 140px) 16px 24px;
}

.notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex: 1;
  padding: 24px;
  color: var(--ink-2);
  text-align: center;
}

.spinner {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid var(--line);
  border-top-color: var(--accent);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
