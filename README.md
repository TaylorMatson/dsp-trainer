# DSP Trainer

Cross-platform Digital Signal Processing trainer (Expo + TypeScript + EAS).
Target: iOS App Store and Google Play. v1 loop: lesson → demo → practice.

## Prerequisites

- Node.js 20+ (22 OK)
- npm
- For device/simulators:
  - **iOS:** macOS + Xcode Simulator, or Expo Go on a physical iPhone
  - **Android:** Android Studio emulator, or Expo Go on a physical device
- For cloud builds: Expo account + `npx eas-cli@latest login` (see P4 checklist)

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

From **Home**, open any ready module and complete Lesson → Demo → Practice offline.
**Settings → Privacy policy** opens the offline stub (also in `assets/legal/privacy-policy.md`).

### v1 modules

1. Sampling & Aliasing
2. Discrete Signals & Sine
3. Time vs Frequency (FFT + magnitude reading)
4. Windowing & Leakage
5. FIR vs IIR Filters (LP/HP)
6. Convolution Intro

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
| `app/` | Expo Router (Home / Demo / Settings + `module/[id]` loop + Privacy) |
| `content/` | Curriculum schema + v1 modules + privacy stub copy |
| `signal/` | Pure DSP helpers (sine, sample-rate, FFT, window, filters, convolve) |
| `progress/` | Local AsyncStorage progress store |
| `components/` | UI helpers + plots / visualizers |
| `assets/images/` | App icon, adaptive icons, splash (Expo-referenced) |
| `assets/legal/` | Privacy policy markdown stub |
| `assets/store/` | Listing icon masters + screenshot notes |
| `eas.json` | EAS profiles: `development`, `preview` (internal), `preview-simulator`, `production` |
| `scripts/` | Asset generator + screenshot capture notes |

## P4 · Store packaging checklist (internal builds)

Goal: TestFlight / Play **internal** (or EAS internal install links). **Do not** production-submit without Taylor GO (P5).

### App config (in repo)

- [x] Display name `DSP Trainer`, slug `dsp-trainer`, version `0.1.0`
- [x] iOS `bundleIdentifier` / Android `package`: `com.taylormatson.dsptrainer` (placeholder — change before conflicting apps ship)
- [x] Icons + splash under `assets/images/` referenced from `app.json`
- [x] Privacy stub offline via Settings → Privacy policy
- [x] `eas.json` `preview` profile with `"distribution": "internal"` (Android APK)

### What Taylor must still configure (credentials — never commit secrets)

1. **Expo / EAS**
   - Create or join an Expo account
   - `npx eas-cli@latest login`
   - `npx eas-cli@latest init` (or `eas build:configure`) — writes `extra.eas.projectId` into `app.json` (do not invent or paste fake IDs)
2. **Apple Developer Program** (paid)
   - Team access for bundle id `com.taylormatson.dsptrainer`
   - For device internal builds: register devices with `npx eas-cli@latest device:create`
   - EAS can manage distribution certs / ad hoc profiles on first `eas build` (you sign in to Apple when prompted)
   - Optional later: App Store Connect API key for CI — store in EAS secrets / env, not git
3. **Google Play Console**
   - Create the app with application id `com.taylormatson.dsptrainer`
   - Internal testing track (or install APK from EAS internal URL without Play)
   - Upload key: prefer EAS-managed credentials on first Android build; Play App Signing stays in Play Console
4. **Privacy hosting (before public submit)**
   - Host `assets/legal/privacy-policy.md` (or successor) at a public HTTPS URL
   - Point App Store / Play Data Safety forms at that URL
5. **Listings**
   - Capture screenshots per `scripts/store-screenshots.md`
   - Confirm final display name / icon art (current assets are branded placeholders)

### EAS preview / internal build commands

```bash
npx eas-cli@latest login
npx eas-cli@latest init   # once — writes real projectId into app.json

# Device-shareable internal builds (APK + iOS ad hoc / enterprise)
npx eas-cli@latest build --profile preview --platform android
npx eas-cli@latest build --profile preview --platform ios

# iOS Simulator artifact (no device UDID list)
npx eas-cli@latest build --profile preview-simulator --platform ios

# Optional local check without cloud credentials prompts for unsigned debug paths:
# prefer cloud preview for installable share links
```

Notes:

- `preview` uses `"distribution": "internal"` so EAS produces installable Android **APK**s and iOS builds suitable for ad hoc internal install (see [Internal distribution](https://docs.expo.dev/build/internal-distribution/)).
- The `development` profile sets `developmentClient: true` and expects `expo-dev-client` if you use it; P4 default path is **`preview`**, not the dev client.
- `submit.production` exists in `eas.json` for later wiring only — **agents must not run production submit**.

### Regenerate placeholder icons

```bash
pip install pillow
python3 scripts/generate-store-assets.py
```

## Track

P4 store packaging: icons/splash, EAS internal profiles, privacy stub, README checklist. Production App Store / Play submit remains Taylor gate (P5).
