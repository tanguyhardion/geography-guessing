<template>
  <div class="text-board">
    <form class="answer" :class="{ shake }" @submit.prevent="submit">
      <input
        ref="input"
        v-model="guess"
        type="text"
        class="field"
        :placeholder="placeholder"
        aria-label="Ta réponse"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        enterkeyhint="send"
        @animationend="shake = false"
      />
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="!guess.trim() || game.locked"
      >
        Valider
      </button>
    </form>
    <div class="extras">
      <button
        v-if="game.hintAvailable"
        type="button"
        class="btn hint-btn"
        @click="useHint"
      >
        <span aria-hidden="true">💡</span> Indice
      </button>
      <button
        type="button"
        class="btn"
        :class="game.revealed ? 'btn-primary' : 'btn-quiet'"
        :disabled="game.locked"
        @click="game.skip()"
      >
        {{ game.revealed ? "Continuer" : "Passer cette question" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useGameStore } from "../../store/game";

const PLACEHOLDERS: Record<string, string> = {
  "Le pays": "Nom du pays",
  "La capitale": "Nom de la capitale",
};

const game = useGameStore();
const input = ref<HTMLInputElement | null>(null);
const guess = ref("");
const shake = ref(false);

const placeholder = computed(
  () => PLACEHOLDERS[game.current?.answerNoun ?? ""] ?? "Ta réponse",
);

function submit() {
  if (!guess.value.trim() || game.locked) return;
  if (game.guessText(guess.value)) {
    guess.value = "";
  } else {
    // Keep the text so a typo can be fixed, but make retyping one keystroke.
    shake.value = true;
    input.value?.select();
  }
}

function useHint() {
  game.useHint();
  input.value?.focus();
}

// New question (answered, skipped or restarted): start from an empty field.
watch(
  () => game.current?.key,
  async () => {
    guess.value = "";
    await nextTick();
    input.value?.focus();
  },
);

onMounted(() => input.value?.focus());
</script>

<style scoped lang="scss">
.text-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.answer {
  display: flex;
  gap: 8px;
  width: 100%;
}

.field {
  flex: 1;
  min-width: 0;
  min-height: 48px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1.5px solid var(--line);
  background: var(--surface);
  font-size: 1.05rem;

  &::placeholder {
    color: var(--ink-2);
    opacity: 0.8;
  }

  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
}

.extras {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.hint-btn {
  border-color: var(--warn);
  color: var(--warn);
  background: var(--warn-soft);
}

.answer .btn {
  min-height: 48px;
}

.shake {
  animation: shake 0.3s ease;

  .field {
    border-color: var(--bad);
  }
}

@keyframes shake {
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}
</style>
