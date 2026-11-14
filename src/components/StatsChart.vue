<template>
  <div class="chart">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { fr } from "date-fns/locale";
import type { GameResult } from "../types";
import { formatClock, formatDuration } from "../utils/stringUtils";

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale,
);

const props = defineProps<{
  results: GameResult[];
  labelOf: (r: GameResult) => string;
}>();

// Categorical palette, readable on both the light and the dark surface.
const SERIES_COLORS = [
  "#2a8fb0",
  "#d9662b",
  "#3a9d63",
  "#b3528f",
  "#c99a1a",
  "#6a6fd1",
  "#d0453f",
  "#3fa7a0",
];

const css = getComputedStyle(document.documentElement);
const ink = css.getPropertyValue("--ink-2").trim();
const line = css.getPropertyValue("--line").trim();

const chartData = computed(() => {
  const byMode = new Map<string, GameResult[]>();
  for (const result of props.results) {
    const label = props.labelOf(result);
    byMode.set(label, [...(byMode.get(label) ?? []), result]);
  }
  return {
    datasets: [...byMode.entries()].map(([label, results], index) => {
      const color = SERIES_COLORS[index % SERIES_COLORS.length];
      return {
        label,
        data: results
          .map((r) => ({
            x: new Date(r.completedAt).getTime(),
            y: r.totalTime,
          }))
          .sort((a, b) => a.x - b.x),
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2,
        tension: 0.15,
        pointRadius: 4,
        pointHoverRadius: 6,
      };
    }),
  };
});

const chartOptions = computed<ChartOptions<"line">>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "nearest", intersect: false },
  plugins: {
    legend: {
      position: "bottom",
      labels: { color: ink, usePointStyle: true, boxHeight: 7 },
    },
    tooltip: {
      callbacks: {
        title: (items) =>
          new Date(items[0].parsed.x ?? 0).toLocaleString("fr-FR", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
        label: (item) =>
          `${item.dataset.label} : ${formatDuration(item.parsed.y ?? 0)}`,
      },
    },
  },
  scales: {
    x: {
      type: "time",
      adapters: { date: { locale: fr } },
      time: { minUnit: "day", tooltipFormat: "PPp" },
      ticks: { color: ink, maxRotation: 0, autoSkipPadding: 16 },
      grid: { display: false },
      border: { color: line },
    },
    y: {
      beginAtZero: true,
      title: { display: true, text: "Durée de la partie", color: ink },
      ticks: { color: ink, callback: (value) => formatClock(Number(value)) },
      grid: { color: line },
      border: { display: false },
    },
  },
}));
</script>

<style scoped>
.chart {
  position: relative;
  height: min(60vh, 460px);
  min-height: 300px;
}
</style>
