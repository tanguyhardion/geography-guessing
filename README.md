# Geography Guessing Game

_Built using GitHub Copilot's Agent mode with Claude Sonnet 4, Claude 3.7 Sonnet, Gemini 2.5 Pro, and GPT-4.1_

A Vue.js geography learning application with interactive game modes to test your knowledge of French departments, world countries, cities, and capitals.

## Game Modes

### 🗺️ Interactive Geography

1. **French Departments Map** - Click on French departments on an interactive map
2. **World Countries Map** - Locate countries on a world map
3. **Russian Cities Map** - Find major Russian cities (82 cities with 200k+ population)
4. **French Chef-lieux Map** - Locate French department capitals

### 🏛️ French Departments Quiz

5. **Chef-lieux Mode** - Guess department numbers from prefecture names
6. **Department Names Mode** - Guess department numbers from department names
7. **Combined Mode** - Mix of chef-lieu and department name questions

### 🏁 World Flags

8. **Flag Recognition** - Standard mode (flag → country) and reverse mode (country → flag)

## Features

- Interactive maps with Leaflet.js
- Real-time scoring and progress tracking
- Fuzzy string matching for typo forgiveness
- Continent-based filtering for flags
- Color-coded feedback system
- Responsive design for desktop and mobile

## Tech Stack

- **Vue 3** with TypeScript
- **Pinia** for state management
- **Leaflet.js** for interactive maps
- **Vite** for build tooling
- **SASS** for styling

## Live Demo

**🔗 [Access the Geography Quiz](https://tanguyhardion.github.io/geography-guessing/)**

## Development

```bash
# Clone and install
git clone https://github.com/your-username/geography-guessing.git
cd geography-guessing
npm install

# Development
npm run dev

# Build
npm run build

# Deploy
npm run deploy
```

---

**Created by [Tanguy Hardion](https://linkedin.com/in/tanguy-hardion)**
