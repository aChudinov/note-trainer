import { useState } from 'react';
import type { ClefChoice, Mode } from './music';
import { Home } from './components/Home';
import { Game } from './components/Game';
import { useTheme } from './useTheme';

export interface Settings {
  micOctave: boolean;
  autoPlay: boolean;
}

type Screen = { name: 'home' } | { name: 'game'; mode: Mode };

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [clef, setClef] = useState<ClefChoice>('treble');
  const [settings, setSettings] = useState<Settings>({
    micOctave: false,
    autoPlay: true,
  });
  const theme = useTheme();

  if (screen.name === 'game') {
    return (
      <Game
        clefChoice={clef}
        mode={screen.mode}
        settings={settings}
        isDark={theme.isDark}
        onToggleTheme={theme.toggle}
        onBack={() => setScreen({ name: 'home' })}
      />
    );
  }

  return (
    <Home
      clef={clef}
      setClef={setClef}
      settings={settings}
      setSettings={setSettings}
      isDark={theme.isDark}
      onToggleTheme={theme.toggle}
      onStart={(mode) => setScreen({ name: 'game', mode })}
    />
  );
}
