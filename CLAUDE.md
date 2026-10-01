# CLAUDE.md

Guidance for Claude Code when working in this repo.

## What this is

**Čtu noty** — a piano note-reading trainer PWA for a 10-year-old child learning piano.
Installable on iPad (add to Home Screen), works offline. Built with Vite + React + TypeScript.

Live: https://achudinov.github.io/note-trainer/

## Commands

```bash
npm install          # install deps
npm run dev          # local dev server (http://localhost:5173/note-trainer/)
npm run build        # tsc -b && vite build  → dist/   (run this to type-check)
npm run preview      # serve the production build locally
npm run gen:icons    # regenerate PWA PNG icons from public/favicon.svg (needs sharp)
```

There is no separate lint/test setup — **`npm run build` is the gate** (strict TypeScript).
Always run it before committing.

## Deploy

Push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) builds and publishes `dist/`
to GitHub Pages. The `base` in `vite.config.ts` is `/note-trainer/` and must match the repo
name. GitHub Pages on the free plan **requires the repo to stay public**.

## Architecture

Single-page app, no router — `App.tsx` switches between three screens via local state:
`home` (`Home.tsx`), `game` (`Game.tsx`), `stats` (`Dashboard.tsx`).

Core modules (framework-free, keep them pure and testable):

- `src/music.ts` — the domain model: note naming, octaves, staff placement math, clef/note pickers.
- `src/audio.ts` — Web Audio: `playNote`, `playSuccess` (fanfare), `autoCorrelate` (pitch detection).
- `src/stats.ts` — localStorage persistence of practice results (`noty-stats-v1`).
- `src/confetti.ts` — canvas confetti burst.
- `src/i18n.ts` — translations + `LangContext` / `useT`.

Components:

- `Home.tsx` — clef picker, session-length picker, mode cards, results link, settings (`<details>`).
- `Game.tsx` — orchestrates a session: current question, score/streak, per-note countdown,
  timeout handling, feedback, session summary. Renders one of the mode components.
- `Staff.tsx` — SVG staff + clef + note + ledger lines.
- `ChoiceMode` / `WriteMode` / `PlayMode` — the three answer UIs (mode 1/2/3).
- `SuccessBurst.tsx` — center celebration overlay on a correct answer.
- `Dashboard.tsx` — results overview.

Styling: **CSS Modules** per component. Global tokens + theme in `src/styles/global.css`
(light/dark via `prefers-color-scheme` and a `data-theme` override; see `useTheme.ts`).

## Domain rules (do not "correct" these — they are intentional)

- **Czech note naming**: white keys are `C D E F G A H`. `H` = English B natural; `B` = B♭.
  Only naturals are used so far (no accidentals). Note letters are ALWAYS Latin, never translated.
- **Octave numbers** follow Czech tradition: middle C = **C1**, octave above = C2,
  small octave (bass) = C0. In code: `appOctave(midi) = floor(midi/12) - 4`.
- **Beginner ranges** (naturals only): treble ≈ C1–A2 (MIDI 60–81), bass ≈ C0–C1 (MIDI 48–60).
- **Three modes**: 1) pick the name from 4 options; 2) tap name + octave (e.g. `G1`);
  3) play the note on a real piano — the mic detects the pitch (autocorrelation).

## Settings & sessions

- Settings persist in localStorage `noty-settings-v1`, merged over `DEFAULT_SETTINGS` in `App.tsx`.
  Defaults: `micOctave` ON, `autoListen` ON, `autoPlay` ON, `lang` cs, `sessionLength` 20,
  `perNoteSeconds` 30.
- **Changing a default only affects new/cleared installs** — existing devices keep their stored
  value (stored wins in the merge). Tell the user to re-pick on their device when relevant.
- A session ends after `sessionLength` notes (10/20/30, or 0 = ∞ free play).
- Per-note countdown `perNoteSeconds` (options 0/15/30/45/60; 0 = off). On timeout: counts as
  wrong, reveals the answer, auto-advances. Stats record every answer incl. timeouts.

## i18n

Every user-facing string must go through `useT()` / the `Dict` in `src/i18n.ts` (cs + ru).
When adding UI text: add the key to the `Dict` interface and BOTH `cs` and `ru` objects.
Templated strings are functions (e.g. `timeUp: (label) => ...`). Note names/octaves are not translated.

## Gotchas

- **Clef glyphs** are Unicode `𝄞` / `𝄢` rendered as SVG `<text>` (system font). Positioning is
  font-metric dependent. Treble is fine; the **bass clef baseline** was tuned by hand to
  `CY + GAP * 1.1` in `Staff.tsx` so its dots straddle the F line. Nudge by ±`GAP*0.1` if off.
- **Countdown bar**: `.timerFill` must be `display: block` — it's an inline `<span>` otherwise
  and inline elements ignore `width`/`height` (this caused a "bar not moving" bug). Width is
  driven imperatively via a ref in a rAF loop, so don't add an inline `width` style that React
  would overwrite each render.
- **App icon**: `public/favicon.svg` uses clean primitives (rects/ellipses). Avoid hand-drawn
  bezier paths — resvg (used by `gen:icons`) renders them crooked. Run `npm run gen:icons` after
  editing the SVG, and commit the regenerated PNGs. iOS caches home-screen icons hard.
- **Microphone** needs a secure context (the HTTPS Pages URL) and one user gesture before it can
  start on iOS. Octave detection via autocorrelation can be an octave off — `micOctave` default is
  lenient (matches by note name).
- Text selection is disabled app-wide (`user-select: none` + `-webkit-touch-callout: none` on
  `body`). There are no text inputs (the keypad is buttons), so nothing needs to opt back in.

## Conventions

- Keep logic in the pure modules (`music.ts`, `audio.ts`, `stats.ts`); components stay thin.
- Match existing CSS Module structure and the token-based theming — don't hardcode colors.
- Commit messages end with the project's `Co-Authored-By` trailer.
