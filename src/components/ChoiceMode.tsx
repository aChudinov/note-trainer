import { useMemo, useState } from 'react';
import { LETTERS, noteName, shuffle, type Letter } from '../music';
import a from './answers.module.css';

interface ChoiceModeProps {
  midi: number;
  answered: boolean;
  onAnswer: (ok: boolean) => void;
}

export function ChoiceMode({ midi, answered, onAnswer }: ChoiceModeProps) {
  const correct = noteName(midi);
  const options = useMemo<Letter[]>(() => {
    const others = shuffle(LETTERS.filter((l) => l !== correct)).slice(0, 3);
    return shuffle([correct, ...others]);
    // regenerate whenever the note changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [midi]);
  const [picked, setPicked] = useState<Letter | null>(null);

  return (
    <div className={a.choices}>
      {options.map((l) => {
        const cls = [a.choice];
        if (answered && l === correct) cls.push(a.correct);
        if (answered && picked === l && l !== correct) cls.push(a.wrong);
        return (
          <button
            key={l}
            className={cls.join(' ')}
            disabled={answered}
            onClick={() => {
              if (answered) return;
              setPicked(l);
              onAnswer(l === correct);
            }}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
