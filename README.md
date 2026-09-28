# Čtu noty 🎹

A little **piano note-reading trainer** built as an installable PWA — made for practicing
note recognition on an iPad. Uses **Czech note naming**: `C D E F G A H`
(where **H** = English B natural, and **B** = B♭).

Live: **https://achudinov.github.io/note-trainer/**

## Modes

1. **Poznej notu** — see the note, pick the right name from 4 options.
2. **Napiš notu** — see the note, enter its name + octave (e.g. `G1`).
3. **Zahraj notu** — see the note, play it on a real piano; the app listens through the
   microphone and detects the pitch.

## Notes & octaves

- White-key naturals only for now: `C D E F G A H` (no accidentals yet).
- Octave numbers follow Czech tradition: middle C = **C1**, the octave above = **C2**,
  the small octave below (bass) = **C0**.
- Beginner ranges: treble ≈ C1–A2, bass ≈ C0–C1 (few ledger lines).
- Clefs: treble, bass, or both.

## Tech stack

- **Vite + React + TypeScript**
- **CSS Modules** for scoped styling
- **vite-plugin-pwa** (Workbox) for offline + installability
- **Web Audio API** for note playback and microphone pitch detection (autocorrelation)

## Develop

```bash
npm install
npm run dev        # local dev server
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build
npm run gen:icons  # regenerate PWA icons from public/favicon.svg
```

## Deploy

Pushing to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`),
which builds the app and publishes `dist/` to GitHub Pages.

One-time setup in the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Add to the iPad home screen

Open the live URL in **Safari** → Share → **Add to Home Screen**. It then launches
full-screen like a native app and works offline.
