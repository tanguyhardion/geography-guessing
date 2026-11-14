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
        type="button"
        class="btn skip"
        :disabled="game.locked"
        @click="game.skip()"
      >
        Passer
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

    .skip {
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
