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

## Run (Expo)

```bash
npm start          # Expo dev server (scan QR with Expo Go)
npm run ios        # iOS Simulator (macOS)
npm run android    # Android emulator
npm run web        # browser smoke (optional)
```

From **Home**, open **Module 1: Sampling & Aliasing** and complete Lesson → Demo → Practice offline.
The Demo tab still hosts the sine smoke plot.

## Verify

```bash
npm run typecheck  # tsc --noEmit
npm test           # vitest (signal + content + progress helpers)
npm run lint       # expo lint
```

## Layout

| Path | Role |
|------|------|
| `app/` | Expo Router (Home / Demo / Settings + `module/[id]` loop) |
| `content/` | Curriculum schema + Module 1 Sampling & Aliasing |
| `signal/` | Pure DSP helpers (sine, sample-rate/Nyquist, FFT magnitude) |
| `progress/` | Local AsyncStorage progress store |
| `components/` | UI helpers + plots / aliasing visualizer |
| `eas.json` | EAS build profiles (no credentials yet) |

## EAS

`eas.json` is stubbed. Link a real EAS project and replace the placeholder `extra.eas.projectId` in `app.json` before cloud builds. Do not submit to stores without Taylor GO.

## Track

P2 vertical slice: `curriculum-content` + `dsp-audio-engine` (Module 1 offline loop + signal engine v0).
