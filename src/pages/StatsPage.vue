<template>
  <div class="stats">
    <header class="head">
      <RouterLink :to="{ name: 'Home' }" class="btn btn-quiet back">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M15 5l-7 7 7 7"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Accueil
      </RouterLink>
      <h1>Mes statistiques</h1>
      <p class="note">
        Tes parties terminées, enregistrées uniquement dans ce navigateur.
      </p>
    </header>

    <div v-if="results.length === 0" class="empty">
      <p>Aucune partie terminée pour l'instant.</p>
      <RouterLink :to="{ name: 'Home' }" class="btn btn-primary">
        Choisir un quiz
      </RouterLink>
    </div>

    <template v-else>
      <dl class="summary">
        <div>
          <dt>Parties terminées</dt>
          <dd class="tabular">{{ results.length }}</dd>
        </div>
        <div>
          <dt>Temps de jeu</dt>
          <dd class="tabular">{{ formatDuration(totalTime) }}</dd>
        </div>
        <div>
          <dt>Précision moyenne</dt>
          <dd class="tabular">{{ averageAccuracy }} %</dd>
        </div>
      </dl>

      <div class="toolbar">
        <div class="tabs" role="tablist" aria-label="Affichage">
          <button
            v-for="tab in TABS"
            :key="tab.id"
            type="button"
            role="tab"
            :aria-selected="activeTab === tab.id"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
        <button type="button" class="btn btn-quiet clear" @click="clearAll">
          Effacer l'historique
        </button>
      </div>

      <div v-if="activeTab === 'list'" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th
                v-for="column in COLUMNS"
                :key="column.field"
                scope="col"
                :class="{ numeric: column.numeric }"
                :aria-sort="ariaSort(column.field)"
              >
                <button type="button" @click="sortBy(column.field)">
                  {{ column.label }}
                  <span class="arrow" aria-hidden="true">{{
                    sortField === column.field
                      ? sortOrder === "asc"
                        ? "↑"
                        : "↓"
                      : ""
                  }}</span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="result in sortedResults"
              :key="result.completedAt + result.modeName"
            >
              <td data-label="Mode" class="mode">{{ labelOf(result) }}</td>
              <td data-label="Date">{{ formatDate(result.completedAt) }}</td>
              <td data-label="Durée" class="numeric tabular">
                {{ formatDuration(result.totalTime) }}
              </td>
              <td data-label="Score" class="numeric tabular">
                {{ result.finalScore }}
              </td>
              <td data-label="Précision" class="numeric tabular">
                {{ result.accuracy }} %
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="chart-card">
        <h2>Durée des parties par mode</h2>
        <StatsChart :results="results" :label-of="labelOf" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from "vue";
import type { GameResult } from "../types";
import { clearHistory, loadHistory } from "../utils/statsStorage";
import { formatDuration } from "../utils/stringUtils";

// Chart.js is only downloaded when the chart tab is opened.
const StatsChart = defineAsyncComponent(
  () => import("../components/StatsChart.vue"),
);

type SortField =
  | "modeName"
  | "completedAt"
  | "totalTime"
  | "finalScore"
  | "accuracy";

const TABS = [
  { id: "list", label: "Liste" },
  { id: "chart", label: "Graphique" },
] as const;

const COLUMNS: { field: SortField; label: string; numeric?: boolean }[] = [
  { field: "modeName", label: "Mode" },
  { field: "completedAt", label: "Date" },
  { field: "totalTime", label: "Durée", numeric: true },
  { field: "finalScore", label: "Score", numeric: true },
  { field: "accuracy", label: "Précision", numeric: true },
];

const results = ref<GameResult[]>(loadHistory());
const activeTab = ref<(typeof TABS)[number]["id"]>("list");
const sortField = ref<SortField>("completedAt");
const sortOrder = ref<"asc" | "desc">("desc");

/** Runs limited to one continent are listed (and charted) separately. */
function labelOf(result: GameResult): string {
  return result.continent && result.continent !== "all"
    ? `${result.modeName} · ${result.continent}`
    : result.modeName;
}

const totalTime = computed(() =>
  results.value.reduce((sum, r) => sum + r.totalTime, 0),
);
const averageAccuracy = computed(() =>
  Math.round(
    results.value.reduce((sum, r) => sum + r.accuracy, 0) /
      results.value.length,
  ),
);

const sortedResults = computed(() => {
  const field = sortField.value;
  const direction = sortOrder.value === "asc" ? 1 : -1;
  return [...results.value].sort((a, b) => {
    const order =
      field === "modeName"
        ? labelOf(a).localeCompare(labelOf(b), "fr")
        : field === "completedAt"
          ? a.completedAt.localeCompare(b.completedAt) // ISO dates sort as text
          : a[field] - b[field];
    return order * direction;
  });
});

function sortBy(field: SortField) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortOrder.value = field === "modeName" ? "asc" : "desc";
  }
}

function ariaSort(field: SortField) {
  if (sortField.value !== field) return "none";
  return sortOrder.value === "asc" ? "ascending" : "descending";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function clearAll() {
  if (
    window.confirm(
      "Effacer définitivement tout l'historique de ce navigateur ?",
    )
  ) {
    clearHistory();
    results.value = [];
  }
}
</script>

<style scoped lang="scss">
.stats {
  width: min(960px, 100%);
  margin: 0 auto;
  padding: 20px 20px 48px;
}

.back {
  margin-left: -12px;
  padding: 0 14px 0 8px;
}

h1 {
  margin-top: 14px;
  font-size: clamp(2rem, 1.4rem + 3vw, 3rem);
  letter-spacing: -0.02em;
}

.note {
  margin-top: 6px;
  color: var(--ink-2);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  padding: 48px 20px;
  border-radius: var(--radius);
  border: 1px dashed var(--line);
  color: var(--ink-2);
  text-align: center;
}

.summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 24px;

  div {
    padding: 14px 16px;
    border-radius: var(--radius);
    border: 1px solid var(--line);
    background: var(--surface);
  }

  dt {
    color: var(--ink-2);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  dd {
    margin-top: 2px;
    font-family: var(--font-display);
    font-size: clamp(1.3rem, 1rem + 1.5vw, 1.9rem);
    font-weight: 600;
  }
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 24px 0 12px;
}

.tabs {
  display: flex;
  padding: 3px;
  border-radius: 999px;
  background: var(--surface-2);

  button {
    min-height: 36px;
    padding: 0 16px;
    border-radius: 999px;
    color: var(--ink-2);
    font-weight: 600;

    &[aria-selected="true"] {
      background: var(--surface);
      color: var(--ink);
      box-shadow: var(--shadow-1);
    }
  }
}

.clear {
  min-height: 36px;
  font-size: 0.9rem;
}

.table-wrap,
.chart-card {
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: var(--surface);
  overflow: hidden;
}

.chart-card {
  padding: 18px 16px 12px;

  h2 {
    margin-bottom: 12px;
    font-size: 1.15rem;
  }
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: var(--surface-2);
  text-align: left;

  button {
    width: 100%;
    padding: 10px 14px;
    color: var(--ink-2);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-align: inherit;
    text-transform: uppercase;
    white-space: nowrap;

    &:hover {
      color: var(--ink);
    }
  }

  &[aria-sort="ascending"] button,
  &[aria-sort="descending"] button {
    color: var(--accent);
  }
}

.arrow {
  display: inline-block;
  width: 1em;
}

td {
  padding: 11px 14px;
  border-top: 1px solid var(--line);
  font-size: 0.95rem;
}

.numeric {
  text-align: right;
}

.mode {
  font-weight: 600;
}

@media (max-width: 640px) {
  .stats {
    padding: 14px 14px 40px;
  }

  .summary {
    gap: 6px;

    div {
      padding: 10px;
    }
  }

  // Each result becomes a small card instead of a wide table row.
  thead {
    display: none;
  }

  tr {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 4px 10px;
    padding: 12px 14px;
    border-top: 1px solid var(--line);

    &:first-child {
      border-top: none;
    }
  }

  td {
    padding: 0;
    border: none;
    text-align: left;

    &.mode {
      grid-column: 1 / -1;
    }

    &[data-label="Date"] {
      grid-column: 1 / -1;
      color: var(--ink-2);
      font-size: 0.85rem;
    }

    &.numeric::before {
      content: attr(data-label);
      display: block;
      color: var(--ink-2);
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
  }
}
</style>
