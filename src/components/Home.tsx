import type { Dispatch, SetStateAction } from 'react';
import type { ClefChoice, Mode } from '../music';
import type { Settings } from '../App';
import { LANG_NAMES, useT, type Lang } from '../i18n';
import c from './controls.module.css';
import s from './Home.module.css';

interface HomeProps {
  clef: ClefChoice;
  setClef: (clef: ClefChoice) => void;
  settings: Settings;
  setSettings: Dispatch<SetStateAction<Settings>>;
  isDark: boolean;
  onToggleTheme: () => void;
  onStart: (mode: Mode) => void;
  onOpenStats: () => void;
}

const LANGS: Lang[] = ['cs', 'ru'];

export function Home({
  clef,
  setClef,
  settings,
  setSettings,
  isDark,
  onToggleTheme,
  onStart,
  onOpenStats,
}: HomeProps) {
  const t = useT();

  const clefs: { id: ClefChoice; label: string; ic: string }[] = [
    { id: 'treble', label: t.clefTreble, ic: '𝄞' },
    { id: 'bass', label: t.clefBass, ic: '𝄢' },
    { id: 'both', label: t.clefBoth, ic: '🎼' },
  ];

  const modes: { id: Mode; icon: string; title: string; desc: string }[] = [
    { id: 1, icon: '👀', title: t.mode1Title, desc: t.mode1Desc },
    { id: 2, icon: '✏️', title: t.mode2Title, desc: t.mode2Desc },
    { id: 3, icon: '🎤', title: t.mode3Title, desc: t.mode3Desc },
  ];

  return (
    <div className={c.wrap}>
      <div className={c.topbar}>
        <div className={c.brand}>
          <span className={c.logo}>🎹</span>
          <h1>{t.appTitle}</h1>
        </div>
        <button
          className={c.ghostBtn}
          onClick={onToggleTheme}
          title={t.toggleTheme}
          aria-label={t.toggleTheme}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      <p className={s.heroSub}>{t.heroSub}</p>

      <p className={c.sectionLabel}>{t.clefLabel}</p>
      <div className={s.seg} role="group" aria-label={t.clefLabel}>
        {clefs.map((cl) => (
          <button key={cl.id} aria-pressed={clef === cl.id} onClick={() => setClef(cl.id)}>
            <span className={s.ic}>{cl.ic}</span>
            {cl.label}
          </button>
        ))}
      </div>

      <p className={c.sectionLabel} style={{ marginTop: 22 }}>
        {t.chooseExercise}
      </p>
      <div className={s.modes}>
        {modes.map((m) => (
          <button key={m.id} className={s.modeCard} onClick={() => onStart(m.id)}>
            <span className={s.num}>{m.icon}</span>
            <span className={s.txt}>
              <b>{m.title}</b>
              <span>{m.desc}</span>
            </span>
            <span className={s.go}>›</span>
          </button>
        ))}
        <button className={s.modeCard} onClick={onOpenStats}>
          <span className={s.num}>📊</span>
          <span className={s.txt}>
            <b>{t.results}</b>
            <span>{t.resultsDesc}</span>
          </span>
          <span className={s.go}>›</span>
        </button>
      </div>

      <details className={s.settings}>
        <summary>⚙️ {t.settings}</summary>
        <div className={s.settingsBody}>
          <p className={c.sectionLabel} style={{ margin: '4px 0 8px' }}>
            {t.language}
          </p>
          <div className={s.seg} role="group" aria-label={t.language}>
            {LANGS.map((lng) => (
              <button
                key={lng}
                aria-pressed={settings.lang === lng}
                onClick={() => setSettings((prev) => ({ ...prev, lang: lng }))}
              >
                {LANG_NAMES[lng]}
              </button>
            ))}
          </div>

          <div className={s.switchRow} style={{ marginTop: 8 }}>
            <span className={s.lbl}>
              <b>{t.setMicOctave}</b>
              <span>{t.setMicOctaveDesc}</span>
            </span>
            <label className={s.switch}>
              <input
                type="checkbox"
                checked={settings.micOctave}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, micOctave: e.target.checked }))
                }
              />
              <span className={s.track} />
            </label>
          </div>
          <div className={s.switchRow}>
            <span className={s.lbl}>
              <b>{t.setAutoPlay}</b>
              <span>{t.setAutoPlayDesc}</span>
            </span>
            <label className={s.switch}>
              <input
                type="checkbox"
                checked={settings.autoPlay}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, autoPlay: e.target.checked }))
                }
              />
              <span className={s.track} />
            </label>
          </div>
          <div className={s.switchRow}>
            <span className={s.lbl}>
              <b>{t.setAutoListen}</b>
              <span>{t.setAutoListenDesc}</span>
            </span>
            <label className={s.switch}>
              <input
                type="checkbox"
                checked={settings.autoListen}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, autoListen: e.target.checked }))
                }
              />
              <span className={s.track} />
            </label>
          </div>
        </div>
      </details>

      <p className={s.foot}>{t.foot}</p>
    </div>
  );
}
