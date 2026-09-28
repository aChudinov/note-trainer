import { midiToFreq } from './music';

let ctx: AudioContext | null = null;

export function getCtx(): AudioContext {
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
  }
  return ctx;
}

/** Play a short, soft note so the child hears how it sounds. */
export function playNote(midi: number): void {
  try {
    const ac = getCtx();
    if (ac.state === 'suspended') void ac.resume();
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.value = midiToFreq(midi);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.28, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 1.2);
  } catch {
    /* ignore audio errors */
  }
}

/** Cheerful "tadaa" fanfare — a rising major arpeggio with a final sparkle chord. */
export function playSuccess(): void {
  try {
    const ac = getCtx();
    if (ac.state === 'suspended') void ac.resume();
    const t0 = ac.currentTime;

    const blip = (midi: number, at: number, dur: number, peak: number, type: OscillatorType) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = type;
      o.frequency.value = midiToFreq(midi);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(peak, at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g);
      g.connect(ac.destination);
      o.start(at);
      o.stop(at + dur + 0.05);
    };

    // rising arpeggio C5 E5 G5 C6
    const arp = [72, 76, 79, 84];
    arp.forEach((m, i) => blip(m, t0 + i * 0.085, 0.45, 0.24, 'triangle'));

    // final sparkle chord on top
    const tc = t0 + arp.length * 0.085;
    [84, 88, 91].forEach((m) => blip(m, tc, 0.8, 0.16, 'sine'));
  } catch {
    /* ignore audio errors */
  }
}

/**
 * Autocorrelation pitch detection (McLeod-style prefiltering + parabolic interpolation).
 * Returns frequency in Hz, or -1 when no confident pitch is found.
 */
export function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  let SIZE = buf.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.012) return -1; // too quiet

  let r1 = 0;
  let r2 = SIZE - 1;
  const thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < thres) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < thres) {
      r2 = SIZE - i;
      break;
    }
  }

  const b = buf.slice(r1, r2);
  SIZE = b.length;
  if (SIZE < 8) return -1;

  const c = new Array<number>(SIZE).fill(0);
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE - i; j++) c[i] += b[j] * b[j + i];
  }

  let d = 0;
  while (d < SIZE - 1 && c[d] > c[d + 1]) d++;

  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < SIZE; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  let T0 = maxpos;
  if (T0 <= 0) return -1;

  const x1 = c[T0 - 1] ?? 0;
  const x2 = c[T0];
  const x3 = c[T0 + 1] ?? 0;
  const a = (x1 + x3 - 2 * x2) / 2;
  const bb = (x3 - x1) / 2;
  if (a) T0 = T0 - bb / (2 * a);

  const freq = sampleRate / T0;
  if (freq < 70 || freq > 1400) return -1; // piano-ish sanity window
  return freq;
}
