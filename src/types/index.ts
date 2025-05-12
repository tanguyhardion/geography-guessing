export interface Department {
  id: string; // e.g., '01', '2A', '971'
  name: string;
  chefLieu: string;
}

export type GameMode = "guessChefLieu" | "guessDepartmentName" | "guessBoth";

export interface DepartmentStatus {
  [departmentId: string]:
    | "correctChefLieu"
    | "correctName"
    | "correctBoth"
    | "incorrect"
    | "default";
}
