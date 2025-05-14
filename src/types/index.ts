export interface Department {
  id: string; // e.g., '01', '2A', '971'
  name: string;
  chefLieu: string;
}

export interface Country {
  id: string; // ISO code e.g., 'fr', 'us'
  name: string; // Name in French
  nameEn: string; // Name in English for API calls
}

export type GameMode =
  | "guessChefLieu"
  | "guessDepartmentName"
  | "guessBoth"
  | "guessFlags";

export interface DepartmentStatus {
  [departmentId: string]:
    | "correctChefLieu"
    | "correctName"
    | "correctBoth"
    | "incorrect"
    | "default";
}

export interface CountryStatus {
  [countryId: string]: "correct" | "incorrect" | "default";
}
