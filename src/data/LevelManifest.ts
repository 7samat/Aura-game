export interface LevelEntry {
  id: string;
  name: string;
  difficulty: number;
  file: string;       // path relative to public/
}

export const LEVELS: LevelEntry[] = [
  { id: 'level-01', name: 'First Light', difficulty: 1, file: 'levels/level-01.json' },
  { id: 'level-02', name: 'Signal',      difficulty: 2, file: 'levels/level-02.json' },
  { id: 'level-03', name: 'Frequency',   difficulty: 3, file: 'levels/level-03.json' },
];
