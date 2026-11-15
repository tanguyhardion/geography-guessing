<template>
  <section class="prompt" :class="{ stacked }" aria-live="polite">
    <div class="question">
      <p class="instruction">{{ question.instruction }}</p>
      <div v-if="question.flagCode" class="flag-frame">
        <img
          :key="question.key"
          :src="flagUrl(question.flagCode)"
          alt="Drapeau à identifier"
          class="flag"
        />
      </div>
      <h2 v-else :key="question.key" class="target" :lang="targetLang">
        {{ game.promptText }}
      </h2>

      <p v-if="showAnswer" class="help reveal" role="status">
        <span class="help-label">Réponse</span>
        <strong v-if="answerName">{{ answerName }}</strong>
        <span class="help-note">{{ revealNote }}</span>
      </p>
      <p v-else-if="game.hint" class="help hint" role="status">
        <span class="help-label">Indice</span>
        <span>{{ game.hint.text }}</span>
        <span v-if="game.hint.pattern" class="pattern" aria-hidden="true">{{
          game.hint.pattern
        }}</span>
      </p>
    </div>

    <div v-if="!stacked" class="actions">
      <div
        v-if="altLang"
        class="lang"
        role="group"
        aria-label="Langue des noms"
      >
        <button
          type="button"
          :aria-pressed="!game.useAlt"
          @click="game.setAltLanguage(false)"
        >
          {{ altLang.base }}
        </button>
        <button
          type="button"
          :aria-pressed="game.useAlt"
          @click="game.setAltLanguage(true)"
        >
          {{ altLang.alt }}
        </button>
      </div>
      <button
        v-if="game.hintAvailable"
        type="button"
        class="btn hint-btn"
        @click="game.useHint()"
      >
        <span aria-hidden="true">💡</span> Indice
      </button>
      <button
        type="button"
        class="btn skip"
        :class="{ 'btn-primary': game.revealed }"
        :disabled="game.locked"
        @click="game.skip()"
      >
        {{ game.revealed ? "Continuer" : "Passer" }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { flagUrl, type Question } from "../game/modes";
import { useGameStore } from "../store/game";

defineProps<{
  question: Question;
  /** Centered, roomy layout for text boards, which bring their own actions. */
  stacked?: boolean;
}>();

const game = useGameStore();
const altLang = computed(() => game.mode?.altLang);
const showAnswer = computed(() => game.revealed);
// On maps and the flag grid the answer is the prompt itself: the board
// highlights it instead of naming it again.
const answerName = computed(() =>
  game.mode?.board === "text" || game.mode?.board === "numbers"
    ? game.answerLabel
    : "",
);
const revealNote = computed(() => {
  switch (game.mode?.board) {
    case "text":
      return "Tape-la ou passe pour continuer.";
    case "map":
      return "Elle est surlignée sur la carte : clique dessus pour continuer.";
    case "flags":
      return "Le bon drapeau est surligné : clique dessus pour continuer.";
    default:
      return "Clique dessus pour continuer.";
  }
});
const targetLang = computed(() => {
  if (!altLang.value) return undefined;
  if (game.useAlt) return "ru";
  return altLang.value.base === "English" ? "en" : undefined;
});
</script>

<style scoped lang="scss">
.prompt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px 20px;
  padding: 12px 16px;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}

.question {
  min-width: 0;
  text-align: left;
}

.instruction {
  color: var(--ink-2);
  font-size: 0.88rem;
  font-weight: 500;
}

.target {
  font-size: clamp(1.35rem, 1rem + 1.6vw, 1.9rem);
  overflow-wrap: anywhere;
  animation: rise 0.25s ease;
}

.help {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 8px;
  margin-top: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  background: var(--warn-soft);
  color: var(--warn);
  font-size: 0.92rem;
  font-weight: 600;
  animation: rise 0.25s ease;

  strong {
    font-weight: 800;
  }
}

.help-label {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.help-note {
  color: var(--ink-2);
  font-weight: 500;
}

.pattern {
  flex-basis: 100%;
  font-family: ui-monospace, "SFMono-Regular", Consolas, monospace;
  font-size: 1.15rem;
  letter-spacing: 0.22em;
  color: var(--ink);
}

.hint-btn {
  border-color: var(--warn);
  color: var(--warn);
  background: var(--warn-soft);
  animation: rise 0.25s ease;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.lang {
  display: flex;
  padding: 3px;
  border-radius: 999px;
  background: var(--surface-2);

  button {
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    color: var(--ink-2);
    font-size: 0.88rem;
    font-weight: 600;

    &[aria-pressed="true"] {
      background: var(--surface);
      color: var(--ink);
      box-shadow: var(--shadow-1);
    }
  }
}

.stacked {
  flex-direction: column;
  justify-content: center;
  gap: 18px;
  padding: 0;
  border: none;
  background: none;

  .question {
    text-align: center;
  }

  .instruction {
    font-size: 1rem;
    margin-bottom: 10px;
  }

  .target {
    font-size: clamp(1.9rem, 1.2rem + 3.4vw, 3rem);
  }

  .help {
    justify-content: center;
    margin-top: 16px;
    text-align: center;
  }
}

.flag-frame {
  display: flex;
  align-items: center;
  justify-content: center;
  height: clamp(130px, 28vh, 200px);
}

.flag {
  max-width: min(320px, 80vw);
  max-height: 100%;
  border-radius: 6px;
  border: 1px solid var(--line);
  box-shadow: var(--shadow-2);
  animation: rise 0.25s ease;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

@media (max-width: 640px) {
  .prompt:not(.stacked) {
    padding: 10px 12px;

    .actions {
      flex-direction: column-reverse;
      align-items: flex-end;
      gap: 6px;
    }

    .skip,
    .hint-btn {
      min-height: 38px;
    }

    .lang button {
      min-height: 30px;
      padding: 0 10px;
      font-size: 0.8rem;
    }
  }
}
</style>
