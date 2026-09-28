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

const TIMEOUT_REVEAL_MS = 1600;

export function Game({
  clefChoice,
  mode,
  settings,
  isDark,
  onToggleTheme,
  onBack,
}: GameProps) {
  const t = useT();
  const { sessionLength, perNoteSeconds } = settings;

  const [q, setQ] = useState<Question>(() => {
    const clef = pickClef(clefChoice);
    return { midi: pickNote(clef, null), clef };
  });
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 });
  const [celebrate, setCelebrate] = useState(0);
  const [finished, setFinished] = useState(false);
  const [autoAdvancing, setAutoAdvancing] = useState(false);
  const [secLeft, setSecLeft] = useState(perNoteSeconds);

  const prevMidi = useRef<number>(q.midi);
  const answeredRef = useRef(false);
  const streakRef = useRef(0);
  const totalRef = useRef(0);
  const bestStreakRef = useRef(0);
  const barRef = useRef<HTMLSpanElement>(null);

  const modeTitle = mode === 1 ? t.mode1Title : mode === 2 ? t.mode2Title : t.mode3Title;
  const prompt = mode === 1 ? t.promptMode1 : mode === 2 ? t.promptMode2 : t.promptMode3;

  const nextQuestion = useCallback(() => {
    const clef = pickClef(clefChoice);
    const midi = pickNote(clef, prevMidi.current);
    prevMidi.current = midi;
    answeredRef.current = false;
    setAutoAdvancing(false);
    setQ({ midi, clef });
    setAnswered(false);
    setFeedback(null);
  }, [clefChoice]);

  const onAnswer = useCallback(
    (ok: boolean, timedOut = false) => {
      if (answeredRef.current) return;
      answeredRef.current = true;

      const newStreak = ok ? streakRef.current + 1 : 0;
      streakRef.current = newStreak;
      bestStreakRef.current = Math.max(bestStreakRef.current, newStreak);
      totalRef.current += 1;
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
        setFeedback({ ok, text: timedOut ? t.timeUp(label) : t.almostCorrect(label) });
      }
      if (settings.autoPlay) {
        window.setTimeout(() => playNote(q.midi), ok ? 250 : 120);
      }
      setAnswered(true);
    },
    [q.midi, mode, settings.autoPlay, t],
  );

  const advance = useCallback(() => {
    setAutoAdvancing(false);
    if (sessionLength > 0 && totalRef.current >= sessionLength) {
      setFinished(true);
      fireConfetti();
    } else {
      nextQuestion();
    }
  }, [sessionLength, nextQuestion]);

  const handleTimeout = useCallback(() => {
    setAutoAdvancing(true);
    onAnswer(false, true);
    window.setTimeout(advance, TIMEOUT_REVEAL_MS);
  }, [onAnswer, advance]);

  const restart = useCallback(() => {
    totalRef.current = 0;
    streakRef.current = 0;
    bestStreakRef.current = 0;
    answeredRef.current = false;
    setScore({ correct: 0, total: 0, streak: 0 });
    setFinished(false);
    nextQuestion();
  }, [nextQuestion]);

  // per-note countdown (drives the bar directly + fires timeout)
  useEffect(() => {
    if (finished || perNoteSeconds <= 0) return;
    setSecLeft(perNoteSeconds);
    const dur = perNoteSeconds * 1000;
    const start = performance.now();
    if (barRef.current) barRef.current.style.width = '100%';
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const frac = Math.max(0, 1 - elapsed / dur);
      if (barRef.current) barRef.current.style.width = `${frac * 100}%`;
      setSecLeft((prev) => {
        const s = Math.max(0, Math.ceil((dur - elapsed) / 1000));
        return s !== prev ? s : prev;
      });
      if (answeredRef.current) return; // answered → freeze
      if (elapsed >= dur) {
        handleTimeout();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [q.midi, perNoteSeconds, finished, handleTimeout]);

  const nextRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (answered && !autoAdvancing) nextRef.current?.focus();
  }, [answered, autoAdvancing]);

  if (finished) {
    const acc = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <div className={c.wrap}>
        <div className={c.topbar} style={{ marginBottom: 12 }}>
          <button className={c.ghostBtn} onClick={onBack} aria-label={t.back}>
            ‹
          </button>
          <div className={c.brand} style={{ fontSize: 16 }}>
            <span>{modeTitle}</span>
          </div>
          <span style={{ width: 44 }} />
        </div>

        <div className={g.summary}>
          <div className={g.summaryEmoji}>🎉</div>
          <div className={g.summaryTitle}>{t.sessionDone}</div>
          <div className={g.stats}>
            <div className={g.stat}>
              <div className={g.v}>{acc}%</div>
              <div className={g.k}>{t.statAccuracy}</div>
            </div>
            <div className={g.stat}>
              <div className={g.v}>
                {score.correct}/{score.total}
              </div>
              <div className={g.k}>{t.statCorrect}</div>
            </div>
            <div className={`${g.stat} ${g.streak}`}>
              <div className={g.v}>{bestStreakRef.current}</div>
              <div className={g.k}>{t.statBest}</div>
            </div>
          </div>
        </div>

        <div className={c.actions}>
          <button className={`${c.btn} ${c.btnSoft}`} onClick={onBack}>
            {t.home}
          </button>
          <button className={`${c.btn} ${c.btnPrimary}`} onClick={restart}>
            {t.playAgain}
          </button>
        </div>

        <SuccessBurst trigger={celebrate} />
      </div>
    );
  }

  const isLastAnswer = sessionLength > 0 && score.total >= sessionLength;
  const showTimer = perNoteSeconds > 0;
  const danger = showTimer && !answered && secLeft <= 3;

  return (
    <div className={c.wrap}>
      <div className={c.topbar} style={{ marginBottom: 12 }}>
        <button className={c.ghostBtn} onClick={onBack} aria-label={t.back}>
          ‹
        </button>
        <div className={c.brand} style={{ fontSize: 16 }}>
          <span>{modeTitle}</span>
          {sessionLength > 0 && (
            <span style={{ color: 'var(--muted)', fontWeight: 700, marginLeft: 6 }}>
              {Math.min(score.total + (answered ? 0 : 1), sessionLength)}/{sessionLength}
            </span>
          )}
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

      {showTimer && (
        <div className={`${g.timer} ${danger ? g.timerDanger : ''}`}>
          <span className={g.timerBar}>
            <span ref={barRef} className={g.timerFill} style={{ width: '100%' }} />
          </span>
          <span className={g.timerNum}>{secLeft}s</span>
        </div>
      )}

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

      {answered && !autoAdvancing && (
        <div className={c.actions}>
          <button ref={nextRef} className={`${c.btn} ${c.btnPrimary}`} onClick={advance}>
            {isLastAnswer ? t.seeResults : t.next}
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
