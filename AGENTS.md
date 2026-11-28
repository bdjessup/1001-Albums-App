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

## Branches in this repo

- The working branch is `claude/charming-faraday-l3r9gx`, the GitHub default branch. Treat it as `main`: every change goes through a pull request into it, and never push to it or to the older `main` branch directly. Renaming it is Ben's call.

## Shared rules

These rules apply in every one of Ben's repos. Repo-specific rules in this file add to them.

### Git and merging

- Name branches for what the change does, for example `fix-widget-refresh` or `add-export-button`. Never put the agent's or tool's name in a branch name (no `claude/`, `codex/`, `cursor/`, `copilot/` or `gemini/`).
- Every change goes through a pull request. Never push to `main`.
- Auto-merge is allowed only when required checks pass and the PR description documents what changed, why, how it was verified and how to roll it back.
- Do not auto-merge when the repo runs no checks on pull requests, or when merging deploys to production or ships a store build. Those merges need Ben's go-ahead.
- Report actual check results and say which checks were not run. Do not assume a failure already existed; compare with the base branch.

### Production and money

- No production deploys, remote (`--remote`) data changes, store uploads or store metadata pushes without Ben's explicit go-ahead in the current task.
- Be extremely conservative with billing, subscription, in-app purchase and payment code. Every change needs Ben's review and a test. Never create or change store products or prices.
- Never commit secrets. Document secret names only, never values.

### Working style

- Say when you are unsure instead of guessing.
- Default stack for new work: Cloudflare Workers with TanStack Start on the web, Railway for larger backends, and Expo with `@expo/ui` wherever possible for mobile. Do not migrate an existing app's framework or host without Ben's approval.
- On Apple platforms, follow Apple's Human Interface Guidelines and use native controls and Liquid Glass. On Android, keep native Material views.
