<template>
  <header class="hud">
    <RouterLink
      :to="{ name: 'Home' }"
      class="back"
      aria-label="Retour à l'accueil"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M15 5l-7 7 7 7"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span class="back-label">Accueil</span>
    </RouterLink>

    <div class="title">
      <h1>{{ title }}</h1>
      <span v-if="continent !== 'all'" class="tag">{{ continent }}</span>
    </div>

    <dl class="meters">
      <div class="meter">
        <dt>Temps</dt>
        <dd class="tabular" role="timer">{{ game.clock }}</dd>
      </div>
      <div class="meter">
        <dt>Précision</dt>
        <dd class="tabular">{{ game.accuracy }} %</dd>
      </div>
      <div class="meter">
        <dt>Trouvés</dt>
        <dd class="tabular">{{ game.answered }} / {{ game.total }}</dd>
      </div>
    </dl>

    <div
      class="progress"
      role="progressbar"
      aria-label="Progression"
      :aria-valuenow="game.answered"
      aria-valuemin="0"
      :aria-valuemax="game.total"
    >
      <div class="progress-fill" :style="{ width: `${percent}%` }"></div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "../store/game";
import type { ContinentFilter } from "../types";

defineProps<{ title: string; continent: ContinentFilter }>();

const game = useGameStore();
const percent = computed(() =>
  game.total === 0 ? 0 : (game.answered / game.total) * 100,
);
</script>

<style scoped lang="scss">
.hud {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px 16px;
  padding: 10px 16px 13px;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 36px;
  padding: 0 12px 0 6px;
  border-radius: 999px;
  color: var(--ink-2);
  font-weight: 600;
  text-decoration: none;

  &:hover {
    background: var(--surface-2);
    color: var(--ink);
  }
}

.title {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;

  h1 {
    font-size: 1.15rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.tag {
  flex-shrink: 0;
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 600;
}

.meters {
  display: flex;
  gap: 22px;
}

.meter {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.2;

  dt {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-2);
  }

  dd {
    font-weight: 700;
    font-size: 1rem;
  }
}

.progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 3px;
  background: var(--line);
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.4s ease;
}

@media (max-width: 640px) {
  .hud {
    flex-wrap: wrap;
    padding: 8px 12px 12px;
  }

  .back-label {
    display: none;
  }

  .back {
    padding: 0 8px;
    margin-left: -6px;
  }

  .title h1 {
    font-size: 1.05rem;
  }

  .meters {
    width: 100%;
    justify-content: space-between;
    gap: 12px;
  }

  .meter {
    flex-direction: row;
    align-items: baseline;
    gap: 6px;

    dd {
      font-size: 0.95rem;
    }
  }
}
</style>
