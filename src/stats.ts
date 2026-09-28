import type { Letter, Mode } from './music';

// Persistent practice statistics (localStorage). Note keys are always the
// Czech/Latin letters (C D E F G A H), independent of UI language.

export interface Tally {
  correct: number;
  total: number;
}

export interface Stats {
  total: number;
  correct: number;
  bestStreak: number;
  perNote: Record<string, Tally>;
  perMode: Record<string, Tally>;
  days: string[]; // distinct YYYY-MM-DD practiced
  lastPlayed: string | null; // ISO timestamp
}

const KEY = 'noty-stats-v1';

export function emptyStats(): Stats {
  return {
    total: 0,
    correct: 0,
    bestStreak: 0,
    perNote: {},
    perMode: {},
    days: [],
    lastPlayed: null,
  };
}

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyStats();
    const parsed = JSON.parse(raw) as Partial<Stats>;
    return { ...emptyStats(), ...parsed };
  } catch {
    return emptyStats();
  }
}

function save(stats: Stats): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(stats));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export interface AnswerEntry {
  letter: Letter;
  mode: Mode;
  ok: boolean;
  streak: number;
}

/** Record one answered question and persist. Returns the updated stats. */
export function recordAnswer(entry: AnswerEntry): Stats {
  const s = loadStats();
  s.total += 1;
  if (entry.ok) s.correct += 1;
  s.bestStreak = Math.max(s.bestStreak, entry.streak);

  const note = (s.perNote[entry.letter] ??= { correct: 0, total: 0 });
  note.total += 1;
  if (entry.ok) note.correct += 1;

  const mode = (s.perMode[String(entry.mode)] ??= { correct: 0, total: 0 });
  mode.total += 1;
  if (entry.ok) mode.correct += 1;

  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  if (!s.days.includes(day)) s.days.push(day);
  s.lastPlayed = now.toISOString();

  save(s);
  return s;
}

export function resetStats(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export const accuracy = (t: Tally | undefined): number =>
  t && t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
