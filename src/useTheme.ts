import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Manages an explicit light/dark override stored in localStorage. */
export function useTheme(): { isDark: boolean; toggle: () => void } {
  const [override, setOverride] = useState<Theme | null>(() => {
    try {
      const v = localStorage.getItem('noty-theme');
      return v === 'light' || v === 'dark' ? v : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (override) root.setAttribute('data-theme', override);
    else root.removeAttribute('data-theme');
  }, [override]);

  const isDark = override ? override === 'dark' : systemPrefersDark();

  const toggle = useCallback(() => {
    setOverride((prev) => {
      const currentlyDark = prev ? prev === 'dark' : systemPrefersDark();
      const next: Theme = currentlyDark ? 'light' : 'dark';
      try {
        localStorage.setItem('noty-theme', next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { isDark, toggle };
}
