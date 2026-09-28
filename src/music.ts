// Music model — Czech note naming: C D E F G A H (H = English B natural, B = B flat).
// Octave numbers follow the Czech tradition: middle C = C1 (jednočárkovaná oktáva),
// the octave above = C2, the small octave below = C0.

export type Clef = 'treble' | 'bass';
export type ClefChoice = Clef | 'both';
export type Mode = 1 | 2 | 3;

const PC_NAME: Record<number, string> = {
  0: 'C',
  2: 'D',
  4: 'E',
  5: 'F',
  7: 'G',
  9: 'A',
  11: 'H',
};

const PC_DIATONIC: Record<number, number> = {
  0: 0,
  2: 1,
  4: 2,
  5: 3,
  7: 4,
  9: 5,
  11: 6,
};

export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'H'] as const;
export type Letter = (typeof LETTERS)[number];

export const pc = (m: number): number => ((m % 12) + 12) % 12;
export const isNatural = (m: number): boolean => PC_NAME[pc(m)] !== undefined;
export const appOctave = (m: number): number => Math.floor(m / 12) - 4; // 60 -> 1 (middle C)
export const noteName = (m: number): Letter => PC_NAME[pc(m)] as Letter;
export const noteLabel = (m: number): string => noteName(m) + appOctave(m);
export const midiToFreq = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);
export const freqToMidi = (f: number): number => Math.round(69 + 12 * Math.log2(f / 440));

/** Absolute diatonic step index (used for vertical placement on the staff). */
export function diatonicIndex(m: number): number {
  const sciOctave = Math.floor(m / 12) - 1;
  return sciOctave * 7 + PC_DIATONIC[pc(m)];
}

/** Beginner ranges, naturals only. */
export function rangeFor(clef: Clef): number[] {
  const [lo, hi] = clef === 'bass' ? [48, 60] : [60, 81];
  const out: number[] = [];
  for (let m = lo; m <= hi; m++) if (isNatural(m)) out.push(m);
  return out;
}

export function octavesFor(clef: Clef): number[] {
  const set = new Set(rangeFor(clef).map(appOctave));
  return [...set].sort((a, b) => a - b);
}

export function pickClef(choice: ClefChoice): Clef {
  if (choice === 'both') return Math.random() < 0.5 ? 'treble' : 'bass';
  return choice;
}

/** Pick a random note from the clef's pool, avoiding an immediate repeat. */
export function pickNote(clef: Clef, avoid: number | null): number {
  const pool = rangeFor(clef);
  let m: number;
  do {
    m = pool[Math.floor(Math.random() * pool.length)];
  } while (avoid !== null && m === avoid && pool.length > 1);
  return m;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
