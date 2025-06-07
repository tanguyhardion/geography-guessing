# Geography Quiz

A comprehensive Vue.js geography learning application featuring multiple game modes to test your knowledge of French departments and world countries.

Generated using GitHub Copilot's Agent mode with various AI models, including:

- Gemini 2.5 Pro
- Claude 3.7 Sonnet
- GPT-4.1
- Claude Sonnet 4, so far the best model for this project.

## Features

### French Departments Quiz

The application offers **5 different game modes** for learning French departments:

#### 1. **Chef-lieux Mode** (`guessChefLieu`)

- Guess which department number corresponds to a given chef-lieu (prefecture)
- Click on the department number from the interactive list
- Covers all 101 French departments including overseas territories

#### 2. **Department Names Mode** (`guessDepartmentName`)

- Guess which department number corresponds to a given department name
- Click on the department number from the interactive list
- Learn the numerical codes for all French departments

#### 3. **Combined Mode** (`guessBoth`)

- Advanced mode alternating between chef-lieu and department name questions
- Partial scoring system with color-coded feedback:
  - **Green**: Both chef-lieu and department name guessed correctly
  - **Blue**: One part correct (either name or chef-lieu)
  - **Gray**: Not yet attempted
- Progressive difficulty that tests comprehensive knowledge

#### 4. **Interactive Map Mode** (`guessMapLocation`)

- Click directly on departments on an interactive map of France
- Visual learning with real geographical context
- Uses Leaflet.js with CartoDB tiles for smooth map interaction
- Metropolitan France only (excludes overseas territories for map clarity)
- Color-coded visual feedback on the map

#### 5. **Department List Navigation**

- Clickable numbered list (01-95, 2A, 2B, plus overseas codes)
- Real-time status updates with visual indicators
- Prevents re-clicking completed departments

### World Flags Quiz

Comprehensive flag learning system with **2 game modes**:

#### 1. **Standard Flag Mode** (Flag → Country)

- View a flag and type the country name in French
- Fuzzy string matching for accents and minor typos
- Hint system after 3 incorrect attempts (shows first letter)
- Covers countries from all continents

#### 2. **Reverse Flag Mode** (Country → Flag)

- See a country name and click on the correct flag
- Side panel with flag thumbnails for visual selection
- Organized by continent for better learning context

#### **Continent Selection**

- Filter countries by continent: Europe, Asie, Afrique, Amérique du Nord, Amérique du Sud, Océanie
- "All Continents" option for comprehensive testing
- Dynamic country count based on selected continent

#### **Flag Resources**

- High-quality SVG flags from [flagcdn.com](https://flagcdn.com)
- Responsive flag display with proper aspect ratios
- Comprehensive coverage of **195 world countries**

### Technical Features

#### **Progress Tracking & Scoring**

- Real-time score counter
- Accuracy percentage calculation (correct guesses / total guesses)
- Progress indicators showing current question number
- Completion messages with celebration

#### **User Experience**

- **Toast Notifications**: Success, error, warning, and info messages using Vue Toastification
- **Skip Functionality**: Skip difficult questions with detailed feedback
- **Auto-focus**: Input fields automatically focused for seamless typing
- **Responsive Design**: Works on desktop and mobile devices
- **Smooth Transitions**: Fade animations between game states

#### **State Management**

- Pinia store for robust state management
- Persistent game state during sessions
- Automatic game completion detection
- Clean restart functionality

#### **Accessibility & UX**

- Color-coded visual feedback throughout
- Keyboard navigation support (Enter to submit)
- Clear instructions for each game mode
- Intuitive navigation between modes

## Technology Stack

### **Frontend Framework**

- **Vue 3** with Composition API and `<script setup>` syntax
- **TypeScript** for type safety and better development experience
- **SASS/SCSS** for advanced styling capabilities

### **State Management & UI**

- **Pinia** for reactive state management
- **Vue Toastification** for elegant notification system
- **Leaflet.js** with Vue-Leaflet integration for interactive maps

### **Build & Development Tools**

- **Vite** for fast development and optimized builds
- **Vue TSC** for TypeScript compilation
- **Prettier** for code formatting
- **GitHub Pages** for automatic deployment

### **Geographic Data & APIs**

- **195 countries** with French names and continent classifications
- **101 French departments** including overseas territories
- **Flag images** from flagcdn.com CDN
- **GeoJSON data** for interactive France map from gregoiredavid/france-geojson

## Project Structure

```
src/
├── components/           # Vue components
│   ├── DepartmentList.vue     # Clickable department numbers
│   ├── FlagGuessing.vue       # Flag game modes
│   ├── GuessingArea.vue       # Main game interface
│   ├── MapGuessing.vue        # Interactive map component
│   ├── SkipButton.vue         # Skip functionality
│   └── SkipToast.vue          # Custom toast component
├── data/                # Static data
│   ├── countries.ts           # 195 countries with metadata
│   └── departments.ts         # 101 French departments
├── pages/               # Page components
│   ├── GamePage.vue           # Game interface layout
│   └── HomePage.vue           # Mode selection
├── store/               # Pinia state management
│   ├── gameStore.ts           # Main game logic & state
│   └── index.ts               # Store configuration
├── types/               # TypeScript definitions
│   └── index.ts               # Game types & interfaces
├── utils/               # Utility functions
│   └── stringUtils.ts         # Fuzzy string matching
└── style.scss           # Global styles
```

## GitHub Pages

The application is hosted on GitHub Pages. You can access it [here](https://tanguyhardion.github.io/geography-guessing/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
