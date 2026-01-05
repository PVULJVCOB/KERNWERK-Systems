# KERNWERK Systems

Static landing page for the KERNWERK Systems concept. Includes parallax animations, slideshows, and keyboard hotkeys.

## Live / Hosting
- Live domain: https://www.kernwerk-systems.de
- Hosted on GitHub Pages from branch `main` (root). Custom domain via `CNAME` in the repo.

## Structure
- `index.html`: Entry page with all sections (hero, marquee, slideshows, system overview, statements, CTA).
- `src/css/style.css`: Main styling (layout, type, animations).
- `src/css/main.css`: Additional component styles.
- `src/js/hotkeys.js`: Keyboard shortcuts for nav links (via `data-hotkey`).
- `src/js/parallax-reveal.js`: Parallax and reveal animations.
- `src/js/slideshow.js`: Slider logic for Kernwerk sections.
- `src/assets/`: Fonts, SVGs, and other assets.

## Local development
Prereqs: none (plain HTML/CSS/JS, no build step).

1) Clone
```bash
git clone https://github.com/PVULJVCOB/KERNWERK-Systems.git
cd KERNWERK-Systems
```
2) Start a local server (recommended for some browser APIs)
```bash
python3 -m http.server 8000
# or: npx serve
```
3) Open http://localhost:8000

## Hotkeys
Navigation uses `data-hotkey` attributes. See `src/js/hotkeys.js`.

## Deployment (GitHub Pages)
- Source: branch `main`, folder `/` (root).
- Custom domain: `www.kernwerk-systems.de` via `CNAME` and Pages settings.
- HTTPS: enable "Enforce HTTPS" in GitHub Pages (Let's Encrypt certs).

## Assets & fonts
All assets live under `src/assets/`. Reference new images or fonts with relative paths so they work on GitHub Pages.

## License
No explicit license yet. Add one if you plan to share the project publicly.
