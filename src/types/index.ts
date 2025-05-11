export interface Department {
  id: string; // e.g., '01', '2A', '971'
  name: string;
  chefLieu: string;
}

export type GameMode = 'guessChefLieu' | 'guessDepartmentName';

export interface DepartmentStatus {
  [departmentId: string]: 'correct' | 'incorrect' | 'default';
}
