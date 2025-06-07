export interface Department {
  id: string; // e.g., '01', '2A', '971'
  name: string;
  chefLieu: string;
}

export interface Country {
  id: string; // ISO code e.g., 'fr', 'us'
  name: string; // Name in French
  nameEn: string; // Name in English for API calls
  continent: string; // Continent e.g., 'Europe', 'Asie'
}

export type GameMode =
  | "guessChefLieu"
  | "guessDepartmentName"
  | "guessBoth"
  | "guessFlags"
  | "guessMapLocation"
  | "guessCountryMapLocation";

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
