import { useCallback, useEffect, useRef, useState } from 'react';
import type { Settings } from '../App';
import {
  noteLabel,
  noteName,
  pickClef,
  pickNote,
  shuffle,
  type Clef,
  type ClefChoice,
  type Mode,
} from '../music';
import { playNote, playSuccess } from '../audio';
import { fireConfetti } from '../confetti';
import { recordAnswer } from '../stats';
import { useT } from '../i18n';
import { Staff } from './Staff';
import { ChoiceMode } from './ChoiceMode';
import { WriteMode } from './WriteMode';
import { PlayMode } from './PlayMode';
import { SuccessBurst } from './SuccessBurst';
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
  const t = useT();
  const [q, setQ] = useState<Question>(() => {
    const clef = pickClef(clefChoice);
    return { midi: pickNote(clef, null), clef };
  });
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 });
  const [celebrate, setCelebrate] = useState(0);
  const prevMidi = useRef<number>(q.midi);
  const answeredRef = useRef(false);
  const streakRef = useRef(0);

  const modeTitle = mode === 1 ? t.mode1Title : mode === 2 ? t.mode2Title : t.mode3Title;
  const prompt = mode === 1 ? t.promptMode1 : mode === 2 ? t.promptMode2 : t.promptMode3;

  const nextQuestion = useCallback(() => {
    const clef = pickClef(clefChoice);
    const midi = pickNote(clef, prevMidi.current);
    prevMidi.current = midi;
    answeredRef.current = false;
    setQ({ midi, clef });
    setAnswered(false);
    setFeedback(null);
  }, [clefChoice]);

  const onAnswer = useCallback(
    (ok: boolean) => {
      if (answeredRef.current) return;
      answeredRef.current = true;

      const newStreak = ok ? streakRef.current + 1 : 0;
      streakRef.current = newStreak;
      recordAnswer({ letter: noteName(q.midi), mode, ok, streak: newStreak });

      setScore((sc) => ({
        correct: sc.correct + (ok ? 1 : 0),
        total: sc.total + 1,
        streak: newStreak,
      }));

      const label = noteLabel(q.midi);
      if (ok) {
        setFeedback({ ok, text: `${shuffle(t.praise)[0]}  ${t.correctIs(label)}` });
        fireConfetti();
        setCelebrate((n) => n + 1);
        playSuccess();
      } else {
        setFeedback({ ok, text: t.almostCorrect(label) });
      }
      if (settings.autoPlay) {
        window.setTimeout(() => playNote(q.midi), ok ? 250 : 120);
      }
      setAnswered(true);
    },
    [q.midi, mode, settings.autoPlay, t],
  );

  const nextRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (answered) nextRef.current?.focus();
  }, [answered]);

  return (
    <div className={c.wrap}>
      <div className={c.topbar} style={{ marginBottom: 12 }}>
        <button className={c.ghostBtn} onClick={onBack} aria-label={t.back}>
          ‹
        </button>
        <div className={c.brand} style={{ fontSize: 16 }}>
          <span>{modeTitle}</span>
        </div>
        <button
          className={c.ghostBtn}
          onClick={() => playNote(q.midi)}
          title={t.playNote}
          aria-label={t.playNote}
        >
          🔊
        </button>
      </div>

      <div className={g.stats}>
        <div className={g.stat}>
          <div className={g.v}>{score.correct}</div>
          <div className={g.k}>{t.statCorrect}</div>
        </div>
        <div className={`${g.stat} ${g.streak}`}>
          <div className={g.v}>{score.streak}</div>
          <div className={g.k}>{t.statStreak}</div>
        </div>
        <div className={g.stat}>
          <div className={g.v}>{score.total}</div>
          <div className={g.k}>{t.statTotal}</div>
        </div>
      </div>

      <StaffCard midi={q.midi} clef={q.clef} />

      <p className={g.prompt}>{prompt}</p>

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
          autoListen={settings.autoListen}
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
            {t.next}
          </button>
        </div>
      )}

      <button
        className={c.ghostBtn}
        onClick={onToggleTheme}
        aria-label={t.toggleTheme}
        style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 40 }}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <SuccessBurst trigger={celebrate} />
    </div>
  );
}

function StaffCard({ midi, clef }: { midi: number; clef: Clef }) {
  const t = useT();
  return (
    <div className={staffCss.card}>
      <span className={staffCss.clefTag}>
        {clef === 'treble' ? t.clefTagTreble : t.clefTagBass}
      </span>
      <Staff midi={midi} clef={clef} />
    </div>
  );
}
