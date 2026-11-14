// Every game mode is described here as data. The engine (store/game.ts) and
// the boards (components/boards) are generic: adding a mode means adding an
// entry to MODES, not a new store/composable/component.
import { departments } from "../data/departments";
import { frenchChefLieux } from "../data/frenchChefLieux";
import { countries } from "../data/countries";
import { sovereignStates } from "../data/sovereignStates";
import { russianCities } from "../data/russianCities";
import { russianOblasts } from "../data/russianOblasts";
import type { Continent, ContinentFilter, GeoEntity } from "../types";

export const CONTINENTS: Continent[] = [
  "Afrique",
  "Amérique du Nord",
  "Amérique du Sud",
  "Asie",
  "Europe",
  "Océanie",
];

export function parseContinent(value: unknown): ContinentFilter {
  return CONTINENTS.includes(value as Continent) ? (value as Continent) : "all";
}

/** One thing to find. A game is over when every question has been answered. */
export interface Question {
  key: string;
  /** Id of the choice to click, or of the entity being named. */
  targetId: string;
  instruction: string;
  prompt: string;
  /** Prompt in the mode's alternate language, when it has one. */
  promptAlt?: string;
  /** Show this flag (ISO alpha-2) instead of the prompt text. */
  flagCode?: string;
  /** Accepted typed answers (text boards only). */
  answers?: string[];
  /** "Le pays" / "La capitale": used for the first-letter hint. */
  answerNoun?: string;
  /** Limits the visible choices (flag grid: same continent only). */
  group?: string;
}

/** Something the player can click: a region, a marker, a flag, a number. */
export interface Choice {
  id: string;
  label: string;
  labelAlt?: string;
  flagCode?: string;
  group?: string;
  lat?: number;
  lng?: number;
}

export type LatLngBounds = [[number, number], [number, number]];

export interface MapConfig {
  kind: "regions" | "points";
  /** GeoJSON source for "regions" maps. */
  geoUrl?: string;
  /** GeoJSON drawn behind the markers of a "points" map (not clickable). */
  backdropUrl?: string;
  /** Feature property holding the choice id. */
  featureKey?: string;
  bounds: (continent: ContinentFilter) => LatLngBounds;
}

export type BoardKind = "map" | "text" | "flags" | "numbers";
export type CategoryId = "maps" | "departments" | "world";

export interface ModeDef {
  id: string;
  category: CategoryId;
  title: string;
  blurb: string;
  /** Plural noun for what is being found: "départements", "pays"… */
  unit: string;
  /** Name stored with results. Kept stable so past stats stay comparable. */
  logName: string;
  board: BoardKind;
  /** Whether the player picks a continent before starting. */
  continents?: boolean;
  altLang?: { base: string; alt: string; defaultAlt: boolean };
  map?: MapConfig;
  completion: string;
  build: (continent: ContinentFilter) => {
    questions: Question[];
    choices: Choice[];
  };
}

export const CATEGORIES: { id: CategoryId; title: string; blurb: string }[] = [
  {
    id: "maps",
    title: "Cartes interactives",
    blurb: "Retrouve chaque lieu directement sur la carte.",
  },
  {
    id: "world",
    title: "Pays du monde",
    blurb: "Drapeaux et capitales des États souverains.",
  },
  {
    id: "departments",
    title: "Départements français",
    blurb: "Associe chaque département à son numéro.",
  },
];

// ---------------------------------------------------------------------------
// Helpers

const DEPARTMENTS_GEOJSON =
  "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson";
const OBLASTS_GEOJSON = `${import.meta.env.BASE_URL}oblasts.json`;

const FRANCE_BOUNDS: LatLngBounds = [
  [41.2, -5.3],
  [51.2, 9.7],
];
const RUSSIA_BOUNDS: LatLngBounds = [
  [41, 20],
  [77, 180],
];
const WORLD_BOUNDS: Record<ContinentFilter, LatLngBounds> = {
  all: [
    [-55, -160],
    [75, 175],
  ],
  Europe: [
    [34, -25],
    [71, 45],
  ],
  Asie: [
    [-11, 25],
    [56, 150],
  ],
  Afrique: [
    [-36, -20],
    [38, 53],
  ],
  "Amérique du Nord": [
    [5, -170],
    [75, -50],
  ],
  "Amérique du Sud": [
    [-56, -82],
    [13, -34],
  ],
  Océanie: [
    [-48, 110],
    [5, 180],
  ],
};

// Overseas departments are not on the simplified metropolitan map.
const metropolitanDepartments = departments.filter(
  (d) => !d.id.startsWith("97"),
);
const metropolitanChefLieux = frenchChefLieux.filter(
  (c) => !c.id.startsWith("97"),
);

function byContinent<T extends GeoEntity>(
  list: T[],
  continent: ContinentFilter,
): T[] {
  return continent === "all"
    ? list
    : list.filter((entity) => entity.continent === continent);
}

const departmentChoices: Choice[] = departments.map((d) => ({
  id: d.id,
  label: `${d.id} (${d.name})`,
}));

const fromDepartmentName = (): Question[] =>
  departments.map((d) => ({
    key: `${d.id}:name`,
    targetId: d.id,
    instruction: "Quel est le numéro de ce département ?",
    prompt: d.name,
  }));

const fromChefLieu = (): Question[] =>
  departments.map((d) => ({
    key: `${d.id}:chef-lieu`,
    targetId: d.id,
    instruction: "Quel est le numéro du département de ce chef-lieu ?",
    prompt: d.chefLieu,
  }));

// ---------------------------------------------------------------------------
// Modes

export const MODES: ModeDef[] = [
  {
    id: "carte-departements",
    category: "maps",
    title: "Départements français",
    blurb: "Les 96 départements de métropole.",
    unit: "départements",
    logName: "Départements français (carte)",
    board: "map",
    map: {
      kind: "regions",
      geoUrl: DEPARTMENTS_GEOJSON,
      featureKey: "code",
      bounds: () => FRANCE_BOUNDS,
    },
    completion: "Tu as localisé tous les départements !",
    build: () => ({
      questions: metropolitanDepartments.map((d) => ({
        key: d.id,
        targetId: d.id,
        instruction: "Trouve ce département sur la carte",
        prompt: d.name,
      })),
      choices: metropolitanDepartments.map((d) => ({
        id: d.id,
        label: d.name,
      })),
    }),
  },
  {
    id: "carte-chefs-lieux",
    category: "maps",
    title: "Chefs-lieux français",
    blurb: "Les préfectures de métropole, ville par ville.",
    unit: "chefs-lieux",
    logName: "Chef-lieux français (carte)",
    board: "map",
    map: {
      kind: "points",
      backdropUrl: DEPARTMENTS_GEOJSON,
      bounds: () => FRANCE_BOUNDS,
    },
    completion: "Tu as trouvé tous les chefs-lieux !",
    build: () => ({
      questions: metropolitanChefLieux.map((c) => ({
        key: c.id,
        targetId: c.id,
        instruction: "Trouve ce chef-lieu sur la carte",
        prompt: c.name,
      })),
      choices: metropolitanChefLieux.map((c) => ({
        id: c.id,
        label: c.name,
        lat: c.lat,
        lng: c.lng,
      })),
    }),
  },
  {
    id: "carte-pays",
    category: "maps",
    title: "Pays du monde",
    blurb: "Le planisphère entier ou un seul continent.",
    unit: "pays",
    logName: "Pays du monde (carte)",
    board: "map",
    continents: true,
    map: {
      kind: "regions",
      geoUrl:
        "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson",
      featureKey: "ADM0_A3",
      bounds: (continent) => WORLD_BOUNDS[continent],
    },
    completion: "Tu as localisé tous les pays !",
    build: (continent) => {
      const pool = byContinent(countries, continent);
      return {
        questions: pool.map((c) => ({
          key: c.id,
          targetId: c.id,
          instruction: "Trouve ce pays sur la carte",
          prompt: c.name,
        })),
        choices: pool.map((c) => ({ id: c.id, label: c.name })),
      };
    },
  },
  {
    id: "carte-villes-russie",
    category: "maps",
    title: "Villes de Russie",
    blurb: "Les villes de plus de 200 000 habitants.",
    unit: "villes",
    logName: "Villes de Russie (carte)",
    board: "map",
    altLang: { base: "Français", alt: "Русский", defaultAlt: false },
    map: {
      kind: "points",
      backdropUrl: OBLASTS_GEOJSON,
      bounds: () => RUSSIA_BOUNDS,
    },
    completion: "Tu as localisé toutes les villes !",
    build: () => ({
      questions: russianCities.map((c) => ({
        key: c.id,
        targetId: c.id,
        instruction: "Trouve cette ville sur la carte",
        prompt: c.name,
        promptAlt: c.nameRu,
      })),
      choices: russianCities.map((c) => ({
        id: c.id,
        label: c.name,
        labelAlt: c.nameRu,
        lat: c.lat,
        lng: c.lng,
      })),
    }),
  },
  {
    id: "carte-oblasts-russie",
    category: "maps",
    title: "Oblasts de Russie",
    blurb: "Les sujets fédéraux, en russe ou en anglais.",
    unit: "régions",
    logName: "Oblasts de Russie (carte)",
    board: "map",
    altLang: { base: "English", alt: "Русский", defaultAlt: true },
    map: {
      kind: "regions",
      geoUrl: OBLASTS_GEOJSON,
      featureKey: "iso",
      bounds: () => RUSSIA_BOUNDS,
    },
    completion: "Tu as localisé toutes les régions !",
    build: () => ({
      questions: russianOblasts.map((o) => ({
        key: o.id,
        targetId: o.id,
        instruction: "Trouve cette région sur la carte",
        prompt: o.name,
        promptAlt: o.nameRu,
      })),
      choices: russianOblasts.map((o) => ({
        id: o.id,
        label: o.name,
        labelAlt: o.nameRu,
      })),
    }),
  },
  {
    id: "drapeaux",
    category: "world",
    title: "Pays depuis le drapeau",
    blurb: "Un drapeau s'affiche : écris le nom du pays.",
    unit: "drapeaux",
    logName: "Drapeaux du monde",
    board: "text",
    continents: true,
    completion: "Tu as reconnu tous les drapeaux !",
    build: (continent) => ({
      questions: byContinent(sovereignStates, continent).map((c) => ({
        key: c.id,
        targetId: c.id,
        instruction: "À quel pays appartient ce drapeau ?",
        prompt: c.name,
        flagCode: c.idAlpha2,
        answers: [c.name, c.nameEn],
        answerNoun: "Le pays",
      })),
      choices: [],
    }),
  },
  {
    id: "drapeaux-inverse",
    category: "world",
    title: "Drapeau depuis le pays",
    blurb: "Un pays s'affiche : clique sur son drapeau.",
    unit: "pays",
    logName: "Drapeaux du monde (inverse)",
    board: "flags",
    continents: true,
    completion: "Tu as retrouvé tous les drapeaux !",
    build: (continent) => {
      const pool = byContinent(sovereignStates, continent);
      return {
        questions: pool.map((c) => ({
          key: c.id,
          targetId: c.id,
          instruction: "Clique sur le drapeau de ce pays",
          prompt: c.name,
          group: c.continent,
        })),
        choices: pool.map((c) => ({
          id: c.id,
          label: c.name,
          flagCode: c.idAlpha2,
          group: c.continent,
        })),
      };
    },
  },
  {
    id: "capitales",
    category: "world",
    title: "Pays depuis la capitale",
    blurb: "Une capitale s'affiche : écris le nom du pays.",
    unit: "capitales",
    logName: "Capitales du monde",
    board: "text",
    continents: true,
    completion: "Tu as retrouvé tous les pays !",
    build: (continent) => ({
      questions: byContinent(sovereignStates, continent).map((c) => ({
        key: c.id,
        targetId: c.id,
        instruction: "Quel pays a pour capitale…",
        prompt: c.capital,
        answers: [c.name, c.nameEn],
        answerNoun: "Le pays",
      })),
      choices: [],
    }),
  },
  {
    id: "capitales-inverse",
    category: "world",
    title: "Capitale depuis le pays",
    blurb: "Un pays s'affiche : écris le nom de sa capitale.",
    unit: "pays",
    logName: "Capitales du monde (inverse)",
    board: "text",
    continents: true,
    completion: "Tu as trouvé toutes les capitales !",
    build: (continent) => ({
      questions: byContinent(sovereignStates, continent).map((c) => ({
        key: c.id,
        targetId: c.id,
        instruction: "Quelle est la capitale de…",
        prompt: c.name,
        answers: [c.capital, c.capitalEn],
        answerNoun: "La capitale",
      })),
      choices: [],
    }),
  },
  {
    id: "numeros-chef-lieu",
    category: "departments",
    title: "Numéro depuis le chef-lieu",
    blurb: "Bourg-en-Bresse ? C'est le 01.",
    unit: "départements",
    logName: "Départements français (chef-lieu)",
    board: "numbers",
    completion: "Tu connais tous les chefs-lieux !",
    build: () => ({ questions: fromChefLieu(), choices: departmentChoices }),
  },
  {
    id: "numeros-nom",
    category: "departments",
    title: "Numéro depuis le nom",
    blurb: "Ain ? C'est le 01.",
    unit: "départements",
    logName: "Départements français (nom)",
    board: "numbers",
    completion: "Tu connais tous les numéros !",
    build: () => ({
      questions: fromDepartmentName(),
      choices: departmentChoices,
    }),
  },
  {
    id: "numeros-mixte",
    category: "departments",
    title: "Nom et chef-lieu mélangés",
    blurb: "Chaque département revient deux fois.",
    unit: "questions",
    logName: "Départements français (mixte)",
    board: "numbers",
    completion: "Noms et chefs-lieux : tout y est !",
    build: () => ({
      questions: [...fromDepartmentName(), ...fromChefLieu()],
      choices: departmentChoices,
    }),
  },
];

export function getMode(id: unknown): ModeDef | undefined {
  return MODES.find((mode) => mode.id === id);
}

export function flagUrl(alpha2: string): string {
  return `https://flagcdn.com/${alpha2.toLowerCase()}.svg`;
}
