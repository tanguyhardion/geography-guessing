# Copilot Instructions for `geography-guessing`

## Project Overview

- **Vue 3 + TypeScript** app for interactive geography quizzes (French departments, world countries, Russian cities/oblasts, flags, capitals).
- **Pinia** is used for state management. Each game mode has its own store in `src/store/`.
- **Composable pattern**: Game logic is extracted into composables (e.g., `useFlagGuessing.ts`, `useCountryMapGuessing.ts`) for reusability and testability.
- **Leaflet.js** powers interactive maps (see `CountryMapGuessing.vue`, `FrenchDepartmentGuessing.vue`).
- **Firebase** is used for logging game completions (`src/utils/completionLogger.ts`).

## Architecture & Data Flow

- **Game Modes**: Each mode (flags, maps, departments, etc.) has:
  - A dedicated store (e.g., `flagStore.ts`, `departmentStore.ts`)
  - A composable for logic (e.g., `useFlagGuessing.ts`)
  - A Vue component for UI (e.g., `FlagGuessing.vue`)
- **State**: All game state is managed in Pinia stores. Use composables to interact with stores, not directly in components.
- **Event Bus**: `src/eventBus.ts` provides a typed event bus (mitt) for cross-component communication (e.g., navigation).
- **Routing**: Vue Router is configured in `src/router/index.ts`. The `/game` route redirects to `/` on hard refresh.

## Developer Workflows

- **Development**: The dev server is already running. Do NOT start it again.
- **Build**: `npm run build`
- **Deploy**: `npm run deploy`
- **Format**: `npm run format`
- **Dependencies**: `npm install`
- **Testing**: No formal test suite is present; logic is separated into composables for easier future testing.

## Project-Specific Patterns

- **Fuzzy Matching**: All user input is checked with Levenshtein-based fuzzy matching (`src/utils/stringUtils.ts`).
- **Skip/Replay**: Skipping and replaying are handled via dedicated components (`SkipButton.vue`) and events.
- **Completion Logging**: Game completions are logged to Firestore with device and location info (`completionLogger.ts`).
- **Continent Filtering**: Many modes support continent-based filtering; see store and composable logic.
- **Accessibility**: Components use ARIA labels and keyboard navigation where possible.

## Key Files & Directories

- `src/components/`: UI for each game mode.
- `src/composables/`: Game logic, always use these for implementing features.
- `src/store/`: Pinia stores for all game and UI state.
- `src/utils/`: Utility functions (fuzzy matching, random selection, Firebase, etc.).
- `src/eventBus.ts`: Typed event bus for decoupled communication.
- `src/router/`: Vue Router config.

## Conventions

- **Always use composables for business logic**; keep components focused on UI.
- **Do not mutate store state directly in components**; use store actions or composables.
- **Add new game modes by following the composable + store + component pattern.**
- **Use the event bus for cross-component events, not props or global state.**
- **Do not start the dev server if it is already running.**
