# Accessibility audit (2026-11-16, Step 107)

Scope: the whole site as built from `main` after Step 106 (36 routes, English and French, light and dark, 1366×768 and 390×844),
against WCAG 2.2 level AA. Audit only: nothing in `src/` was changed.

## How it was done

| Method | What it covers |
|---|---|
| axe-core 4.10.2 in headless Chrome, every route × EN/FR × light/dark × desktop/phone (144 runs) | roles, names, labels, landmarks, contrast where it can be computed |
| A script that reads every visible text node | real rendered font size (SVG text scaled by its viewBox), 12 px threshold |
| A script on every interactive element | target size (WCAG 2.5.8: 24×24 px) |
| Viewports of 320 px, 683×384 (= 200 % zoom) and 341×192 (= 400 %) | reflow, horizontal scroll |
| Injected WCAG 1.4.12 text spacing (line 1.5, letters 0.12em, words 0.16em, paragraphs 2em) | clipped or overlapping text |
| `prefers-reduced-motion: reduce` emulated, then the animations still running are listed | motion |
| Tab key pressed on Home, focus ring read from computed style | keyboard order and focus visibility |
| Contrast ratios computed from the tokens in both themes, for text, UI parts and logo colours | colours |
| Reading the code (Header, Tour, App, Stage, index.css) | focus handling, titles, live regions |

**Not done** (needs a person or a device): a real screen reader (NVDA, VoiceOver, TalkBack), a real phone and its OS text-size
setting, Windows High Contrast, a colour-blindness simulation of the charts, and a keyboard-only run through every game.

## What is already good

- axe: **no violation on 24 of the 36 routes** (the 12 others have the findings below, all in H3, M5, M6, M7 or the scrollable regions); text contrast of `--text`, `--muted`, `--accent`, step colours as text: 4.5:1 or more on
  page, card and tile, in both themes (e.g. text 16:1, muted 6.2:1 light / 8.2:1 dark).
- Reflow: no horizontal scroll at 320 px, at 200 % or at 400 % zoom, on any page tested.
- Text spacing override (1.4.12): nothing clipped (the only hits are KaTeX's hidden MathML).
- Reduced motion: no animation left running with the setting on (CSS animations, springs and view transitions all respect it).
- Keyboard: every tab stop has a 2 px outline (pink, 5.7:1) in light mode; one `<main>`, named `<nav>`s, one `<h1>` per page, headings in order;
  the guided tour is a modal dialog with a focus trap, focus given back on close; charts are `role="img"` with a label; feedback
  regions are `aria-live="polite"`; the header that hides in games shows again when it takes focus.
- `lang` follows the EN | FR switch; the viewport does not block zoom; fonts are self-hosted with `font-display: swap`.

## Findings, by priority

### High

**H1. [FIXED in Step 108] The page title never changes, and nothing announces a new page** (WCAG 2.4.2, 4.1.3; WCAG technique for single-page apps)
`document.title` is never set (no match in `src/`): every route is "StatsCool: statistics for psychology and neuroscience". The router
only calls `window.scrollTo(0, 0)`; focus stays on the link that was clicked. A screen-reader user does not hear that the page changed,
and browser history / tabs all read the same.
Fix: a small hook in `App.jsx` that sets `document.title = "<h1> · StatsCool"` after each route and moves focus to the `<h1>`
(`tabIndex={-1}`) or to a polite live region; also on language change.

**H2. [FIXED in Step 109] The root font size is a fixed `15.5px`** (`src/index.css:168`; WCAG 1.4.4 and the user's own setting)
Everything is in `rem`, but `rem` is multiplied by 15.5 px, not by the browser's default size. A reader who set "Large" or 20 px in
Chrome / Firefox / Edge, or the text-size setting of Android and iOS, gets **no change**. (Page zoom still works.) It also puts the body
below the usual 16 px.
Fix: `font-size: 100%` on `:root` and `--fs-md: 1rem` stays; to keep today's look at the default setting use `font-size: 96.875%`
(= 15.5 / 16), which respects the user's choice. Check the games still fit one screen at 1366×768 afterwards.

**H3. Text under 12 px** (WCAG 1.4.4 and good practice; also 1.4.3 for the first one)

| Where | Size | Note |
|---|---|---|
| "Game 1 / 2 / 3" tags (Carbon tag, `.cds--tag__label`) | 11.2 px | and contrast **4.29:1** in light mode (`#c2005f` on `#fdcbe6`): fails 4.5:1 (axe, 5 routes) |
| `.cl-idx` index numbers under the live calculation | 10.2 px | |
| `<small>` in the recap table ("categories, no order") | 11.3 px | |
| Axis ticks in the charts (`.tick-label`) | 11.5 px | on 19 pages |
| **KaTeX subscripts and exponents** | **6.6 to 9.7 px** | e.g. xᵢ, Σ limits, n−1, z² on Mean, Variance and Normal pages |
| EN / FR switch, "Ctrl K" key cap, licence lines, ? guide icon, chart labels, captions | 12.1 px | the floor of the scale (`--fs-xs: 0.78rem`) |

Fix: `--fs-xs` to `0.8125rem` (13 px at 16 px) or more, as the new floor; give the tag the same token and a darker pink text
(`--pink-text` is already 5.7:1 on the page but not on the pink tint); give KaTeX `font-size: 1.15em` in recap sheets and calculation
panels (KaTeX shrinks a script to 0.7 and 0.5 of the line, so the line itself must be bigger); axis ticks to at least 12 px.

### Medium

**M1. Small targets** (WCAG 2.5.8, 24×24 px; inline links inside a sentence are exempt, the rest are not)
- `header-handle` ("Main", the grab that shows the hidden header in games): **56×18 px**, 24 pages.
- Footer links "Privacy and legal notice", "Licences", "About": 21 px high, 12 pages; "See all topics →" 21 px; every link on
  /licences 20 px high.
- Citation buttons `.cite`: 20 px high (they sit inside sentences, so they are probably exempt).
- Range inputs of the Normal playground and calculation: 16 px high (the thumb may be larger: check it).
- `np-knob` handles in the normal plot: 14×11 px drawn; the hit area should be larger (an invisible 24 px circle, as `.pg-hit` does).
Fix: `min-height: 24px` (better 32 px) and padding on those links; a taller handle.

**M2. No "skip to content" link.** On every page the first 8 tab stops are the header (logo, Topics, About, Search, EN, FR, sound,
theme) before the page content (WCAG 2.4.1). Fix: a visually hidden link, first in `<body>`, visible on focus, to `<main id="main">`.

**M3. Some focus indicators are only a colour change.**
`.mm-dot`, `.pg-dot` and `.np-knob` remove the outline and draw a stroke on keyboard focus instead (`:focus-visible { stroke: … }`, 3 px):
visible, but on a dot that may already be coloured, so check each with the keyboard. `.dots-input` has `:focus { outline: none; border-color: var(--accent) }`:
a 1 px colour change; give it a 2 px outline like the buttons (`--focus`). The search field's own input also has `outline: none` (its box
may show the focus: check).

**M4. Borders carry the shape of fields and cards at 1.2:1 to 1.7:1** (WCAG 1.4.11 asks 3:1 for the boundary of an input when it is the only
cue). `--border` is 1.19:1 on the card (light), 1.19:1 (dark); `--border-strong` 1.5:1. Text inputs, the search field, the quiz options
and the tag outlines depend on them. Buttons are fine (filled, with a label). Fix: use `--axis` (3.1:1 light, 3.9:1 dark) for the edge of
inputs and options; cards may keep the hairline (they are not controls).

**M5. Nested interactive content in the two Normal charts** (axe `nested-interactive`, serious):
`<svg role="img">` contains the focusable knobs and the marker (`/topics/normal-distribution/playground` and `/calculate`).
A `role="img"` hides its children from assistive technology, so the knobs may not be reachable by a screen reader.
Fix: `role="group"` (with the same `aria-label`) on those two SVGs, and `role="slider"` plus `aria-valuenow` on each knob if not set.
Also `scrollable-region-focusable` on the recap table wrap (phones) and the calculation formulas: add `tabIndex={0}` and a label.

**M6. `landmark-complementary-is-top-level`** on the three playground pages: `<aside className="pg-side">` inside `<main>`'s section;
use a `<div>` or `<section aria-label>`. (moderate)

**M7. One axe contrast hit in the live calculation:** the grey "if n is even" cases text (`#a1a6b2` on `#eff2f8`, **2.17:1**) on
`/topics/mean-median/calculate` and `/variance-sd/calculate`: probably a KaTeX `\text` inside a faded (disabled) formula. If it is
meant to read as inactive, it is exempt; if students must read it, use `--muted`.

### Low / ideas

- **L1. Inter: I (capital i) and l (lowercase L) look alike.** Inter has alternates for this (`font-feature-settings: 'cv05'` for an
  l with a tail, `'ss02'` "disambiguation": check the glyphs in our subset of the variable font before relying on it). Useful for
  dyslexic readers and for symbols such as l, I, 1 in statistics. Our maths use KaTeX, where it is not an issue.
- **L2. No user control of text.** A "Text size" (A − / A +) and an optional "readable font" are not needed for AA, but they are cheap
  once H2 is done (`html { font-size: calc(…) }` kept in `localStorage`; the privacy page lists the keys: it would need the new key).
- **L3. No `forced-colors` (Windows High Contrast) or `prefers-contrast` rules** (none in `src/`). In forced colours the focus outline
  and borders are kept by the browser, but the SVG charts (fills, strokes through CSS variables) and the logo keys may lose their
  meaning. Worth one look with the Edge "Contrast themes" setting.
- **L4. Time-based games** (inner clock, tap the beat, reaction time, the hero's 2-second hold) can be played with Space / Enter, but a
  person who cannot time a press precisely cannot take part: inherent to the experiments (WCAG 2.2.1 "essential"), but say so
  on the About page and offer the playgrounds and quizzes as the way in.
- **L5. Colour as the only cue:** the mean (navy) / median (sky) / mode lines have text labels; the quiz's right / wrong state and
  the "better / worse" tints of Train should be checked for a non-colour cue (icon, word). Not verified.
- **L6. The logo is at 86 % opacity** (Step 106). The logo is exempt from contrast rules and has `alt="StatsCool"`.
- **L7. Headings in mono at large sizes with negative tracking (`-0.028em`)** read fine to most people, but it is one of the first things to
  lift for dyslexic readers; if L2 is built, the "readable font" option should also reset `letter-spacing` on headings.
- **L8. [Fraunces removed in Step 115] Two small unused things:** the Fraunces font files (127 KB) are still in the build but unused, so visitors do not download them (the Step 100 comment says they are kept to
  switch back), and `document.title` could carry the language ("StatsCool (français)").

## Suggested order

1. H1 (title + focus on navigation), H2 (root font size), M2 (skip link): one small step, almost no visual change.
2. H3 (font floor 13 px, KaTeX scale, tag contrast, tick labels), M1 (targets): one visual step; re-check that games fit one screen.
3. M3, M4, M5, M6, M7: markup and token fixes.
4. L1 to L3 with the owner.
5. A manual pass: NVDA or VoiceOver on Home, a topic page, one game and the quiz; a phone with a larger OS text size; Windows High Contrast.
