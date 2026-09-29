# DSP Trainer

Cross-platform Digital Signal Processing trainer (Expo + TypeScript + EAS).
Target: iOS App Store and Google Play. v1 loop: lesson → demo → practice.

## Prerequisites

- Node.js 20+ (22 OK)
- npm
- For device/simulators:
  - **iOS:** macOS + Xcode Simulator, or Expo Go on a physical iPhone
  - **Android:** Android Studio emulator, or Expo Go on a physical device

## Install

```bash
npm install
```

## Run

```bash
npm start          # Expo dev server (scan QR with Expo Go)
npm run ios        # iOS Simulator (macOS)
npm run android    # Android emulator
npm run web        # browser smoke (optional)
```

From the Home tab, open **Demo** (or the "Open sine smoke demo" link) for the sine plot smoke screen.

## Verify

```bash
npm run typecheck  # tsc --noEmit
npm test           # vitest (signal util tests)
npm run lint       # expo lint (may prompt to install eslint on first run)
```

## Layout

| Path | Role |
|------|------|
| `app/` | Expo Router screens (Home / Demo / Settings) |
| `signal/` | Pure DSP helpers (unit-tested) |
| `content/` | Curriculum stubs (full modules later) |
| `components/` | UI helpers + `SinePlot` |
| `eas.json` | EAS build profiles (no credentials yet) |

## EAS

`eas.json` is stubbed. Link a real EAS project and replace the placeholder `extra.eas.projectId` in `app.json` before cloud builds. Do not submit to stores without Taylor GO.

## Track

`app-scaffold` (P1). Curriculum and store packaging are separate tracks.
