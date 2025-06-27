<template>
  <div class="stats-page">
    <h1>Mes Statistiques</h1>
    
    <div v-if="stats.length === 0" class="empty-stats">
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

      <!-- List View -->
      <div v-if="activeTab === 'list'" class="stats-list-wrapper">
        <div
          ref="statsList"
          class="stats-list"
          @scroll="onScroll"
        >
          <div v-for="(stat, idx) in stats" :key="idx" class="stat-item">
            <div class="stat-row">
              <span class="stat-label">Mode :</span>
              <span class="stat-value">{{ stat.modeName }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Date :</span>
              <span class="stat-value">{{ formatDate(stat.completedAt) }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Durée :</span>
              <span class="stat-value">{{ formatDuration(stat.totalTime) }}</span>
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
        </div>
        <div
          v-if="showFade"
          class="stats-list-fade"
        ></div>
        <div
          v-if="showFadeTop"
          class="stats-list-fade-top"
        ></div>
      </div>

      <!-- Graph View -->
      <div v-if="activeTab === 'graph'" class="stats-graph-wrapper">
        <div class="chart-container">
          <Line
            :data="chartData"
            :options="chartOptions"
          />
        </div>
      </div>
    </div>
    
    <button v-click-animate class="back-button" @click="goHome">Retour</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from "vue";
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface GameStat {
  modeName: string;
  completedAt: string;
  totalTime: number;
  finalScore: number;
  accuracy: number;
}

const stats = ref<GameStat[]>([]);
const showFade = ref(false);
const showFadeTop = ref(false);
const statsList = ref<HTMLElement | null>(null);
const activeTab = ref<'list' | 'graph'>('list');

// Chart data computed property
const chartData = computed(() => {
  if (stats.value.length === 0) {
    return {
      labels: [],
      datasets: []
    };
  }

  // Group stats by mode
  const groupedStats = stats.value.reduce((acc, stat) => {
    if (!acc[stat.modeName]) {
      acc[stat.modeName] = [];
    }
    acc[stat.modeName].push(stat);
    return acc;
  }, {} as Record<string, GameStat[]>);

  // Sort each group by date
  Object.keys(groupedStats).forEach(mode => {
    groupedStats[mode].sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
  });

  // Create datasets for each mode
  const colors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ];

  const datasets = Object.keys(groupedStats).map((mode, index) => ({
    label: mode,
    data: groupedStats[mode].map(stat => ({
      x: new Date(stat.completedAt).getTime(),
      y: stat.totalTime
    })),
    borderColor: colors[index % colors.length],
    backgroundColor: colors[index % colors.length] + '20',
    tension: 0.1,
    pointRadius: 4,
    pointHoverRadius: 6
  }));

  return {
    datasets
  };
});

// Chart options
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: 'Durée des parties par mode de jeu',
      font: {
        size: 16,
        weight: 'bold' as const
      }
    },
    legend: {
      display: true,
      position: 'top' as const
    },
    tooltip: {
      callbacks: {
        title: (context: any) => {
          return formatDate(new Date(context[0].parsed.x).toISOString());
        },
        label: (context: any) => {
          return `${context.dataset.label}: ${formatDuration(context.parsed.y)}`;
        }
      }
    }
  },
  scales: {
    x: {
      type: 'time' as const,
      time: {
        unit: 'day' as const,
        displayFormats: {
          day: 'MMM dd'
        }
      },
      title: {
        display: true,
        text: 'Date'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Durée (secondes)'
      },
      ticks: {
        callback: function(value: any) {
          return formatDuration(Number(value));
        }
      }
    }
  }
}));

function checkFade() {
  const el = statsList.value;
  if (!el) return;
  showFade.value = el.scrollHeight > el.clientHeight && el.scrollTop + el.clientHeight < el.scrollHeight - 2;
  showFadeTop.value = el.scrollHeight > el.clientHeight && el.scrollTop > 2;
}

function onScroll() {
  checkFade();
}

onMounted(() => {
  const raw = localStorage.getItem("gameCompletions");
  if (raw) {
    try {
      stats.value = JSON.parse(raw);
    } catch {
      stats.value = [];
    }
  }
  nextTick(() => {
    checkFade();
  });
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
  window.dispatchEvent(new CustomEvent("navigate-home"));
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
}

.stats-list-fade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 72px;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.85) 95%, var(--background-light) 100%);
  z-index: 2;
}

.stats-list-fade-top {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 48px;
  pointer-events: none;
  background: linear-gradient(to top, rgba(255,255,255,0), rgba(255,255,255,0.85) 95%, var(--background-light) 100%);
  z-index: 2;
}

.stat-item {
  background: var(--background-off);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
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
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 24px auto 0 auto;
  width: fit-content;
  padding: 10px 24px;
  border-radius: 24px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.2s;
  z-index: 10;
  display: block;
}

.back-button:hover {
  background: var(--primary-dark);
}
</style>
