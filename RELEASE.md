# Play It All Release Process

## GitHub Setup

1. Create or use the GitHub repo:
   `https://github.com/Cory050506/playitall-web`
2. Push the app source to `main`.
3. Create a GitHub token with repository Contents read/write access.
4. Export it before publishing:
   ```bash
   export GH_TOKEN=your_token_here
   ```

## Automatic GitHub Release

The repo includes `.github/workflows/release.yml`. It runs whenever you push a
version tag like `v0.1.1`, builds the macOS app, and uploads the installer plus
auto-update metadata to GitHub Releases.

```bash
npm run lint
npm run build
npm version patch
git push origin main --follow-tags
```

Use the tag created by `npm version`; for example, version `0.1.1` creates the
tag `v0.1.1`.

For minor or major releases, use one of these instead:

```bash
npm version minor
npm version major
```

After the tag is pushed, open the GitHub Actions tab and wait for the Release
workflow to finish. Then open the GitHub Releases page, confirm the `.dmg`,
`.zip`, and updater metadata were uploaded, and edit the release notes if you
want a nicer changelog. The in-app Settings page reads those GitHub release
notes for the changelog/history view.

Existing installed Electron apps check for updates shortly after launch and
again every six hours. Users can also open Settings and press Check in the
Updates card. If an update has downloaded, the card shows a Restart button.

## Local Release

1. Bump the version in `package.json`.
2. Build and verify locally:
   ```bash
   npm run lint
   npm run build
   npm run dist:mac:dir
   npm run install:mac
   ```
3. Publish installers and updater metadata to GitHub Releases:
   ```bash
   npm run release
   ```

Electron Builder will create a GitHub release and upload the installer artifacts
plus update metadata. The app checks GitHub releases on launch and then every
six hours.

Use local release only when you intentionally want to publish from your machine
instead of GitHub Actions. You need `GH_TOKEN` exported in that terminal first.

## User Install

For macOS, distribute the `.dmg` from the GitHub release. Users should drag
`Play It All.app` into Applications. For local test installs, use:

```bash
npm run install:mac
```

This uses `ditto`, which preserves Electron framework bundles correctly.

## Signing

For private/local use, unsigned or development-signed builds are okay. The
`dist:mac:dir` and `install:mac` scripts intentionally skip signing so local
test builds finish quickly.

For public distribution and smooth macOS auto-updates, use a Developer ID
certificate and notarization so Gatekeeper trusts the app. Windows distribution
should eventually use a code-signing certificate to reduce SmartScreen warnings.

The GitHub Actions workflow currently publishes unsigned macOS builds. To ship
signed public builds from GitHub Actions, add Apple signing certificate secrets
and remove `CSC_IDENTITY_AUTO_DISCOVERY: false` from the workflow.

## Size

The Electron package uses Next.js standalone output instead of bundling the full
project directory. Local macOS directory builds are currently around 635 MB
instead of the previous roughly 2 GB app bundle.
