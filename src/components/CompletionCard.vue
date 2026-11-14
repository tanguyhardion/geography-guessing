<template>
  <div class="backdrop">
    <section
      ref="card"
      class="card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-title"
      tabindex="-1"
    >
      <p class="eyebrow">Partie terminée</p>
      <h2 id="completion-title">Félicitations !</h2>
      <p class="message">{{ game.mode?.completion }}</p>

      <dl class="results">
        <div>
          <dt>Temps</dt>
          <dd class="tabular">{{ game.clock }}</dd>
        </div>
        <div>
          <dt>Précision</dt>
          <dd class="tabular">{{ game.accuracy }} %</dd>
        </div>
        <div>
          <dt>Erreurs</dt>
          <dd class="tabular">{{ game.mistakes }}</dd>
        </div>
      </dl>

      <div class="buttons">
        <button type="button" class="btn btn-primary" @click="game.restart()">
          Rejouer
        </button>
        <RouterLink :to="{ name: 'Home' }" class="btn">Accueil</RouterLink>
        <RouterLink :to="{ name: 'Stats' }" class="btn btn-quiet">
          Statistiques
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useGameStore } from "../store/game";

const game = useGameStore();
const card = ref<HTMLElement | null>(null);

onMounted(() => card.value?.focus());
</script>

<style scoped lang="scss">
.backdrop {
  position: absolute;
  inset: 0;
  z-index: 1200;
  display: grid;
  place-items: center;
  padding: 16px;
  background: color-mix(in srgb, var(--bg) 70%, transparent);
  backdrop-filter: blur(3px);
  animation: fade 0.25s ease;
}

.card {
  width: min(440px, 100%);
  padding: 28px 24px 24px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: var(--shadow-2);
  text-align: center;
  animation: pop 0.3s ease;

  &:focus {
    outline: none;
  }
}

.eyebrow {
  color: var(--ok);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h2 {
  margin-top: 4px;
  font-size: 2rem;
}

.message {
  margin-top: 6px;
  color: var(--ink-2);
}

.results {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 22px 0;

  div {
    padding: 12px 6px;
    border-radius: var(--radius-sm);
    background: var(--surface-2);
  }

  dt {
    color: var(--ink-2);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  dd {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 600;
  }
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

@keyframes fade {
  from {
    opacity: 0;
  }
}

@keyframes pop {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.97);
  }
}
</style>
