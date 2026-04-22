# Play It All

Play It All is a modern self-hosted music player for Subsonic-compatible
servers such as Navidrome. It runs as a web app and as an Electron desktop app,
with a liquid-glass interface inspired by the iOS version.

The goal is simple: connect your music server, browse your library, press play,
and get a polished music-app experience without giving up your own collection.

## Features

- Browse songs, albums, artists, genres, playlists, and library sections.
- Play, shuffle, sort, search, and jump between artist/album pages.
- Mini player and full now-playing view.
- Synced lyrics with LRCLIB lookup and Subsonic lyrics fallback.
- Full-screen lyrics mode for desktop and mobile.
- Queue / Up Next view.
- Equalizer presets.
- Responsive mobile and desktop layouts.
- Light and dark appearance modes.
- Electron desktop builds with GitHub release auto-updates.
- GitHub release changelog and previous-version history in Settings.

## Requirements

- A Subsonic-compatible server.
- Server URL, username, and password.
- For Chromecast, use Chrome over HTTPS or localhost. Chromecast devices must be
  able to reach the music stream URL directly, so a server saved as
  `localhost` will not work for casting to another device.

## Download And Install

Go to the latest GitHub Release and download the installer for your platform.

### macOS

Download the `.dmg`, open it, and drag `Play It All.app` into Applications.

Because early builds are not signed/notarized, macOS may block the app the first
time you open it.

To open an unsigned build:

1. Open Finder.
2. Go to Applications.
3. Control-click or right-click `Play It All.app`.
4. Choose `Open`.
5. Click `Open` again when macOS asks for confirmation.

If macOS still blocks it:

1. Open `System Settings`.
2. Go to `Privacy & Security`.
3. Scroll to the security message about Play It All.
4. Click `Open Anyway`.
5. Try opening the app again.

You can also remove quarantine from Terminal after downloading:

```bash
xattr -dr com.apple.quarantine "/Applications/Play It All.app"
```

Only do this for builds you downloaded from this project's release page.

### Windows

Download the Windows installer from the release page and run it.

Because early builds are not code-signed, Windows SmartScreen may warn you.

To open an unsigned build:

1. Click `More info` on the SmartScreen warning.
2. Confirm the publisher/app name looks like Play It All.
3. Click `Run anyway`.

Windows may continue warning until future builds are signed with a code-signing
certificate.

### Linux

Download the AppImage from the release page.

Make it executable, then open it:

```bash
chmod +x "Play It All.AppImage"
./"Play It All.AppImage"
```

## Using The App

1. Open Play It All.
2. Enter your Subsonic/Navidrome server URL.
3. Sign in with your server username and password.
4. Use Library, Search, and Home to browse your music.
5. Use Settings for appearance, library options, quality, equalizer, updates,
   and release notes.

## Updates

The Electron app checks GitHub Releases automatically shortly after launch and
again every six hours. You can also open `Settings > Updates` and click `Check`.

