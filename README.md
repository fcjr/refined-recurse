# Refined Recurse

A small [WXT](https://wxt.dev/) browser extension with quality-of-life tweaks
for [recurse.com](https://www.recurse.com). It only runs on recurse.com.

## Features

- **Auto-growing job notes** — the "Add a general note, comment, or question…"
  box is a fixed ~5-line box that scrolls internally. This makes it grow upward
  to fit the note as you type (up to half the viewport, then it scrolls), and
  unifies the focus ring so it reads as a single field instead of a box inside
  a box.

## Development

```sh
npm install
npm run dev        # launches your default browser with the extension + HMR
npm run build      # production build → .output/chrome-mv3
npm run zip        # packaged .zip for the Chrome Web Store
```

`web-ext.config.ts` detects the OS default browser (via LaunchServices on
macOS) and launches `npm run dev` in it, as long as it's Chromium-based
(Chrome, Edge, Brave, Arc, Helium, Vivaldi, …). If the default is Safari or
Firefox it falls back to WXT's bundled Chrome. It opens a fresh temporary
profile, so you'll sign in to recurse.com there the first time.

Firefox variants: `npm run dev:firefox`, `npm run build:firefox`.

## Load manually

Run `npm run build`, then open `chrome://extensions`, enable Developer mode,
and "Load unpacked" from `.output/chrome-mv3`.

## Branding

Shares the [Batchmate](https://batchmate.app) look: the cyan RC octopus on a
dark navy field.

- **Logo** — cyan octopus (`assets/octopus-cyan.png`, `assets/icon-master.png`)
- **Brand / accent** — cyan `#22d3ee`
- **Background** — dark navy `#0a0f1c`; surface `#1e293b`

Toolbar and store icons are generated into `public/icon/{16,32,48,96,128}.png`
from `assets/icon-master.png`. To regenerate after changing the master:

```sh
for s in 16 32 48 96 128; do
  sips -z $s $s assets/icon-master.png --out public/icon/$s.png
done
```
