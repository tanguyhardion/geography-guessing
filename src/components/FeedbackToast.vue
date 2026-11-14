<template>
  <div class="toast-zone" role="status" aria-live="polite">
    <Transition name="toast">
      <p v-if="visible" :key="visible.seq" class="toast" :class="visible.kind">
        {{ visible.text }}
        <strong v-if="visible.strong">{{ visible.strong }}</strong>
      </p>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";
import { useGameStore, type Feedback } from "../store/game";

const DISPLAY_TIME = 2600;

const game = useGameStore();
const visible = ref<Feedback | null>(null);
let hideTimer: number | undefined;

watch(
  () => game.feedback,
  (feedback) => {
    window.clearTimeout(hideTimer);
    visible.value = feedback;
    if (feedback) {
      hideTimer = window.setTimeout(() => {
        visible.value = null;
      }, DISPLAY_TIME);
    }
  },
);

onUnmounted(() => window.clearTimeout(hideTimer));
</script>

<style scoped lang="scss">
.toast-zone {
  position: absolute;
  z-index: 1100;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.toast {
  max-width: 100%;
  padding: 9px 18px;
  border-radius: 999px;
  border: 1px solid currentColor;
  background: var(--surface);
  box-shadow: var(--shadow-2);
  font-weight: 600;
  text-align: center;

  strong {
    font-weight: 800;
  }

  &.success {
    background: var(--ok-soft);
    color: var(--ok);
  }

  &.error {
    background: var(--bad-soft);
    color: var(--bad);
  }

  &.hint,
  &.skip {
    background: var(--warn-soft);
    color: var(--warn);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.toast-leave-active {
  position: absolute;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
