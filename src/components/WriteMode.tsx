import { useEffect, useState } from 'react';
import {
  LETTERS,
  appOctave,
  noteName,
  octavesFor,
  type Clef,
  type Letter,
} from '../music';
import a from './answers.module.css';
import c from './controls.module.css';

interface WriteModeProps {
  midi: number;
  clef: Clef;
  answered: boolean;
  onAnswer: (ok: boolean) => void;
}

export function WriteMode({ midi, clef, answered, onAnswer }: WriteModeProps) {
  const [letter, setLetter] = useState<Letter | null>(null);
  const [oct, setOct] = useState<number | null>(null);
  const octaves = octavesFor(clef);

  // reset the composer whenever a new note appears
  useEffect(() => {
    setLetter(null);
    setOct(null);
  }, [midi, clef]);

  const ready = letter !== null && oct !== null;

  const check = () => {
    if (answered || !ready) return;
    onAnswer(letter === noteName(midi) && oct === appOctave(midi));
  };

  return (
    <div>
      <div className={a.compose}>
        <span className={`${a.slot} ${letter === null ? a.empty : ''}`}>
          {letter ?? '?'}
        </span>
        <span className={`${a.slot} ${oct === null ? a.empty : ''}`}>
          {oct ?? '?'}
        </span>
      </div>

      <div className={a.keys}>
        {LETTERS.map((l) => (
          <button
            key={l}
            className={a.key}
            aria-pressed={letter === l}
            disabled={answered}
            onClick={() => setLetter(l)}
          >
            {l}
          </button>
        ))}
      </div>

      <div
        className={a.keys}
        style={{ gridTemplateColumns: `repeat(${octaves.length + 1}, 1fr)`, marginTop: 9 }}
      >
        {octaves.map((o) => (
          <button
            key={o}
            className={`${a.key} ${a.oct}`}
            aria-pressed={oct === o}
            disabled={answered}
            onClick={() => setOct(o)}
          >
            {o}
          </button>
        ))}
      </div>

      <div className={c.actions}>
        <button
          className={`${c.btn} ${c.btnSoft}`}
          disabled={answered}
          onClick={() => {
            setLetter(null);
            setOct(null);
          }}
        >
          Smazat
        </button>
        <button
          className={`${c.btn} ${c.btnPrimary}`}
          disabled={answered || !ready}
          onClick={check}
        >
          Zkontrolovat
        </button>
      </div>
    </div>
  );
}
