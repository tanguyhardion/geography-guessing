<template>
  <div class="stats-page">
    <h1>Mes Statistiques</h1>

    <div v-if="loading" class="empty-stats">Chargement...</div>
    <div v-else-if="error" class="empty-stats">{{ error }}</div>
    <div v-else-if="stats.length === 0" class="empty-stats">
      Aucune partie terminée pour l'instant.
    </div>

    <div v-else class="stats-content">
      <!-- Tab Navigation -->
      <div class="tab-nav">
        <button
          :class="['tab-button', { active: activeTab === 'list' }]"
          @click="activeTab = 'list'"
        >
          Liste
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'graph' }]"
          @click="activeTab = 'graph'"
        >
          Graphique
        </button>
      </div>

      <!-- Sorting Controls -->
      <div v-if="activeTab === 'list'" class="sort-controls">
        <div class="sort-group">
          <label for="sort-field">Trier par</label>
          <div class="select-wrapper">
            <select id="sort-field" v-model="sortField">
              <option value="modeName">Mode</option>
              <option value="completedAt">Date</option>
              <option value="totalTime">Durée</option>
              <option value="finalScore">Score</option>
              <option value="accuracy">Précision</option>
            </select>
          </div>
        </div>
        <div class="sort-group">
          <label>Ordre</label>
          <div class="select-wrapper">
            <select v-model="sortOrder">
              <option value="asc">Ascendant</option>
              <option value="desc">Descendant</option>
            </select>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-if="activeTab === 'list'" class="stats-list-wrapper">
        <div
          ref="statsList"
          class="stats-list"
          :class="{ sorting: isSorting }"
          @scroll="onScroll"
        >
          <transition-group
            name="stats-list"
            tag="div"
            class="stats-transition-group"
          >
            <div
              v-for="(stat, idx) in sortedStats"
              :key="`${stat.modeName}-${stat.completedAt}-${idx}`"
              class="stat-item"
            >
              <div class="stat-row">
                <span class="stat-label">Mode :</span>
                <span class="stat-value">{{ stat.modeName }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Date :</span>
                <span class="stat-value">{{
                  formatDate(stat.completedAt)
                }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Durée :</span>
                <span class="stat-value">{{
                  formatDuration(stat.totalTime)
                }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Score :</span>
                <span class="stat-value">{{ stat.finalScore }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Précision :</span>
                <span class="stat-value">{{ stat.accuracy }}%</span>
              </div>
            </div>
          </transition-group>
        </div>
        <div v-if="showFade" class="stats-list-fade"></div>
        <div v-if="showFadeTop" class="stats-list-fade-top"></div>
      </div>

      <!-- Graph View -->
      <div v-if="activeTab === 'graph'" class="stats-graph-wrapper">
        <div class="chart-container">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>
    </div>

    <button v-click-animate class="back-button" @click="goHome">Retour</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { firestore } from "../utils/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
);

interface GameStat {
  modeName: string;
  completedAt: string;
  totalTime: number;
  finalScore: number;
  accuracy: number;
}

const stats = ref<GameStat[]>([]);
const router = useRouter();
const showFade = ref(false);
const showFadeTop = ref(false);
const statsList = ref<HTMLElement | null>(null);
const activeTab = ref<"list" | "graph">("list");

// Sorting state
const sortField = ref<
  "modeName" | "completedAt" | "totalTime" | "finalScore" | "accuracy"
>("completedAt");
const sortOrder = ref<"asc" | "desc">("desc");
const isSorting = ref(false);

// Loading and error state
const loading = ref(true);
const error = ref<string | null>(null);

// Sorted stats computed property
const sortedStats = computed(() => {
  const arr = [...stats.value];
  arr.sort((a, b) => {
    let aVal = a[sortField.value];
    let bVal = b[sortField.value];
    // For date, compare as date
    if (sortField.value === "completedAt") {
      aVal = new Date(aVal as string).getTime();
      bVal = new Date(bVal as string).getTime();
    }
    if (aVal < bVal) return sortOrder.value === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder.value === "asc" ? 1 : -1;
    return 0;
  });
  return arr;
});

// Watch for sort changes and trigger animation
watch([sortField, sortOrder], () => {
  if (stats.value.length > 0) {
    isSorting.value = true;
    setTimeout(() => {
      isSorting.value = false;
    }, 300);
  }
});

// Chart data computed property
const chartData = computed(() => {
  if (stats.value.length === 0) {
    return {
      labels: [],
      datasets: [],
    };
  }

  // Group stats by mode
  const groupedStats = stats.value.reduce(
    (acc, stat) => {
      if (!acc[stat.modeName]) {
        acc[stat.modeName] = [];
      }
      acc[stat.modeName].push(stat);
      return acc;
    },
    {} as Record<string, GameStat[]>,
  );

  // Sort each group by date
  Object.keys(groupedStats).forEach((mode) => {
    groupedStats[mode].sort(
      (a, b) =>
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
    );
  });

  // Create datasets for each mode
  const colors = [
    "#3B82F6", // Blue
    "#EF4444", // Red
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#84CC16", // Lime
  ];

  const datasets = Object.keys(groupedStats).map((mode, index) => ({
    label: mode,
    data: groupedStats[mode].map((stat) => ({
      x: new Date(stat.completedAt).getTime(),
      y: stat.totalTime,
    })),
    borderColor: colors[index % colors.length],
    backgroundColor: colors[index % colors.length] + "20",
    tension: 0.1,
    pointRadius: 4,
    pointHoverRadius: 6,
  }));

  return {
    datasets,
  };
});

// Chart options
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: "Durée des parties par mode de jeu",
      font: {
        size: 16,
        weight: "bold" as const,
      },
    },
    legend: {
      display: true,
      position: "top" as const,
    },
    tooltip: {
      callbacks: {
        title: (context: any) => {
          return formatDate(new Date(context[0].parsed.x).toISOString());
        },
        label: (context: any) => {
          return `${context.dataset.label}: ${formatDuration(context.parsed.y)}`;
        },
      },
    },
  },
  scales: {
    x: {
      type: "time" as const,
      time: {
        unit: "day" as const,
        displayFormats: {
          day: "MMM dd",
        },
      },
      title: {
        display: true,
        text: "Date",
      },
    },
    y: {
      title: {
        display: true,
        text: "Durée (secondes)",
      },
      ticks: {
        callback: function (value: any) {
          return formatDuration(Number(value));
        },
      },
    },
  },
}));

function checkFade() {
  const el = statsList.value;
  if (!el) return;
  showFade.value =
    el.scrollHeight > el.clientHeight &&
    el.scrollTop + el.clientHeight < el.scrollHeight - 2;
  showFadeTop.value = el.scrollHeight > el.clientHeight && el.scrollTop > 2;
}

function onScroll() {
  checkFade();
}

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    const q = query(
      collection(firestore, "gameCompletions"),
      orderBy("completedAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    stats.value = querySnapshot.docs.map((doc) => doc.data() as GameStat);
  } catch (e: any) {
    error.value = "Erreur lors du chargement des statistiques.";
    stats.value = [];
  } finally {
    loading.value = false;
    nextTick(() => {
      checkFade();
    });
  }
});

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString();
}

function formatDuration(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}m ${sec < 10 ? "0" : ""}${sec}s`;
}

function goHome() {
  router.push({ name: "Home" });
}
</script>

<style scoped lang="scss">
.stats-page {
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 32px 0 24px;
  background: var(--background-light);
  /* Remove card effect */
  border-radius: 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 1 auto;
  position: relative;
}

.stats-page h1 {
  font-size: 2em;
  margin-bottom: 24px;
  color: var(--primary-color);
}

.stats-content {
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 70vh;
}

/* Tab Navigation */
.tab-nav {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  background: var(--background-off);
  border-radius: 12px;
  padding: 4px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.tab-button {
  padding: 8px 20px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95em;
}

.tab-button:hover {
  color: var(--text-primary);
}

.tab-button.active {
  background: var(--primary-color);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-button:not(.active):hover {
  background: rgba(var(--primary-color-rgb, 59, 130, 246), 0.1);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08);
}

/* Sorting Controls */
.sort-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  justify-content: center;
  background: var(--background-off);
  border-radius: 12px;
  padding: 16px 20px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.sort-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.sort-controls label {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.sort-controls select {
  padding: 8px 32px 8px 16px; // extra right padding for arrow
  border-radius: 8px;
  border: 2px solid var(--background-light);
  background: var(--background-light);
  color: var(--text-primary);
  font-size: 0.95em;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  min-width: 120px;
  text-align: left;
}

.sort-controls select:hover {
  border-color: var(--primary-color);
  background: white;
}

.sort-controls select:focus {
  outline: none;
  border-color: var(--primary-color);
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.select-wrapper::after {
  content: "";
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('data:image/svg+xml;utf8,<svg fill="%23666" height="16" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>');
  background-repeat: no-repeat;
  background-size: 16px 16px;
}

/* List View Styles */
.stats-list-wrapper {
  width: 100%;
  position: relative;
  flex: 1 1 auto;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 100%;
}

.stats-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  flex: 1 1 auto;
  max-height: 100%;
  min-height: 0;
  overflow-y: auto;
  position: relative;
  padding-bottom: 90px; // enough for fade + button
  transition: opacity 0.3s ease;
}

.stats-list.sorting {
  opacity: 0.7;
}

.stats-transition-group {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
}

/* Animation for list items */
.stats-list-enter-active,
.stats-list-leave-active {
  transition: all 0.3s ease;
}

.stats-list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.stats-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.stats-list-move {
  transition: transform 0.3s ease;
}

.stats-list-fade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 72px;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0.85) 95%,
    var(--background-light) 100%
  );
  z-index: 2;
}

.stats-list-fade-top {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 48px;
  pointer-events: none;
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0.85) 95%,
    var(--background-light) 100%
  );
  z-index: 2;
}

.stat-item {
  background: var(--background-off);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 1.05em;
}

.stat-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-value {
  color: var(--text-primary);
  font-weight: 600;
}

/* Graph View Styles */
.stats-graph-wrapper {
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 0 20px;
}

.chart-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: var(--background-off);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
}

@media (max-width: 600px) {
  .stats-content {
    max-height: 75vh;
  }

  .chart-container {
    min-height: 300px;
    padding: 15px;
  }

  .stats-graph-wrapper {
    padding: 0 10px;
  }

  .tab-nav {
    margin-bottom: 20px;
  }

  .tab-button {
    padding: 6px 16px;
    font-size: 0.9em;
  }
}

.empty-stats {
  color: var(--text-secondary);
  font-size: 1.1em;
  margin-bottom: 32px;
}

.back-button {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  margin: 0;
  width: fit-content;
  padding: 10px 24px;
  border-radius: 24px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.2s;
  z-index: 100;
  display: block;
}

.back-button:hover {
  background: var(--primary-dark);
}
</style>
