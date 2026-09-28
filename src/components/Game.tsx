import { useCallback, useEffect, useRef, useState } from 'react';
import type { Settings } from '../App';
import {
  noteLabel,
  pickClef,
  pickNote,
  shuffle,
  type Clef,
  type ClefChoice,
  type Mode,
} from '../music';
import { playNote } from '../audio';
import { fireConfetti } from '../confetti';
import { Staff } from './Staff';
import { ChoiceMode } from './ChoiceMode';
import { WriteMode } from './WriteMode';
import { PlayMode } from './PlayMode';
import c from './controls.module.css';
import g from './Game.module.css';
import staffCss from './Staff.module.css';

interface GameProps {
  clefChoice: ClefChoice;
  mode: Mode;
  settings: Settings;
  isDark: boolean;
  onToggleTheme: () => void;
  onBack: () => void;
}

const MODE_TITLE: Record<Mode, string> = {
  1: 'Poznej notu',
  2: 'Napiš notu',
  3: 'Zahraj notu',
};

const PRAISE = ['Super! 🎉', 'Výborně! ⭐', 'Správně! 🌟', 'Bravo! 🎶', 'Paráda! 💜', 'Jupí! 🎈'];

interface Question {
  midi: number;
  clef: Clef;
}

export function Game({
  clefChoice,
  mode,
  settings,
  isDark,
  onToggleTheme,
  onBack,
}: GameProps) {
  const [q, setQ] = useState<Question>(() => {
    const clef = pickClef(clefChoice);
    return { midi: pickNote(clef, null), clef };
  });
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 });
  const prevMidi = useRef<number>(q.midi);

  const nextQuestion = useCallback(() => {
    const clef = pickClef(clefChoice);
    const midi = pickNote(clef, prevMidi.current);
    prevMidi.current = midi;
    setQ({ midi, clef });
    setAnswered(false);
    setFeedback(null);
  }, [clefChoice]);

  const onAnswer = useCallback(
    (ok: boolean) => {
      setAnswered((already) => {
        if (already) return already;
        setScore((s) => ({
          correct: s.correct + (ok ? 1 : 0),
          total: s.total + 1,
          streak: ok ? s.streak + 1 : 0,
        }));
        if (ok) {
          setFeedback({ ok, text: `${shuffle(PRAISE)[0]}  Je to ${noteLabel(q.midi)}` });
          fireConfetti();
        } else {
          setFeedback({ ok, text: `Skoro! Správně je ${noteLabel(q.midi)}` });
        }
        if (settings.autoPlay) {
          window.setTimeout(() => playNote(q.midi), ok ? 250 : 120);
        }
        return true;
      });
    },
    [q.midi, settings.autoPlay],
  );

  // focus the Next button when it appears
  const nextRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (answered) nextRef.current?.focus();
  }, [answered]);

  return (
    <div className={c.wrap}>
      <div className={c.topbar} style={{ marginBottom: 12 }}>
        <button className={c.ghostBtn} onClick={onBack} aria-label="Zpět">
          ‹
        </button>
        <div className={c.brand} style={{ fontSize: 16 }}>
          <span>{MODE_TITLE[mode]}</span>
        </div>
        <button
          className={c.ghostBtn}
          onClick={() => playNote(q.midi)}
          title="Přehrát notu"
          aria-label="Přehrát notu"
        >
          🔊
        </button>
      </div>

      <div className={g.stats}>
        <div className={g.stat}>
          <div className={g.v}>{score.correct}</div>
          <div className={g.k}>Správně</div>
        </div>
        <div className={`${g.stat} ${g.streak}`}>
          <div className={g.v}>{score.streak}</div>
          <div className={g.k}>Série</div>
        </div>
        <div className={g.stat}>
          <div className={g.v}>{score.total}</div>
          <div className={g.k}>Celkem</div>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <StaffCard midi={q.midi} clef={q.clef} />
      </div>

      <p className={g.prompt}>
        {mode === 1
          ? 'Jaká je to nota?'
          : mode === 2
            ? 'Napiš název noty a oktávu'
            : 'Zahraj tuto notu na klavír'}
      </p>

      {mode === 1 && (
        <ChoiceMode key={q.midi} midi={q.midi} answered={answered} onAnswer={onAnswer} />
      )}
      {mode === 2 && (
        <WriteMode
          key={q.midi}
          midi={q.midi}
          clef={q.clef}
          answered={answered}
          onAnswer={onAnswer}
        />
      )}
      {mode === 3 && (
        <PlayMode
          key={q.midi}
          midi={q.midi}
          answered={answered}
          micOctave={settings.micOctave}
          onAnswer={onAnswer}
        />
      )}

      {feedback && (
        <div className={`${g.feedback} ${g.show} ${feedback.ok ? g.good : g.bad}`}>
          {feedback.text}
        </div>
      )}

      {answered && (
        <div className={c.actions}>
          <button ref={nextRef} className={`${c.btn} ${c.btnPrimary}`} onClick={nextQuestion}>
            Další nota ›
          </button>
        </div>
      )}

      {/* keep theme toggle reachable in-game too */}
      <button
        className={c.ghostBtn}
        onClick={onToggleTheme}
        aria-label="Přepnout režim"
        style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 40 }}
      >
        {isDark ? '☀️' : '🌙'}
      </button>
    </div>
  );
}

function StaffCard({ midi, clef }: { midi: number; clef: Clef }) {
  return (
    <div className={staffCss.card}>
      <span className={staffCss.clefTag}>
        {clef === 'treble' ? 'houslový klíč' : 'basový klíč'}
      </span>
      <Staff midi={midi} clef={clef} />
    </div>
  );
}
