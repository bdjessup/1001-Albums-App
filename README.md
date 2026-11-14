# Liner

A native iOS and Android companion for [1001 Albums Generator](https://1001albumsgenerator.com): today's album with one-tap listening, your full history and your listening stats.

> "Liner" is a working name (as in liner notes). The bundle ID is `com.proper.liner`.

Built with **Expo SDK 58** (React Native 0.88, React 19.3, React Compiler), Expo Router, `@expo/ui`, TanStack Query and Jotai.

## Quick start

```sh
bun install
bun run ios        # expo run:ios — builds a dev client (needs Xcode)
bun run android    # expo run:android — needs Android Studio / an emulator
```

The app uses native modules (`@expo/ui`, `react-native-image-colors`, `expo-sqlite`), so it runs in a **development build**, not Expo Go. On first launch, enter your project name (the last part of `1001albumsgenerator.com/<name>`) or paste the link.

Checks (all run headless):

```sh
bun run typecheck   # tsc
bun run test        # vitest, src/core
bun run lint        # expo lint
bun run check       # all three
bun run icons       # regenerate app icon, adaptive icon and splash from one SVG
```

## Native on each platform, shared everywhere else

| | iOS | Android |
| --- | --- | --- |
| Tabs | `UITabBar` with Liquid Glass, minimises on scroll | Material 3 navigation bar with pill indicator |
| Headers | Large titles, transparent glass bars, `Stack.Toolbar` items and native menus | M3 top app bar, icon buttons with ripples and dropdown menus |
| Settings | SwiftUI `Form` | Jetpack Compose M3 settings list |
| Buttons | SwiftUI `.glassProminent` (iOS 26), tinted by album art | Compose M3 filled button, palette generated from album art |
| Progress | SwiftUI capacity `Gauge` | M3 Expressive wavy progress indicator |
| Empty states | `ContentUnavailableView` | M3 empty state |
| Icons | SF Symbols | Material Symbols |
| Type & colour | HIG text styles, system grouped colours | M3 type scale and tonal palette |
| History rows | Peek preview, context menu, zoom transition into the album | Ripple, standard push |

Screens are written once. Where a platform needs a different native control, the component lives in `src/components/native/` as a `name.ios.tsx` / `name.tsx` pair behind a shared props type. Settings are a single tree of `@expo/ui` universal components that render as SwiftUI on iOS and Compose on Android.

## Layout

```
src/
  app/          Expo Router routes (tabs: Today, History, Stats; album/[slug]; settings; welcome)
  core/         Pure TypeScript: API client + rate limiter, parsing, stats, links, colours (unit tested)
  data/         TanStack Query (persisted to SQLite), Jotai settings, album-art colours, actions
  components/   Shared UI; native/ holds the per-platform pairs
  theme/        Semantic tokens resolved per platform, navigation chrome
```

## Data

- The 1001 Albums Generator API is public, unauthenticated and **read-only**: ratings and reviews are written on the website, so "Rate on 1001 Albums" opens the project page in an in-app browser and the app refreshes when you return.
- It allows roughly **3 requests a minute**. All requests share one queued rate limiter, and the query cache is persisted to SQLite. The app opens instantly (even offline) and only refetches when data is stale: once a day for the project, or after 15 minutes; every 12 hours for global stats.
- Album-art colours are sampled on-device and cached per cover.
