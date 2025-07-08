export interface Department {
  id: string; // e.g., '01', '2A', '971'
  name: string;
  chefLieu: string;
}

export interface GeoEntity {
  id: string; // ISO 3166-1 alpha-3 code e.g., 'FRA', 'USA'
  idAlpha2: string; // ISO 3166-1 alpha-2 code e.g., 'FR', 'US'
  name: string; // Name in French
  nameEn: string; // Name in English for API calls
  continent: string; // Continent e.g., 'Europe', 'Asie'
  capital: string; // Capital city name
  capitalEn: string; // Capital city name in English for API calls
}

export interface SovereignState extends GeoEntity {}

export interface Country extends GeoEntity {}

export interface RussianCity {
  id: string; // ISO 3166-1 alpha-3 code (e.g., 'FRA', 'USA')
  name: string; // City name in French
  nameRu: string; // City name in Russian
  population: number; // Population
  lat: number; // Latitude
  lng: number; // Longitude
}

export interface FrenchChefLieu {
  id: string; // Department ID e.g., '01', '2A', '971'
  name: string; // Chef-lieu name
  lat: number; // Latitude
  lng: number; // Longitude
}

export interface RussianOblast {
  id: string; // Oblast ID (e.g., 'RUAL', 'RUPSK')
  name: string; // Oblast name in English
  nameRu?: string; // Oblast name in Russian (if available)
}

export type GameMode =
  | "guessChefLieu"
  | "guessDepartmentName"
  | "guessBoth"
  | "guessFlags"
  | "guessMapLocation"
  | "guessCountryMapLocation"
  | "guessRussianCities"
  | "guessRussianOblasts"
  | "guessFrenchChefLieux"
  | "guessWorldCapitals"
  | "guessCountryFromCapital";

export type Continent =
  | "Europe"
  | "Asie"
  | "Afrique"
  | "Amérique du Nord"
  | "Amérique du Sud"
  | "Océanie";

export interface DepartmentStatus {
  [departmentId: string]:
    | "correctChefLieu"
    | "correctName"
    | "correctBoth"
    | "default";
}

export interface CountryStatus {
  [countryId: string]: "correct" | "default";
}

export interface RussianCityStatus {
  [cityId: string]: "correct" | "default";
}

export interface FrenchChefLieuStatus {
  [chefLieuId: string]: "correct" | "default";
}

export interface RussianOblastStatus {
  [oblastId: string]: "correct" | "default";
}
