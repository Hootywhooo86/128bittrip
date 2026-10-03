/**
 * Traveler levels. Level n → n+1 costs 100 × n XP, so early levels come
 * fast (first trip ≈ level 3) and later ones take real travelling.
 */

const TITLES: { from: number; title: string }[] = [
  { from: 1, title: 'Wanderer' },
  { from: 3, title: 'Backpacker' },
  { from: 5, title: 'Voyager' },
  { from: 8, title: 'Globetrotter' },
  { from: 12, title: 'Jetsetter' },
  { from: 17, title: 'Legend' },
];

/** Total XP needed to reach `level` (level 1 = 0 XP). */
export function xpForLevel(level: number): number {
  return (100 * (level - 1) * level) / 2;
}

export interface LevelInfo {
  level: number;
  title: string;
  /** XP earned inside the current level. */
  into: number;
  /** XP the current level takes in total. */
  span: number;
}

export function levelInfo(xp: number): LevelInfo {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  const base = xpForLevel(level);
  const title = [...TITLES].reverse().find((t) => level >= t.from)!.title;
  return { level, title, into: xp - base, span: xpForLevel(level + 1) - base };
}
