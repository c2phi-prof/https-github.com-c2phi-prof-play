export interface Proposition {
  id: string; // e.g., "1", "1.1", "2.0121"
  textFr: string;
}

export interface Nom {
  id: string; // unique ID
  text: string; // the grouped words text (e.g., "la totalité des faits")
  propId: string; // proposition ID from which it is created
  wordIndices: number[]; // indices of words included in the group
  colorIndex?: number; // assigned pastel color index (0-4)
  description?: string; // custom explanatory sentences/notes
}

export interface Link {
  id: string;
  sourceNomId: string;
  targetNomId: string;
  relationType: string; // e.g., "Isomorphisme", "Exclusion", "Projection", "Dépendance"
  description?: string;
  // Let's also support loose types if needed
  sourceId?: string;
  targetId?: string;
  label?: string;
}

export interface SemanticLayer {
  id: string;
  name: string;
  description: string;
  noms: Nom[];
  links: any[];
  validatedParagraphIds: string[];
  pastilleGuesses: { [propId: string]: number[] };
  nomGuesses: { [nomId: string]: number };
}

export interface TractatusGameState {
  noms: Nom[];
  links: Link[];
  validatedParagraphIds: string[];
  nomGuesses: { [nomId: string]: number };
  activeThemeId?: string;
  activeMode?: string;
}
