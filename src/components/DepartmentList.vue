<template>
  <div
    class="department-list-container"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
  >
    <ul>
      <li
        v-for="dep in departmentStore.departmentsForList"
        :key="dep.id"
        @click="handleGuess(dep.id)"
        :class="getDepartmentClass(dep)"
      >
        {{ dep.id }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useDepartmentStore } from "../store/departmentStore";
import { ref } from "vue";

const departmentStore = useDepartmentStore();
const startY = ref(0);

const handleGuess = (departmentId: string) => {
  const status = departmentStore.getDepartmentStatus(departmentId);
  // Prevent guessing if already fully correct (green)
  if (status === "correctBoth") return;
  // In "guessBoth" mode, if one part is correct (blue), clicking it again should still be handled by makeGuess
  // to potentially reveal the other part or handle the game flow as designed in the store.
  // So, no specific block here for "correctName" or "correctChefLieu" unless the game logic strictly forbids it.
  departmentStore.makeGuess(departmentId);
};

const handleTouchStart = (e: TouchEvent) => {
  startY.value = e.touches[0].clientY;
};

const handleTouchMove = (e: TouchEvent) => {
  const currentY = e.touches[0].clientY;
  const container = e.currentTarget as HTMLElement;

  // If we're at the top of the scroll and trying to scroll up (pull down)
  if (container.scrollTop === 0 && currentY > startY.value) {
    e.preventDefault(); // Prevent pull-to-refresh
  }
};

const getDepartmentClass = (
  dep: (typeof departmentStore.departmentsForList)[number],
) => {
  // Use the type from store
  return {
    "department-item": true,
    "correct-guess": dep.status === "correctBoth", // Green for fully correct
    "partially-correct-guess":
      dep.status === "correctName" || dep.status === "correctChefLieu", // Blue for partially correct
  };
};
</script>

<style scoped lang="scss">
.department-list-container {
  height: 100%; /* Fill the column */
  overflow-y: auto;
  background-color: var(--primary-dark);
  position: relative;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  /* Prevent pull-to-refresh on mobile */
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
  /* Additional mobile-specific properties */
  touch-action: pan-y;
}

ul {
  list-style-type: none;
  padding: 0;
  padding-bottom: 60px; /* Add bottom padding for mobile scrolling */
  margin: 0;
}

.department-item {
  padding: 12px 5px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  font-weight: 600;
  transition: var(--transition-default);
  color: rgba(255, 255, 255, 0.85);
  position: relative;
  overflow: hidden;
}

.department-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.department-item::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0;
  background-color: rgba(255, 255, 255, 0.1);
  transition: var(--transition-default);
}

.department-item:hover::after {
  height: 4px;
}

.correct-guess {
  background-color: var(--success-color);
  color: white;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}

.correct-guess:hover {
  background-color: var(--success-dark);
  cursor: not-allowed;
}

.partially-correct-guess {
  background-color: var(--secondary-color);
  color: white;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}

.partially-correct-guess:hover {
  background-color: var(--secondary-dark);
}
</style>
