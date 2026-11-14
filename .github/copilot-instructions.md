# Copilot Instructions for `geography-guessing`

## Project Overview

- **Vue 3 + TypeScript** app for interactive geography quizzes (French departments, world countries, Russian cities/oblasts, flags, capitals). The UI is in French.
- **Pinia** holds the state of the round being played, in a single store (`src/store/game.ts`).
- **Leaflet.js** draws the maps, driven directly from `src/components/boards/MapBoard.vue` (no wrapper library, no tile basemap: land is drawn from GeoJSON).
- **Firebase** receives an anonymous usage log of finished games from production builds only; the stats page reads the player's own history from `localStorage`.

## Architecture & Data Flow

- **Modes are data.** Every game mode is one entry in `MODES` (`src/game/modes.ts`): title, board type, optional continent filter / alternate language / map config, and a `build()` function returning the `questions` to ask and the clickable `choices`.
- **One engine.** `useGameStore` runs any mode: question order, judging clicks and typed answers, skip, hints, timer, feedback messages, and saving the result. Components never duplicate this logic.
- **Four boards** render the play area, chosen by `mode.board`:
  - `map` → `MapBoard.vue` (regions from GeoJSON or point markers)
  - `text` → `TextBoard.vue` (typed answer, fuzzy-matched)
  - `flags` / `numbers` → `ChoiceGrid.vue`
- **Routing** (`src/router/index.ts`): `/` home, `/jouer/:modeId?continent=…` game, `/stats`. The mode lives in the URL, so a game survives a refresh. Game and stats pages are lazy-loaded.
- **Shared UI**: `GameHud`, `PromptPanel`, `FeedbackToast`, `CompletionCard`.

## Developer Workflows

- **Development**: `npm run dev` (do not start it again if it is already running).
- **Build**: `npm run build` (type-checks with `vue-tsc`, then builds; also writes `dist/404.html` for GitHub Pages deep links).
- **Format**: `npm run format`
- **Deploy**: push to `main`; the GitHub Actions workflow builds and publishes to GitHub Pages. Pull requests are built but not deployed.
- **Testing**: no test suite. Logic worth testing lives in `src/utils/stringUtils.ts` and `src/store/game.ts`.

## Project-Specific Patterns

- **Adding a mode**: add an entry to `MODES`. Only add a component if a genuinely new board type is needed.
- **Map ids**: a region's choice `id` must equal the GeoJSON feature property named by `map.featureKey` (`code` for departments, `ADM0_A3` for countries, `iso` for oblasts). Regions missing from the map data are dropped from the round at runtime, so a game can always be finished.
- **Typed answers**: `isAnswerMatch` ignores case, accents and punctuation and tolerates small typos, but a guess that is exactly another country's/capital's name is rejected (Islande ≠ Irlande).
- **Skip**: the question stays in the pool and comes back later. Text boards reveal the answer; click boards highlight where it was.
- **Results**: `logGameCompletion` saves to `localStorage` (`src/utils/statsStorage.ts`) and, in production with Firebase configured, to Firestore. `logName` values are kept stable so old stats stay comparable.
- **Styling**: design tokens are CSS custom properties in `src/style.scss` (light and dark via `prefers-color-scheme`). Use the tokens, not hard-coded colours. Map colours are read from the `--map-*` tokens.
- **Accessibility**: real `<button>`/`<a>` elements, visible focus rings, `aria-live` feedback. Flag buttons are deliberately not labelled with the country name.

## Key Files & Directories

- `src/game/modes.ts`: mode registry (start here).
- `src/store/game.ts`: the game engine.
- `src/components/boards/`: play surfaces.
- `src/pages/`: `HomePage`, `GamePage`, `StatsPage`.
- `src/data/`: static datasets.
- `src/utils/`: string matching, local stats storage, completion logging, Firebase init.
- `public/oblasts.json`: Russian regions GeoJSON (minified; excluded from Prettier).
