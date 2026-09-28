import { useEffect, useState } from 'react';
import type { ClefChoice, Mode } from './music';
import { Home } from './components/Home';
import { Game } from './components/Game';
import { Dashboard } from './components/Dashboard';
import { useTheme } from './useTheme';
import { LangContext, translations, type Lang } from './i18n';

export interface Settings {
  micOctave: boolean;
  autoPlay: boolean;
  autoListen: boolean;
  lang: Lang;
  sessionLength: number; // notes per session; 0 = endless / free play
  perNoteSeconds: number; // countdown per note; 0 = off
}

type Screen = { name: 'home' } | { name: 'game'; mode: Mode } | { name: 'stats' };

const SETTINGS_KEY = 'noty-settings-v1';

const DEFAULT_SETTINGS: Settings = {
  micOctave: true,
  autoPlay: true,
  autoListen: true,
  lang: 'cs',
  sessionLength: 10,
  perNoteSeconds: 10,
};

function initialSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Settings>;
      const lang: Lang = p.lang === 'cs' || p.lang === 'ru' ? p.lang : DEFAULT_SETTINGS.lang;
      return { ...DEFAULT_SETTINGS, ...p, lang };
    }
    const oldLang = localStorage.getItem('noty-lang');
    if (oldLang === 'cs' || oldLang === 'ru') return { ...DEFAULT_SETTINGS, lang: oldLang };
  } catch {
    /* ignore */
  }
  return DEFAULT_SETTINGS;
}

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [clef, setClef] = useState<ClefChoice>('treble');
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const theme = useTheme();

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
    document.documentElement.lang = settings.lang;
  }, [settings]);

  let content;
  if (screen.name === 'game') {
    content = (
      <Game
        clefChoice={clef}
        mode={screen.mode}
        settings={settings}
        isDark={theme.isDark}
        onToggleTheme={theme.toggle}
        onBack={() => setScreen({ name: 'home' })}
      />
    );
  } else if (screen.name === 'stats') {
    content = (
      <Dashboard
        isDark={theme.isDark}
        onToggleTheme={theme.toggle}
        onBack={() => setScreen({ name: 'home' })}
      />
    );
  } else {
    content = (
      <Home
        clef={clef}
        setClef={setClef}
        settings={settings}
        setSettings={setSettings}
        isDark={theme.isDark}
        onToggleTheme={theme.toggle}
        onStart={(mode) => setScreen({ name: 'game', mode })}
        onOpenStats={() => setScreen({ name: 'stats' })}
      />
    );
  }

  return (
    <LangContext.Provider value={translations[settings.lang]}>
      {content}
    </LangContext.Provider>
  );
}
