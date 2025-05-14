# Geography Quiz

A simple Vue.js application with two game modes:

1. Guess French departments or their chef-lieux
2. Guess world countries based on their flags

Generated using GitHub Copilot's Agent mode with Gemini 2.5 Pro & Claude 3.7 Sonnet.

## Features

### French Departments Quiz

- Three difficulty levels: guess chef-lieux, guess department names, or both
- Visual feedback with color-coded results
- Track your progress as you go through all 101 French departments

### World Flags Quiz

- Test your knowledge of countries by identifying flags
- Type in answers (in French) with fuzzy matching for accents and minor typos
- Uses [flagcdn.com](https://flagcdn.com) for high-quality flag images
- Covers 40 countries from around the world

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
