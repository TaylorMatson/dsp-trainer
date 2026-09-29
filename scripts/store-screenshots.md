# Store screenshot capture (P4 optional)

Phone screenshots for App Store / Play listings are **not** auto-uploaded. Use one of the paths below before P5 public submit.

## Option A — Expo web (fastest on any machine)

```bash
npm start
# press `w` for web, or:
npm run web
```

Open `http://localhost:8081` (port may vary). Resize the browser to phone width (≈390×844) and capture:

| Shot | Route / focus |
|------|----------------|
| 1 Home path | `/` — module list |
| 2 Lesson | `/module/sampling-aliasing/lesson` (or first module id) |
| 3 Demo | `/module/sampling-aliasing/demo` |
| 4 Practice | `/module/sampling-aliasing/practice` |
| 5 Settings / privacy | Settings tab → Privacy policy |

Save PNGs under `assets/store/screenshots/` (create the folder locally; keep binaries out of PRs unless Taylor asks).

## Option B — Simulator / emulator

```bash
npm run ios       # macOS + Xcode
npm run android   # Android Studio emulator
```

Use the OS screenshot shortcuts. Prefer light mode and a completed Module 1 demo for marketing clarity.

## Listing size reminders

- **iOS:** 6.7" and 6.5" phone sets are the usual minimum for new apps (check current App Store Connect requirements).
- **Android:** at least two phone screenshots; 16:9 or 9:16 JPEG/PNG.
- Icon masters already live in `assets/store/icon-512.png` and `icon-1024.png`.

## Do not

- Do not submit listing media to production stores from agents (P5 · Taylor gate).
- Do not invent real Apple/Google credentials in repo files.
