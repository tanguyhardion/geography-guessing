export interface Department {
  id: string; // e.g., '01', '2A', '971'
  name: string;
  chefLieu: string;
}

export interface GeoEntity {
  id: string; // Natural Earth ADM0_A3 code (mostly ISO 3166-1 alpha-3), e.g. 'FRA'
  idAlpha2: string; // ISO 3166-1 alpha-2 code e.g., 'FR', used for flag images
  name: string; // Name in French
  nameEn: string; // Name in English (accepted as an answer too)
  continent: Continent;
  capital: string; // Capital city name in French
  capitalEn: string; // Capital city name in English (accepted as an answer too)
}

export type SovereignState = GeoEntity;
export type Country = GeoEntity;

export interface RussianCity {
  id: string;
  name: string; // City name in French
  nameRu: string; // City name in Russian
  population: number;
  lat: number;
  lng: number;
}

export interface FrenchChefLieu {
  id: string; // Department ID e.g., '01', '2A', '971'
  name: string;
  lat: number;
  lng: number;
}

export interface RussianOblast {
  id: string; // ISO 3166-2 code, e.g. 'RU-AL'
  name: string; // Name in English
  nameRu?: string; // Name in Russian
}

export type Continent =
  | "Europe"
  | "Asie"
  | "Afrique"
  | "Amérique du Nord"
  | "Amérique du Sud"
  | "Océanie";

export type ContinentFilter = Continent | "all";

/** One finished game, as stored in the local history. */
export interface GameResult {
  modeId: string;
  modeName: string;
  continent: ContinentFilter;
  completedAt: string; // ISO date
  totalTime: number; // seconds
  finalScore: number; // correct answers
  accuracy: number; // 0-100
}
