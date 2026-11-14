# Geography Guessing Game

_Built using GitHub Copilot's Agent mode with Claude Sonnet 4, Claude 3.7 Sonnet, Gemini 2.5 Pro, and GPT-4.1_

A Vue.js geography learning application with interactive game modes to test your knowledge of French departments, world countries, cities, and capitals.

## Game Modes

### 🗺️ Interactive Geography

1. **French Departments Map** - Click on French departments on an interactive map
2. **World Countries Map** - Locate countries on a world map
3. **Russian Cities Map** - Find major Russian cities (82 cities with 200k+ population)
4. **Russian Oblasts Map** - Locate Russian oblasts on an interactive map
5. **French Chef-lieux Map** - Locate French department capitals

### 🏛️ French Departments Quiz

6. **Chef-lieux Mode** - Guess department numbers from prefecture names
7. **Department Names Mode** - Guess department numbers from department names
8. **Combined Mode** - Mix of chef-lieu and department name questions

### 🌍 World Countries

9. **Flag Recognition** - Guess the country from the flag and vice versa
10. **Country Capitals** - Guess the capital city of each country and vice versa

## Features

- Interactive maps with Leaflet.js, drawn from GeoJSON (no third-party tile service)
- Live timer, accuracy and progress tracking
- Fuzzy string matching for typo forgiveness
- Continent-based filtering for flags, capitals and the world map
- Color-coded feedback, with the answer shown when a question is skipped
- Personal statistics and best times, stored in the browser
- Light and dark themes, responsive from phone to desktop
- Shareable, refresh-safe URLs for every game mode

## Tech Stack

- **Vue 3** with TypeScript
- **Pinia** for state management
- **Leaflet.js** for interactive maps
- **Vite** for build tooling
- **SASS** for styling

## Architecture

Every game mode is a data entry in `src/game/modes.ts`; a single Pinia store
(`src/store/game.ts`) runs the round, and four small boards in
`src/components/boards/` render the play area (map, typed answer, flag grid,
number grid). Adding a mode usually means adding one entry to `MODES`.

## Live Demo

**🔗 [Access the Geography Quiz](https://tanguyhardion.github.io/geography-guessing/)**

## Development

```bash
# Clone and install
git clone https://github.com/tanguyhardion/geography-guessing.git
cd geography-guessing
npm install

# Development
npm run dev

# Build
npm run build
```

Deployment is automatic: pushing to `main` builds the site and publishes it to
GitHub Pages. Pull requests are built but not deployed.

The optional `VITE_FIREBASE_*` variables (see `src/utils/firebase.ts`) enable
an anonymous usage log of finished games in production builds. Without them the
app works the same; player statistics are always kept in the browser.

---

**Created by [Tanguy Hardion](https://linkedin.com/in/tanguy-hardion)**
