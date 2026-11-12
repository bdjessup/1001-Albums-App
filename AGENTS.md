# Liner

Expo iOS/Android app for 1001 Albums Generator. Use Bun; routes are in `src/app`. See `README.md` for setup and native builds.

## Checks

- Run `bun run check` (typecheck, Vitest and lint). Report results; do not assume an earlier clean run still applies.
- Headless bundle check: `EXPO_OFFLINE=1 bunx expo export --platform ios --platform android --output-dir /tmp/liner-export`.
- For config-plugin changes, run `EXPO_OFFLINE=1 bunx expo prebuild --no-install --clean` in a disposable checkout; `ios/` and `android/` are generated and ignored.
- Use `EXPO_OFFLINE=1` when Expo's API is blocked. `expo start` generates `.expo/types/router.d.ts`; without it, route typing is loose.

## Constraints

- Keep `src/core` pure TypeScript, without React Native imports, and unit-test API parsing, stats and formatting there.
- Prefer universal `@expo/ui` controls. Put native differences in `src/components/native/name.ios.tsx` + `name.tsx`, sharing `name.types.ts`; screens import the shared name, not platform branches. Use `process.env.EXPO_OS` or `theme.isIOS` when checking platform.
- Add icons to `ICONS` in `src/components/icon.tsx` with both SF and Material Symbol names. Use semantic theme tokens and `AppText`, not per-screen hard-coded colours/text styles.
- Never poll the 1001 Albums API. Use `albumsClient`'s shared limiter (about 3 requests/minute) and TanStack Query.
