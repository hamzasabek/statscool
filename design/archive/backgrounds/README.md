# Archived backgrounds (Step 102 → 103)

In Step 102 six backgrounds were tried on the rectangular look, each in light and dark mode. The owner chose
**graph paper** (Step 103): it is now the default, in `src/index.css` (`--bg`, `--surface`, `--paper-line`, and the
grid on `body`). The other five are kept here, outside the site, so they can be used another time.

| Option | Light page / cards | Dark page / cards | After |
|---|---|---|---|
| StatsCool | `#f5f7fb` / `#fdfdff` + grain | `#101216` / `#181c22` + grain | the site before Step 103 |
| IBM Carbon | `#f4f4f4` / `#ffffff` | `#161616` / `#262626` | Carbon's Gray 10 and Gray 100 themes (`@carbon/themes`) |
| OpenCode | `#fafafa` / `#ffffff` | `#0c0c0c` / `#161616` | Vercel Geist (light) and opencode.ai (dark), both measured |
| Paper | `#f6f3ec` / `#fffdf8` + grain | `#14120f` / `#1d1a16` + grain | warm paper (Rosé Pine Dawn, Solarized light) |
| Night blue | `#e8ebf4` / `#f7f8fc` | `#1a1b26` / `#222536` | Tokyo Night (folke/tokyonight.nvim) |

Only the neutral tokens change (page, cards, tiles, borders, text, muted text, axes, grid of the charts, the dots'
outline in dark mode). Navy, blue, sky, sun yellow, the logo colours and the step tints stay. Contrast was checked by
script: text, muted text and the step colours at least 4.5:1, axes at least 3:1, on page and cards; in dark mode the
Carbon and Night blue options set the logo pink used as text to `#ff47a2` (4.8:1 on their cards).

Files:
- `backgrounds.css`: one block per option and mode on `<html data-bg="…">`, plus the picker's styles. Its last
  rule turns the graph off when an option is on (`:root[data-bg] body { background-image: var(--grain, none) }`).
- `BgPicker.jsx`: the test picker (a narrow tab on the left edge; the choice is kept in memory only, so the privacy
  page stays true; a link can carry one: `#/topics?bg=paper`).
- `compare-topic.jpg`, `compare-game.jpg`, `compare-home.jpg`: screenshots of the six options, light and dark
  (Step 102), the topic page, the inner clock and Home.

## Use one again

**As the default** (replaces graph paper): copy the values of its two blocks into `src/index.css`, light ones in
`:root`, dark ones in `:root[data-theme='dark']`; on `body`, replace the grid by `background: var(--bg) var(--grain);`
(or no image for the options without grain). Then `npm run check` and look at light and dark.

**To compare again** with the picker:
1. Copy `backgrounds.css` to `src/styles/` and `BgPicker.jsx` to `src/components/`.
2. In `src/main.jsx`, after the bridge import: `import './styles/backgrounds.css'`.
3. In `src/App.jsx`: `import BgPicker from './components/BgPicker.jsx'` and `<BgPicker />` after `<Header />`.
4. `npm run check`. Remove the three again once a choice is made.
