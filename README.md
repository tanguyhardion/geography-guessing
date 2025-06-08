# Quiz Géographique

A comprehensive Vue.js geography learning application featuring multiple interactive game modes to test your knowledge of French departments, world countries, cities, and capitals.

Built with modern web technologies and featuring an intuitive interface in French, this application provides engaging ways to learn geography through interactive maps, flags, and location-based quizzes.

## Features Overview

The application is organized into **3 main categories** with **8 distinct game modes**:

### 🗺️ **Géographie Interactive** (Interactive Geography)

Map-based learning with visual geographical context using interactive Leaflet maps.

#### 1. **French Departments Map** (`guessMapLocation`)

- Click directly on French departments on an interactive map
- Visual learning with real geographical context
- Color-coded feedback system showing correct/incorrect guesses
- Covers all 101 French departments including overseas territories
- Metropolitan France focus with smooth map interactions

#### 2. **World Countries Map** (`guessCountryMapLocation`)

- Interactive world map for learning country locations
- Click on countries to answer geography questions
- Global coverage with continent-based filtering
- Zoom and pan functionality for detailed exploration

#### 3. **🆕 Russian Cities Map** (`guessRussianCities`)

- Locate major Russian cities on an interactive map
- Covers **82 Russian cities** with populations ≥200,000
- Learn both French and Russian city names
- Geographic distribution across the vast Russian territory

#### 4. **🆕 French Chef-lieux Map** (`guessFrenchChefLieux`)

- Interactive map for learning French department capitals (chef-lieux)
- All **101 chef-lieux** including overseas territories
- Precise geographical positioning for accurate learning
- Combines administrative and geographical knowledge

### 🏛️ **Départements Français** (French Departments)

Traditional quiz modes for mastering French administrative divisions.

#### 5. **Chef-lieux Mode** (`guessChefLieu`)

- Guess department numbers from given chef-lieu (prefecture) names
- Click on department numbers from the interactive list
- Comprehensive coverage of all 101 French departments

#### 6. **Department Names Mode** (`guessDepartmentName`)

- Guess department numbers from department names
- Learn the numerical codes (01-95, 2A, 2B, plus overseas codes)
- Interactive numbered list with real-time feedback

#### 7. **Combined Mode** (`guessBoth`)

- Advanced mode alternating between chef-lieu and department name questions
- Sophisticated partial scoring system with color-coded feedback:
  - **Green**: Both chef-lieu and department name correct
  - **Orange**: Partial credit (either name or chef-lieu correct)
  - **Gray**: Not yet attempted
- Progressive difficulty testing comprehensive knowledge

### 🏁 **Drapeaux du Monde** (World Flags)

Comprehensive flag learning system with continent-based organization.

#### 8. **Flag Recognition Modes** (`guessFlags`)

**Standard Mode (Flag → Country)**

- View a flag and type the country name in French
- Advanced fuzzy string matching for accents and minor typos
- Smart hint system after 3 incorrect attempts
- Covers **195 world countries** across all continents

**Reverse Mode (Country → Flag)**

- See a country name and click on the correct flag
- Visual flag selection from organized thumbnails
- Continent-based organization for structured learning

**Continent Selection System**

- Filter by specific continents: Europe (46 countries), Asie (47), Afrique (53), Amérique du Nord (23), Amérique du Sud (12), Océanie (14)
- "Tous les continents" option for comprehensive testing
- Dynamic country counts and adaptive difficulty

## Technical Features

### **Progress Tracking & Scoring**

- Real-time score counter across all game modes
- Accuracy percentage calculation (correct guesses / total attempts)
- Progress indicators showing current question position
- Completion messages with performance summaries
- Persistent score tracking during game sessions

### **Interactive Maps & Visualization**

- **Leaflet.js** integration with Vue-Leaflet for smooth map interactions
- **CartoDB light tiles** for clean, label-free map backgrounds
- **GeoJSON data** for precise geographical boundaries
- Zoom controls, pan functionality, and map centering buttons
- Color-coded visual feedback system for immediate learning reinforcement
- Responsive map design adapting to different screen sizes

### **Smart Input & Matching Systems**

- **Advanced fuzzy string matching** for flag guessing modes
- Accent-tolerant input (handles é, è, ç, etc.)
- Typo forgiveness for minor spelling errors
- **Auto-focus** input fields for seamless user experience
- **Enter key support** for quick answer submission

### **User Experience Enhancements**

- **Vue Toastification** for elegant success, error, and warning notifications
- **Skip functionality** with detailed feedback and learning opportunities
- **Smooth animations** and transitions between game states
- **Responsive design** optimized for desktop and mobile devices
- **Intuitive navigation** with clear mode selection interface
- **"Nouveau" ribbons** highlighting newly added features

### **State Management & Performance**

- **Pinia stores** for robust, reactive state management
- Modular store architecture (Department, Flag, Country, Russian City, Chef-lieu stores)
- **Persistent game state** maintained during sessions
- Automatic game completion detection and restart functionality
- **Performance optimized** rendering for large datasets

### **Accessibility & Internationalization**

- **French language interface** throughout the application
- Color-coded visual feedback with high contrast ratios
- Keyboard navigation support for accessibility
- Clear instructions and contextual help for each game mode
- Semantic HTML structure for screen readers

## Technology Stack

### **Frontend Framework & Language**

- **Vue 3** with Composition API and `<script setup>` syntax
- **TypeScript** for comprehensive type safety and enhanced developer experience
- **SASS/SCSS** for advanced styling capabilities and maintainable CSS

### **State Management & UI Libraries**

- **Pinia** for reactive state management with modular store architecture
- **Vue Toastification** for elegant notification system
- **Leaflet.js** with **@vue-leaflet/vue-leaflet** for interactive map components

### **Build Tools & Development**

- **Vite** for lightning-fast development server and optimized production builds
- **Vue TSC** for TypeScript compilation and type checking
- **Prettier** for consistent code formatting
- **SASS Embedded** for advanced CSS preprocessing

### **Deployment & Hosting**

- **GitHub Pages** with automated deployment pipeline
- **gh-pages** package for seamless build and deploy process
- **Git-based workflow** with continuous integration

### **Geographic Data Sources**

- **195 world countries** with French names, English names, capitals, and continent classifications
- **101 French departments** including all overseas territories (DOM-TOM)
- **82 major Russian cities** with populations ≥200,000, including coordinates
- **101 French chef-lieux** with precise geographical coordinates
- **High-quality flag images** from flagcdn.com CDN with SVG format
- **GeoJSON boundary data** from gregoiredavid/france-geojson for accurate French department maps
- **World map data** for country boundary visualization

## Project Structure

```
src/
├── components/              # Vue components
│   ├── CountryMapGuessing.vue        # Interactive world map for country guessing
│   ├── DepartmentList.vue            # Clickable department numbers (01-95, 2A, 2B, etc.)
│   ├── FlagGuessing.vue              # Flag recognition modes (standard & reverse)
│   ├── FrenchChefLieuGuessing.vue    # Chef-lieux map guessing component
│   ├── FrenchDepartmentGuessing.vue  # French departments map guessing
│   ├── GuessingArea.vue              # Main game interface for text-based modes
│   ├── RussianCityGuessing.vue       # Russian cities map guessing component
│   ├── SkipButton.vue                # Skip functionality with feedback
│   └── SkipToast.vue                 # Custom toast notification component
├── data/                    # Static geographic data
│   ├── countries.ts                  # 195 world countries with metadata
│   ├── departments.ts                # 101 French departments with chef-lieux
│   ├── frenchChefLieux.ts           # Chef-lieux with geographical coordinates
│   └── russianCities.ts             # 82 major Russian cities with coordinates
├── pages/                   # Main page components
│   ├── GamePage.vue                  # Game interface layout and component routing
│   └── HomePage.vue                  # Mode selection interface with categories
├── store/                   # Pinia state management
│   ├── baseGameStore.ts              # Core game logic (scoring, progress)
│   ├── countryMapStore.ts            # World map guessing state
│   ├── departmentStore.ts            # French departments state management
│   ├── flagStore.ts                  # Flag guessing modes state
│   ├── frenchChefLieuStore.ts       # Chef-lieux guessing state
│   ├── gameStoreAdapter.ts          # Unified store interface
│   ├── index.ts                      # Pinia store configuration
│   └── russianCityStore.ts          # Russian cities state management
├── types/                   # TypeScript definitions
│   └── index.ts                      # Game types, interfaces & enums
├── utils/                   # Utility functions
│   └── stringUtils.ts                # Fuzzy string matching algorithms
└── style.scss               # Global styles and CSS variables
```

## Data Coverage

### **Geographic Scope**

- **🇫🇷 France**: Complete coverage of all 101 departments (01-95, 2A, 2B, 971-988)
- **🌍 World**: 195 countries across 6 continents with comprehensive metadata
- **🇷🇺 Russia**: 82 major cities with populations ≥200,000 inhabitants
- **🏛️ Capitals**: French chef-lieux with precise geographical coordinates

### **Continent Distribution**

- **Europe**: 46 countries
- **Asia**: 47 countries
- **Africa**: 53 countries
- **North America**: 23 countries
- **South America**: 12 countries
- **Oceania**: 14 countries

## Live Demo

The application is hosted on GitHub Pages and updated automatically with each deployment.

**🔗 [Access the Geography Quiz](https://tanguyhardion.github.io/geography-guessing/)**

## Installation & Development

### **Prerequisites**

- Node.js 18+ and npm
- Modern web browser with JavaScript enabled

### **Setup Instructions**

```bash
# Clone the repository
git clone https://github.com/your-username/geography-guessing.git
cd geography-guessing

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Format code
npm run format

# Deploy to GitHub Pages
npm run deploy
```

### **Development Commands**

| Command           | Description                                   |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start Vite development server with hot reload |
| `npm run build`   | Create optimized production build             |
| `npm run preview` | Preview production build locally              |
| `npm run format`  | Format code with Prettier                     |
| `npm run deploy`  | Deploy to GitHub Pages                        |

## Contributing

This project was developed using GitHub Copilot's Agent mode with various AI models for testing purposes.

### **AI Models Used**

- **Claude Sonnet 4** - Primary development assistant
- **Claude 3.7 Sonnet** - Was secondary until the release of Sonnet 4
- **Gemini 2.5 Pro** - Was secondary until the release of Sonnet 4
- **GPT-4.1** - Tertiary

---

## Credits

**Created with ❤️ by [Tanguy Hardion](https://linkedin.com/in/tanguy-hardion)**

_Enhancing geography education through interactive technology and thoughtful user experience design._
