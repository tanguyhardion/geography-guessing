<template>
  <div class="home">
    <header class="masthead">
      <div class="masthead-top">
        <RouterLink :to="{ name: 'Stats' }" class="btn stats-link">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 20v-7M12 20V5M19 20v-10"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
            />
          </svg>
          Statistiques
        </RouterLink>
      </div>
      <h1 class="title">
        <img class="logo" :src="logoUrl" alt="" />
        <span>Quiz Géographique</span>
      </h1>
      <p class="lede">
        Cartes, drapeaux, capitales et départements : douze façons de réviser la
        géographie, à ton rythme.
      </p>
    </header>

    <main>
      <section
        v-for="category in categories"
        :key="category.id"
        class="category"
        :aria-labelledby="`cat-${category.id}`"
      >
        <div class="category-head">
          <h2 :id="`cat-${category.id}`">{{ category.title }}</h2>
          <p>{{ category.blurb }}</p>
        </div>

        <ul class="modes">
          <li
            v-for="mode in category.modes"
            :key="mode.id"
            class="mode"
            :class="{ open: openMode === mode.id }"
          >
            <component
              :is="mode.continents ? 'button' : RouterLink"
              v-bind="
                mode.continents
                  ? { type: 'button', 'aria-expanded': openMode === mode.id }
                  : { to: { name: 'Game', params: { modeId: mode.id } } }
              "
              class="mode-main"
              @click="mode.continents && toggle(mode.id)"
            >
              <span class="mode-text">
                <span class="mode-title">{{ mode.title }}</span>
                <span class="mode-blurb">{{ mode.blurb }}</span>
              </span>
              <span class="mode-meta">
                <span class="tabular">{{ mode.count }} {{ mode.unit }}</span>
                <span v-if="mode.best !== undefined" class="best tabular">
                  Record {{ formatClock(mode.best) }}
                </span>
              </span>
              <svg
                class="chevron"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M9 5l7 7-7 7"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </component>

            <div
              v-if="mode.continents && openMode === mode.id"
              class="continents"
            >
              <p>Choisis une zone :</p>
              <div class="chips">
                <RouterLink
                  :to="{ name: 'Game', params: { modeId: mode.id } }"
                  class="chip chip-all"
                >
                  Monde entier
                </RouterLink>
                <RouterLink
                  v-for="continent in CONTINENTS"
                  :key="continent"
                  :to="{
                    name: 'Game',
                    params: { modeId: mode.id },
                    query: { continent },
                  }"
                  class="chip"
                >
                  {{ continent }}
                </RouterLink>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </main>

    <footer class="footer">
      Fait avec ❤️ par
      <a
        href="https://linkedin.com/in/tanguy-hardion"
        target="_blank"
        rel="noopener noreferrer"
      >
        Tanguy Hardion
      </a>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { CATEGORIES, CONTINENTS, MODES } from "../game/modes";
import { bestTimes, loadHistory } from "../utils/statsStorage";
import { formatClock } from "../utils/stringUtils";

const logoUrl = `${import.meta.env.BASE_URL}favicon.svg`;
const records = bestTimes(loadHistory());

const categories = CATEGORIES.map((category) => ({
  ...category,
  modes: MODES.filter((mode) => mode.category === category.id).map((mode) => ({
    ...mode,
    count: mode.build("all").questions.length,
    best: records[mode.id] as number | undefined,
  })),
}));

const openMode = ref<string | null>(null);
function toggle(id: string) {
  openMode.value = openMode.value === id ? null : id;
}
</script>

<style scoped lang="scss">
.home {
  width: min(1040px, 100%);
  min-height: 100%;
  margin: 0 auto;
  padding: 28px 20px 24px;
  display: flex;
  flex-direction: column;
}

.masthead {
  padding-bottom: 28px;
  border-bottom: 1px solid var(--line);
}

.masthead-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.stats-link {
  min-height: 38px;
  font-size: 0.92rem;
}

h1 {
  display: flex;
  align-items: flex-start;
  gap: clamp(12px, 2vw, 20px);
  line-height: 1.05;
  font-size: clamp(2.4rem, 1.4rem + 5vw, 4.2rem);
  font-weight: 600;
  letter-spacing: -0.025em;
}

.logo {
  flex: none;
  width: 0.85em;
  height: 0.85em;
  margin-top: 0.08em;
}

.lede {
  max-width: 34rem;
  margin-top: 12px;
  color: var(--ink-2);
  font-size: 1.1rem;
}

.category {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) 3fr;
  gap: 16px 32px;
  padding: 28px 0;
  border-bottom: 1px solid var(--line);
}

.category-head {
  h2 {
    font-size: 1.45rem;
  }

  p {
    margin-top: 6px;
    color: var(--ink-2);
    font-size: 0.95rem;
  }
}

.modes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
  align-items: start;
  list-style: none;
}

.mode {
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: var(--shadow-1);
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;

  &:hover,
  &.open {
    border-color: var(--accent);
  }

  &:hover:not(.open) {
    transform: translateY(-2px);
  }

  &.open {
    grid-column: 1 / -1;
  }
}

.mode-main {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    "text chevron"
    "meta chevron";
  align-items: center;
  gap: 10px 12px;
  width: 100%;
  padding: 16px 14px 14px 18px;
  border-radius: var(--radius);
  color: inherit;
  text-align: left;
  text-decoration: none;
}

.mode-text {
  grid-area: text;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mode-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 600;
  line-height: 1.2;
}

.mode-blurb {
  color: var(--ink-2);
  font-size: 0.9rem;
  line-height: 1.35;
}

.mode-meta {
  grid-area: meta;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  color: var(--ink-2);
  font-size: 0.8rem;
  font-weight: 600;
}

.best {
  color: var(--ok);
}

.chevron {
  grid-area: chevron;
  color: var(--ink-2);
  transition: transform 0.15s ease;

  .mode:hover & {
    color: var(--accent);
  }

  .open & {
    transform: rotate(90deg);
  }
}

.continents {
  padding: 0 18px 16px;

  p {
    margin-bottom: 8px;
    color: var(--ink-2);
    font-size: 0.85rem;
    font-weight: 600;
  }
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--ink);
  font-size: 0.92rem;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
}

.chip-all {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--accent-ink);

  &:hover {
    background: var(--accent);
    filter: brightness(1.08);
  }
}

.footer {
  margin-top: auto;
  padding-top: 24px;
  color: var(--ink-2);
  font-size: 0.88rem;
  text-align: center;

  a {
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

@media (max-width: 760px) {
  .home {
    padding: 20px 16px;
  }

  .category {
    grid-template-columns: 1fr;
    padding: 22px 0;
  }

  .modes {
    grid-template-columns: 1fr;
  }
}
</style>
