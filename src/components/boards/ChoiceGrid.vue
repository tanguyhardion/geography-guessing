<template>
  <div class="scroller">
    <ul ref="grid" class="grid" :class="variant">
      <li v-for="(choice, index) in visibleChoices" :key="choice.id">
        <button
          type="button"
          class="tile"
          :class="stateOf(choice.id)"
          :data-id="choice.id"
          :disabled="
            game.status[choice.id] === 'done' || game.excluded.has(choice.id)
          "
          :aria-label="ariaLabel(choice, index)"
          @click="game.guessChoice(choice.id)"
        >
          <img
            v-if="variant === 'flags' && choice.flagCode"
            :src="flagUrl(choice.flagCode)"
            alt=""
            decoding="async"
          />
          <template v-else>{{ choice.id }}</template>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// Clickable grid used by two boards: department numbers and flags.
import { computed, nextTick, ref, watch } from "vue";
import { flagUrl, type Choice } from "../../game/modes";
import { useGameStore } from "../../store/game";

const props = defineProps<{ variant: "numbers" | "flags" }>();
const game = useGameStore();

// Flags are limited to the continent of the country being asked. The group is
// remembered so the grid does not change behind the end-of-game card.
const group = ref<string | undefined>(game.current?.group);
watch(
  () => game.current,
  (question) => {
    if (question) group.value = question.group;
  },
);

const visibleChoices = computed(() =>
  group.value
    ? game.choices.filter((choice) => choice.group === group.value)
    : game.choices,
);

const grid = ref<HTMLElement | null>(null);

function stateOf(id: string) {
  const flash = game.flash?.id === id ? game.flash.kind : undefined;
  return [
    game.status[id],
    flash,
    {
      excluded: game.excluded.has(id),
      revealed: game.revealed && game.current?.targetId === id,
    },
  ];
}

// Bring the shown answer into view: the grid can be long on a phone.
watch(
  () => game.revealed,
  async (revealed) => {
    const id = game.current?.targetId;
    if (!revealed || !id) return;
    await nextTick();
    grid.value
      ?.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  },
);

function ariaLabel(choice: Choice, index: number) {
  const found = game.status[choice.id] === "done" ? " (déjà trouvé)" : "";
  // Naming the flag would give the answer away to screen-reader users.
  return props.variant === "flags"
    ? `Drapeau ${index + 1}${found}`
    : `Département ${choice.id}${found}`;
}
</script>

<style scoped lang="scss">
.scroller {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 16px;
}

.grid {
  display: grid;
  gap: 8px;
  max-width: 1100px;
  margin: 0 auto;
  list-style: none;

  &.numbers {
    grid-template-columns: repeat(auto-fill, minmax(58px, 1fr));
  }

  &.flags {
    grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
    gap: 12px;
  }
}

.tile {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--line);
  background: var(--surface);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  transition:
    border-color 0.12s ease,
    background-color 0.12s ease,
    transform 0.1s ease;

  &:hover:not(:disabled) {
    border-color: var(--accent);
    background: var(--accent-soft);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &.partial {
    border-color: var(--warn);
    background: var(--warn-soft);
    color: var(--warn);
  }

  &.done {
    border-color: var(--ok);
    background: var(--ok-soft);
    color: var(--ok);
  }

  &.wrong {
    border-color: var(--bad);
    background: var(--bad-soft);
    color: var(--bad);
    animation: nudge 0.3s ease;
  }

  &.reveal {
    border-color: var(--warn);
    background: var(--warn-soft);
    box-shadow: 0 0 0 3px var(--warn-soft);
  }

  &.excluded {
    opacity: 0.18;
    filter: grayscale(1);
    cursor: default;
  }

  &.revealed {
    z-index: 1;
    border-color: var(--warn);
    background: var(--warn-soft);
    color: var(--warn);
    animation: beacon 1.2s ease-in-out infinite;
  }
}

@keyframes beacon {
  50% {
    box-shadow: 0 0 0 6px var(--warn-soft);
    transform: scale(1.06);
  }
}

.numbers .tile {
  aspect-ratio: 1;
  font-size: 1.05rem;
}

.flags .tile {
  aspect-ratio: 3 / 2;
  padding: 8px;

  img {
    max-width: 100%;
    max-height: 100%;
    border-radius: 3px;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.12);
  }

  &.done img {
    opacity: 0.35;
  }

  &.done::after {
    content: "✓";
    position: absolute;
    font-size: 1.6rem;
  }
}

@keyframes nudge {
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

@media (max-width: 640px) {
  .scroller {
    padding: 12px;
  }

  .grid.numbers {
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    gap: 6px;
  }

  .grid.flags {
    grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
    gap: 8px;
  }
}
</style>
