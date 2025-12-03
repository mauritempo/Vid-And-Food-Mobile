## Project snapshot

- Expo React Native mobile app (managed workflow). See `package.json` scripts (`expo start`) and `index.js` uses `registerRootComponent`.
- Entry points: `index.js` -> `App.js`.
- Navigation is organized under `navigation/` (empty folder present — expect stack/tab navigators to be added).
- Theme and shared styling live in `theme/theme.js`.

## Goals for AI coding agents

- Make small, safe changes. Prefer edits in single files unless adding a clear feature (fonts, components).
- Preserve Expo-managed workflow and avoid ejecting. Use Expo packages when possible.
- Keep Android/iOS/web parity in mind: prefer cross-platform APIs from `react-native` and `expo`.

## Key patterns & conventions

- App is an Expo managed app. Use `expo` packages for fonts, icons, assets, and splash handling.
- Styling uses inline `StyleSheet.create` and centralized `theme/theme.js`. When adding new styles, prefer re-using values from `theme/theme.js`.
- Navigation (React Navigation v7) should be configured under `navigation/` and used from `App.js` or a top-level `NavigationContainer`.

## Fonts (common requested task)

This project uses Expo; prefer `@expo-google-fonts/*` + `expo-font` for loading Google fonts at app startup.

Example (already added to `App.js`):

- Install (PowerShell):

```powershell
npm install @expo-google-fonts/playfair-display @expo-google-fonts/poppins expo-font
```

- Usage pattern: load fonts in the root `App` component, show a loading fallback (ActivityIndicator) while fonts load, then render.

Apply fonts via `style={{ fontFamily: 'PlayfairDisplay_700Bold' }}` on `Text` or wire into `theme/theme.js`.

## Files to reference

- `App.js` — app root; font-loading example included.
- `theme/theme.js` — centralized theme values and preferred place to set font-family tokens.
- `navigation/` — add navigator files here (stack/tab) and import into `App.js`.
- `package.json` — shows Expo SDK version (~54) and navigation libs.

## Integrations & external deps

- React Navigation (v7) — use `NavigationContainer` and install required native dependencies per docs.
- `react-native-vector-icons` — available; use where icon fonts are needed.

## Developer workflows (what worked from reading files)

- Start dev server: `npm start` (or `npm run android` / `npm run ios`). Use Expo Go for quick testing.
- No test scripts found. Keep tests small and local if added.

## Safety & style notes for AI

- Don't add native modules or require ejecting Expo.
- Keep changes platform-agnostic and avoid hard-coded absolute paths.
- When editing shared theme values, update `theme/theme.js` and search usages.

---

If any section is unclear or you want the instructions expanded (for example, add CI steps or build configs), tell me which part and I'll iterate.
