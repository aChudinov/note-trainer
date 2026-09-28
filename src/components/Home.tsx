import type { Dispatch, SetStateAction } from 'react';
import type { ClefChoice, Mode } from '../music';
import type { Settings } from '../App';
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
}

const CLEFS: { id: ClefChoice; label: string; ic: string }[] = [
  { id: 'treble', label: 'Houslový', ic: '𝄞' },
  { id: 'bass', label: 'Basový', ic: '𝄢' },
  { id: 'both', label: 'Oba', ic: '🎼' },
];

const MODES: { id: Mode; icon: string; title: string; desc: string }[] = [
  { id: 1, icon: '👀', title: 'Poznej notu', desc: 'Vyber správný název ze čtyř možností' },
  { id: 2, icon: '✏️', title: 'Napiš notu', desc: 'Zadej název a oktávu, třeba G1' },
  { id: 3, icon: '🎤', title: 'Zahraj notu', desc: 'Zahraj notu na klavír — poslechnu si ji' },
];

export function Home({
  clef,
  setClef,
  settings,
  setSettings,
  isDark,
  onToggleTheme,
  onStart,
}: HomeProps) {
  return (
    <div className={c.wrap}>
      <div className={c.topbar}>
        <div className={c.brand}>
          <span className={c.logo}>🎹</span>
          <h1>Čtu noty</h1>
        </div>
        <button
          className={c.ghostBtn}
          onClick={onToggleTheme}
          title="Světlý / tmavý režim"
          aria-label="Přepnout režim"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      <p className={s.heroSub}>Procvičuj čtení not na klavír 🎶</p>

      <p className={c.sectionLabel}>Klíč</p>
      <div className={s.seg} role="group" aria-label="Výběr klíče">
        {CLEFS.map((cl) => (
          <button
            key={cl.id}
            aria-pressed={clef === cl.id}
            onClick={() => setClef(cl.id)}
          >
            <span className={s.ic}>{cl.ic}</span>
            {cl.label}
          </button>
        ))}
      </div>

      <p className={c.sectionLabel} style={{ marginTop: 22 }}>
        Vyber cvičení
      </p>
      <div className={s.modes}>
        {MODES.map((m) => (
          <button key={m.id} className={s.modeCard} onClick={() => onStart(m.id)}>
            <span className={s.num}>{m.icon}</span>
            <span className={s.txt}>
              <b>{m.title}</b>
              <span>{m.desc}</span>
            </span>
            <span className={s.go}>›</span>
          </button>
        ))}
      </div>

      <details className={s.settings}>
        <summary>⚙️ Nastavení</summary>
        <div className={s.settingsBody}>
          <div className={s.switchRow}>
            <span className={s.lbl}>
              <b>Kontrolovat oktávu u mikrofonu</b>
              <span>Když je vypnuto, stačí správný název noty</span>
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
              <b>Přehrát notu po odpovědi</b>
              <span>Uslyšíš, jak nota zní</span>
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
        </div>
      </details>

      <p className={s.foot}>
        Noty: C D E F G A <b>H</b> &nbsp;•&nbsp; H = anglické B, B = béčko (Bb)
      </p>
    </div>
  );
}
