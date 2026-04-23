# Desktop Migration

Play It All now has a Feishin-style desktop app built on Electron + Vite.

## Why

The old packaged app booted a bundled Next server so the Electron window could
reuse the website router and API routes. That worked, but it added startup
complexity and made the desktop build feel heavier than it needed to.

The desktop app now uses:

- Electron main + preload
- Vite renderer
- React Router for desktop navigation
- shared stores, playback logic, queries, and styling

## Current Status

The desktop renderer is buildable and is now the main Electron path:

- `desktop/electron/main.ts`
- `desktop/electron/preload.ts`
- `desktop/renderer/index.html`
- `desktop/renderer/src/*`
- `electron.vite.config.ts`

It already reuses:

- Zustand stores
- React Query setup
- appearance/preferences handling
- shared Subsonic query layer
- shared app pages through router/image/link shims
- Electron auto-update hooks

## Commands

Run the desktop app in development:

```bash
npm run desktop:dev
```

Build the desktop app renderer:

```bash
npm run desktop:build
```

The web app still uses Next separately:

```bash
npm run dev
npm run build
```

## Next Steps

1. Remove leftover unused migration-only placeholder files.
2. Move more desktop-specific integrations into preload instead of renderer helpers.
3. Tighten the packaged app size again now that Next standalone is no longer needed for Electron.
4. Update GitHub Actions to build and publish from the desktop entrypoint only.
