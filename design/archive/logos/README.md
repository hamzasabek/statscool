# Archived logos

Every StatsCool logo so far, kept when a new one replaced it. The current logo (v3, C "keys" since Step 106) and its generator
are in `design/logo/`. All of them are the owner's: not covered by the site's licences (see LICENSE-CONTENT.md).

## v1: the owner's first logo (Step 29, 2026-11-10)

`v1/statscool_logo_light.png`, `v1/statscool_logo_dark.png` (1280 × 720, white / black background): "Stats" in a
light sans, "cool" handwritten on tilted sticky notes (sky and yellow). The site showed transparent crops of it.

## v2: the second logo (Step 67, 2026-11-12, until Step 105)

`v2/statscool_logo_v2_light.svg`, `v2/statscool_logo_v2_dark.svg` (vector, text as paths): "Stats" in Outfit Bold,
"cool" on four rounded, slightly tilted fluorescent tiles: pink c `#FF2D95`, lime o `#B6FF1A`, cyan o `#12E6FF`,
a taller yellow l `#FFF000`. `v2/web-logo-light.png`, `v2/web-logo-dark.png`: the transparent PNGs the header
used (formerly `src/assets/logo-light.png` / `logo-dark.png`).

## v3: the candidates (Step 105, 2026-11-16)

Asked by the owner: a new logo that keeps the old one's fluorescent colours and fits the rectangular site of
Step 100 (IBM Plex Mono, square shapes, graph paper). All drawn from IBM Plex Mono SemiBold outlines on one grid
by `design/logo/make_logos.py`, which still writes this folder.

Round 1 (`preview.html` compares them, with the v2 logo):
- `tiles-*.svg` (A): the v2 layout redrawn: "Stats" over four square tiles, the yellow l taller.
- `bars-*.svg` (B): the tiles as a bar chart on an axis, letters at the foot of the bars.
- `keys-*.svg` (C): one row of keys, "Stats" on an ink key, then the four letter keys.
- `mark.svg`: a tab icon, the four tiles two by two.

Round 2, the owner asked to combine B and C:
- `h1-keychart-*.svg`: one row, the letter keys as bars of different heights on one axis.
- `h2-labelled-*.svg`: the keys of C, each topped by a floating bar of its colour. The site's logo in Step 105 only; the owner
  went back to C in Step 106 (the tab and home-screen icons are still H2's).
- `h3-stacked-*.svg`: "Stats" on a wide ink key over the bars of B.
- `h4-badge-*.svg`: one ink square, "Stats" and a little bar chart inside.
- `h5-axis-*.svg`: C standing on an axis with a tick under each letter.
- `h6-lollipop-*.svg`: the letter keys at different heights on stems (a lollipop chart).

Each candidate exists in `-light` (ink "Stats" key / ink text) and `-dark` (light key) versions.
