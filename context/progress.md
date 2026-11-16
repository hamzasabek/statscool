# Progress log

Newest entries at the bottom. Each step = one commit pushed to `main`. Steps 1-80: `progress-archive.md`.

## 2026-11-13 — Step 81: no animation; the big logo in the hero flies back to the header (Claude)
- Owner: remove the animation; show the logo in big where the animation was, and when the page
  scrolls or another page opens, the logo goes back to the header.
- New src/components/BrandLogo.jsx: the logo as SVG (light / dark versions, CSS picks one) in a
  motion.div with layoutId "brand-logo". useLogoInHero() = on "/" and scrolled ≤ 60 px (one shared
  scroll store, useSyncExternalStore). Home shows the logo big in the hero slot (max 440 px wide;
  on phones first, above the title, max 300 px); the header then keeps an invisible placeholder of
  the same size (no jump in the nav). When the condition changes (scroll down / up, a link to
  another page, the logo link back home) Motion flies the logo between the two places (spring
  220 / 28); reduced motion: it just swaps (MotionConfig reducedMotion "user").
- src/assets/logo-light.svg, logo-dark.svg: copies of design/logo/statscool_logo_v2_*.svg with the
  viewBox cropped to the drawing (168.5 42.5 562.3 363.2; bounds measured in Chrome) so it is sharp
  in big; the header uses them too (the PNGs are no longer imported). HeroField.jsx, its CSS and the
  hero caption texts removed. LICENSE-CONTENT.md lists the SVG logo files as reserved too.
- Tested: npm run build; full npm run check (34 pages, 2 sizes, EN + FR: no problems); headless
  Chrome: top of Home = logo in hero + header placeholder; scrolled 300 px = logo in header (photo
  mid-flight); back to top = hero; About link = header; logo link = hero again; phone top / scrolled;
  reduced motion swaps at once; dark and light. No console errors. Stopped an orphaned check run
  (port 4179) left by a cancelled background command.

## 2026-11-13 — Step 82: back to the original bell hero and the logo in the header (Claude)
- Owner asked whether a smaller big logo on the left (text on the right, centred on phones) was a
  good idea, or whether to go back to the original animation with the logo in its place. Claude's
  advice: go back. The bell animation shows the site's idea (every action becomes a dot, the dots
  grow into the graph) and matches the lead sentence; a big logo only repeats the name already in
  the header. Also: this PC reports reduced motion, so the owner may only have seen the bell already
  formed (Windows Settings → Accessibility → Visual effects → Animation effects). Owner: restore.
- Home.jsx, Header.jsx, the hero texts, LICENSE-CONTENT.md and the hero / brand CSS restored as they
  were in efbe477 (the original yellow bell, curve in dark yellow, PNG logo in the header).
  BrandLogo.jsx and the SVG logo copies removed. Kept: the bigger author photo of Step 77 (only that
  CSS re-applied), the reliable check tool of Step 80.
- Tested: npm run build; full npm run check (no problems); headless Chrome with motion allowed:
  54 dots and 55 running animations, dots dropping at 1.3 s, bell and curve complete at 5.3 s, two
  header logo images (light / dark); desktop dark EN and phone light FR. No console errors.

## 2026-11-13 — Step 83: the hero bell bends near the cursor (Claude)
- Owner: make the bell and the dots deformable when the cursor comes near.
- Home.jsx (useSoftSheet): every dot centre and every point of the curve is pushed away from the
  pointer by 24 × exp(−l² / 2·40²) viewBox units (l = distance to the pointer), each moving 18 % of
  the way to its target per frame, so the shape bends like a soft sheet and springs back when the
  pointer leaves. Works over the drop animation (cx / cy change, the drop uses transform). Touch:
  a tap or a drag bends it, release lets it go. The loop runs only while something moves.
- Tested: npm run build; npm run check on / (EN + FR, 2 sizes: no problems); headless Chrome with
  motion allowed: pointer in the bell moves 45 of 54 dots (max 23.8 units), the curve bends over its
  flank, back to rest within 0.05 units 1.5 s after leaving, also when hovered during the drop.
  No console errors.

## 2026-11-13 — Step 84: the logo colours in small accents (Claude)
- Owner: the logo colours should also appear in some very secondary texts and animations. Claude
  proposed options; owner chose: small touches, one colour per learning step, a celebration burst.
- index.css: tokens --logo-pink / -lime / -cyan / -yellow, text versions darkened for light mode
  (#c2005f 6.1:1, #4a7500 5.5:1, #00788a 5.2:1, #8a6a00 5.1:1 on white; the neon colours in dark
  mode, ≥ 5.3:1 on the dark surfaces), --focus. Steps: .is-discover pink, .is-play / .is-explore
  lime, .is-train cyan, .is-quiz / .is-check yellow (--step, --step-text) on the Home step numbers,
  the About step names (About.jsx: class per item), the topic-page role headings (a coloured dot,
  TopicPage.jsx RoleHead kind) and cards (game numbers and hover ring pink; Explore / Train / Check
  cards tinted with their colour), the topic-list chips. Small touches: ::selection pink, link
  underline pink on hover, citation underline cyan on hover, nav dot pink (Topics) / cyan (About),
  every focus ring --focus (pink). Charts untouched.
- New src/celebrate.js: 36 dots in the four colours burst from the middle of the screen (Web
  Animations, removes itself, nothing with reduced motion). sound.js useChime calls it when the
  last threshold of a game is crossed; Quiz.jsx calls it on a perfect score.
- Tested: npm run build; full npm run check (no problems); screenshots: Home steps dark EN and light
  FR, topic page light EN, topic list dark EN, About dark FR; finishing the Ebbinghaus game (20
  picks) shows the burst, removed 2.5 s later. No console errors.

## 2026-11-14 — Step 85: mastery criteria and adaptive spacing in "Train your eye" (Claude)
- Owner: a Train set ends when the student is fast and accurate on each kind of question, and missed items come back sooner
  (the reasons and sources are in the private notes, `private/`).
- New components/trainPlan.js (pure): `isMastered` (last 2 answers of a kind both right = spot on or
  close, and given within `fastSec`, default 12 s) and `afterAnswer` (a new round of the kind is
  inserted after 2 other rounds on a miss, 3 on a right but slow answer, 5 on a right and fast answer
  when no round of that kind is waiting; none once mastered; cap 2 × the first list = 20 rounds).
- TrainShell.jsx: new props `kindOf(round)` and `makeRound(kind, from)`; times each round; the bar
  shows "Round k" + "m of t kinds mastered" (the rule in its tooltip); the end screen says how many
  kinds were mastered, with the rule cited; the end chime / burst now ring when the set is over.
  trainText.js: new texts (EN + FR), citing [@kellman2010] and [@mettler2016].
- Kinds: Spot the centre = mean of skewed data / median / the rest (symmetric mean, mode); Spot the
  spread = "mean + 1 SD" / "which is bigger"; Read the bell = middle points (50, 84, 16 %) / tail points
  (97.5, 2.5, 99.9 %) / 1–2 SD. Each game has `kindOf` and `makeRound` (a missed round comes back as
  the same item with new data; spot.js, spotSpread.js, readBell.js). Texts no longer promise
  "10 rounds" (topics.js cards, the three tours): the first list is still 10 rounds.
- references.js: kellman2010 and mettler2016 added (verify-refs: 33 DOIs, 0 differences).
- Behaviour check: a perfect student still plays exactly 10 rounds; mean over simulated students
  (2000 runs, 3 kinds): 90 % right → 12.4 rounds, 70 % → 15.7, 50 % → 18.8, never more than 20.
  The thresholds are starting values, not tested with real students (see next.md).
- Tested: npm run build; npm run check on the three pages (EN + FR, 2 sizes: no problems, one screen);
  headless Chrome, always answering far from the truth: 20 rounds, "0 of 3 kinds mastered", end screen
  in EN and FR with the cited rule. Small fix found: French plural "1 type sur 2 maîtrisé".

## 2026-11-14 — Step 86: references checked, About page in tabs (Claude)
- Owner: check the citations behind the About page, bring it in line with what the site already does, and redesign it (too much
  text, too much scrolling). The notes behind this step are private (`private/`, local only, since Step 111).
- references.js: 12 works added (alfieri2011, bertsch2007, delmas1999, delmas2005, kluger1996, nesbit2018, paas1992,
  schwartz2004, sundararajan2020, wisniewski2020, wouters2013, yang2021) and hattie2007 removed. verify-refs: 45 DOIs, 0 differences
  (delMas 1999 pages: Crossref error, flagged crossrefOk).
- About page (About.jsx, text.js, index.css), five tabs, deep-linkable with ?tab=: The idea · How it teaches · Experiments · Use and
  cite · Author. "How it teaches" gives each step its sources (collapsed behind "The research"), three principles and "What we do not
  claim". Texts in English and French.
- Tested: npm run build; verify-refs; full npm run check; screenshots of the five tabs, EN and FR, desktop and phone.

## 2026-11-14 — Step 87: Remove "What we do not claim" from About page (Gemini)
- Owner: remove the "Ce que nous n’affirmons pas" ("What we do not claim") block and link from the About page.
- Removed `<aside className="about-claim">` in `src/pages/About.jsx`.
- Removed `claimTitle`, `claim`, and `claimLink` from `ABOUT.en` and `ABOUT.fr` in `src/pages/text.js`.
- Removed `.about-claim` styles from `src/index.css`.
- Tested: `npm run build` passed; `node tools/cite-check.mjs` passed (50 references checked, 0 errors); `npm run check -- about --no-build` passed in English and French at 1366×768 and 390×844 with no problems.



## 2026-11-15 — Step 88: two assistant skills installed in the project: apple-design and graphify (Claude)
- Owner: check whether two skills can be used here (Graphify-Labs/graphify, emilkowalski/skills → apple-design) and install them.
- Checked both first. apple-design: one Markdown file, MIT, no scripts, no network; advice on springs, gestures, reduced motion
  and typography that fits our Motion-based games. Graphify: Apache-2.0 CLI (PyPI `graphifyy` 0.9.109, linked to the GitHub
  repo), parses code locally with tree-sitter, no API key and no telemetry for code-only graphs.
- `.claude/skills/apple-design/` (SKILL.md + the MIT LICENSE). Its one link to a sibling skill (`../animation-performance`)
  is not installed.
- Graphify: `uv` installed with pip (user level), then `uv tool install graphifyy` (CLI in `~/.local/bin`), then
  `graphify install --project --platform windows`. The installer wrote more than the skill: `.claude/skills/graphify/`,
  `.claude/CLAUDE.md`, a "graphify" section at the end of `CLAUDE.md`, and `.claude/settings.json` with PreToolUse hooks
  (Bash|Grep, Read|Glob) and a SessionStart hook that remind Claude to query the graph first. `AGENTS.md` is untouched.
- First graph built with `graphify update .` (code only, no LLM): 1295 nodes, 3269 edges, 53 communities, in `graphify-out/`
  (2.9 MB, gitignored: each machine rebuilds it). No site code changed.
- Tested: `graphify query "where are topic games registered"` returns `src/topics/games.jsx`; `npm run build` passes.
- To remove: `graphify uninstall --purge` (skill, hooks, CLAUDE.md section, graph) and delete `.claude/skills/apple-design/`.

## 2026-11-15 — Step 89 (merged into main in Step 91): design refresh "Lab notebook" (Claude)
- Owner: after a design audit, chose direction A (paper and ink, hairline rules, few cards), motion level 2 (+ physical dots in
  the playgrounds) and a playable Home hero, done so that it is easy to undo: all of it is on this branch only.
- Foundation (`src/index.css`): one token block (7 type sizes, 3 weights + display, 3 surface radii, 3 durations + one curve),
  every literal size / weight / radius / transition mapped onto it; warm paper `--bg`, white sheets `--surface`, flat hairlines
  instead of shadows; gradient cards, coloured top borders, glows, hover lifts and endless pulses removed; press feedback on
  pointer-down; logo 62 → 40 px; text contrast re-checked by script (two colours darkened).
- Pages: `.split` layout (margin column + content) on Home, Topics, topic pages, About (tabs in the margin), References;
  topics and activities as ruled rows; Home hero is playable (hold a button for 2 s: your dot lands among 47 simulated tries,
  labelled as simulated); "How it works" and the end banner removed, texts in `src/pages/text.js` (en + fr).
- Motion: `src/motion.js` (two springs DROP / SETTLE, FADE) replaces eight local settings; `hooks/useSprung.js` replaces
  `useTweened.js` (interruptible spring); page fades and the topic drawing travelling between pages (View Transitions, `App.jsx`,
  `TopicGlyph` `name`); tour hole and ring on springs (`Tour.jsx`); `PlayChart.jsx`: grab offset, soft edges, velocity on release.
- Tested: `npm run build`; full `npm run check` (34 pages × 2 sizes × en / fr): no problems; screenshots of Home, Topics, a topic
  page, About, playground, live calculation, inner clock, quiz looked at in light and dark.
- NOT tested yet: the interactions themselves (holding the hero button, dragging and flicking a dot, the page fade, the tour
  moving between steps), phones for real, and `/topics/mean-median/playground` in French at 1366×768 now scrolls 19 px.
- Not done yet: `context/project.md` (new files, tokens, layout), the uppercase table head of the recap sheets.
- Finished later the same day (Claude, after the first session stopped at the token limit): playground side column tightened (card
  padding, gaps) so `/topics/mean-median/playground` in French fits one screen at 1366×768 again; uppercase table head of the recap
  sheets removed (`.rc-table thead th`); `context/project.md` updated (motion.js, useSprung, tokens, `.split`).
  Interactions tested in headless Chrome with synthetic mouse input (scratch script): holding the hero button 2 s lands a dot and
  gives the gap, a short hold gives the hint; dragging a dot in the playground changes the three centres, a click adds a dot; the
  guided tour moves from step to step; no console errors. Still NOT tested: a real phone (touch lift, latency).
- Owner's review (2026-11-15), comparing old and new side by side: KEEP cards without shadows or gradients (2), the new type scale (3) but
  with the OLD fonts, press feedback (5), no pulses (6), margin column (7), plain recap table head (9), playable hero (10), Home sections
  removed (11), page transitions (12), springs (13), playground dots (14), tour (15). DROP: smaller logo (4) and ruled rows (8). Item 1
  (paper-and-ink colours) was not mentioned: kept for now, to confirm.
- Done: logo back to 62 / 50 / 40 px and `--header-h` 76 / 64 px; old Google Fonts link (Inter 400–700, Fraunces 500 / 600, no italic) and
  `--fw-display` 600 (hero `em` no longer italic: no Fraunces italic is loaded); topics, activities and Home topics are hairline cards
  again (`.rule-list` grid of `li` cards); playground side column tightened again for the taller header. Full `npm run check`: no problems.
- Owner's colour decision (item 1): keep the dark colours; light mode changed from warm paper to a cold white (`--bg` #f6f8fc, bluish greys for
  `--muted` #565c6b, `--border` #dbe1ec, `--hover`, `--grid`, `--axis`; `--text` #12151d). New token `--grain`: a very faint SVG noise
  (feTurbulence data URI, dark specks at alpha ≈ 0.05 in light, white specks ≈ 0.07 in dark) layered on `body` background; white sheets and
  charts cover it, so it only shows on the page background. Checked by screenshot in both modes.
- Colours, second round (owner: light = white with a little cold grey for the page and an almost white header; dark = a little grey page and a
  header slightly darker). New token `--header-bg`; the header gets a hairline under it. Light: `--bg` #eef1f6, `--header-bg` #fbfcfe, sheets stay
  #fff (so charts and panels stand out), `--border` #d8dee9. Dark: `--bg` #17191d (soft cool charcoal, no longer near-black), `--header-bg`
  #0f1013, `--surface` #1f2227 (one step above the page so sheets still read), `--border` #2d3138, `--muted` #a7acb7, `--text` #eef0f4;
  dot outline colours follow the page colour; dark grain 0.07 → 0.05. Order of depth: header darkest (dark) / lightest (light), page,
  sheets lifted from the page in both. Full `npm run check` run. Not merged: the owner wants to compare first.
- Colours, third round (owner: light page whiter, dark page blacker, header edge discreet and more transparent). Light `--bg` #f6f8fc;
  dark `--bg` #101216, `--header-bg` #08090b, `--surface` #1a1d22. New tokens `--header-alpha` (62% light / 55% dark: lower = more
  see-through) and `--header-line` (35% / 45%: strength of the hairline under the header). Checked by screenshot, light and dark.
- Design polish (owner: "a very elegant design, cards in harmony with the background"). Light and dark colours rebuilt as ONE cool hue in three
  steps: page (`--bg`) → card (`--surface`, a half-step lighter, no longer pure white) → inner tile (`--hover`: quiz options, stat tiles,
  chips, a few grey tones lighter than before and in the same hue). Light `--bg` #f5f7fb, `--surface` #fdfdff, `--hover` #eff2f8, `--border`
  #dfe4ee; dark `--bg` #101216, `--surface` #181c22, `--hover` #1e232a, `--border` #252a32. New `--border-strong` (hover edge of a card, thin
  scrollbar thumb). Details: header blur 14 → 26 px (what scrolls under it melts into a soft smear), cards answer the pointer with a
  darker hairline (`.rule-list > li:has(a.row:hover)`), thin tinted scrollbars, `text-wrap: balance` on headings and `pretty` on text,
  font smoothing. End of `src/index.css`, block "Finishing touches". Checked by screenshots (Home, Topics, topic page, playground, quiz,
  game, About) in both modes.

## 2026-11-15 — Step 90 (merged into main in Step 91): style research on learning sites, applied (Claude)
- Owner: "I don't like this style" (the grey tonal one): study the styles of learning / statistics sites and get inspired by them, in a new
  branch. Branch made from `redesign-lab-notebook`, worktree `.claude/worktrees/redesign2/` (node_modules is a junction to the main folder's).
- Research (a script read the public HTML + CSS of ten sites as text and counted fonts, colours and radii; WebFetch alone returns no CSS):
  Brilliant (near-black #141414, yellow #f7c325, periwinkle #7491ff, pink #ff90e0; radii 10–16 px, pills; reading column 640 px, page
  1100–1200 px), Khan Academy (Inter; blue #0069d6; radii 4–8; dark #1b1b1f), Seeing Theory (Brown; Assistant 300–700; a pastel
  tint per chapter: #d6effa #e9f5ed #fef9d4 #fff2e8 #ffe9e7 #fff1f9; radii 20 / 35), Distill (serif, radii 2–3, column ≈ 500 px), Mathigon
  (Source Sans; blue #0f82f2, magenta #cd0e66; purple-tinted dark #22212e), Our World in Data (Lato + Playfair Display, navy #1d3d63 on
  #dbe5f0 / #f0f4fa tints, radii 2–4), rpsychologist (IBM Plex Sans, #fcfcfc / dark #161616, teal accent), Setosa (Lato 100–300),
  3Blue1Brown (Source Serif 4 + Figtree), Duolingo (radii 12–16). Shared traits: one strong accent and neutral ground; a serif for
  headings with a clean sans; ink with a hue (navy / aubergine) not pure black; colour carries the category (Seeing Theory, Brilliant,
  Duolingo); soft 12–20 px corners on the app-like sites, 2–4 px on the editorial ones; a narrow reading column; tinted dark modes.
- Applied (end of `src/index.css`, section "Colour by topic and by step"): every topic has a hue (blue, green, yellow, orange, red, pink:
  `--hue-1..6`, classes `.tint-N` on the cards of Topics and Home), every step keeps its logo colour (`.topic-role-group.is-discover /
  play / train / quiz`); a card = that hue mixed into the card colour (`--tint` 9 % light, 7 % dark, mixed in oklab for dark), with a
  hairline and a number in the same hue; hover thickens the edge in the hue. Ink is now deep navy `--text` #101a30; radii `--r-md` 12,
  `--r-lg` 20; the Home hero sheet has a light blue tint. Fonts unchanged (the owner kept the old ones).
- Tested so far: build; screenshots of Home, Topics, a topic page, in light and dark.
- Owner kept this version, with one change: the themes (topic cards on Home and Topics) must not have different colours. Now all share one
  neutral slate-blue tint (`--hue-neutral` #6f7f9e, `.tint-N` all point to it); the colours per type of game (Discover, Explore, Train,
  Check) inside a theme page stay. `--hue-2..6` removed. Checked by screenshots (Topics, Home, a theme page, light and dark) and
  `npm run check`.

## 2026-11-15 — Step 91: design refresh merged into main (Claude)
- Owner: after comparing old and new side by side on desktop and phones, accepted the design (branch `redesign-learning-sites`, which contains
  `redesign-lab-notebook`) and asked to merge it into `main`. Merge commit `--no-ff`. Contents: Steps 89 (lab-notebook layout, tokens, playable hero,
  springs, page transitions) and 90 (cool white / charcoal palettes, grain, neutral theme cards, step colours), with the owner's choices: old fonts,
  old logo size, cards not ruled rows.
- Before the merge the main folder had uncommitted changes by someone else (the "What we do not claim" block again): saved as a tagged stash and
  a patch, not re-applied (see next.md).
- Tested after the merge: `npm run build`; full `npm run check`.

## 2026-11-15 — Step 92: the Home hero curve adapts to each dot (Claude)
- Owner: the curve of the Home animation should adapt to the dot the visitor drops.
- `src/pages/Home.jsx`: the curve is now the normal curve that fits ALL the dots (47 simulated + the visitor's up to 12): mean and standard
  deviation in columns, area = number of dots (`curvePoints()`), kept inside the chart. It is redrawn at every landing and glides (spring-like,
  14 % of the way per frame, instant with reduced motion) to the new shape inside the soft-sheet loop (`useSoftSheet(svgRef, targetRef, wakeRef)`),
  so it still bends away from the pointer. Late presses shift the peak right and widen the bell; a press at 2 s raises it. Caption (en + fr)
  says the curve refits every dot you add.
- Tested: build; `npm run check -- /`; headless Chrome with real mouse presses (scratch script): peak y 79.1 → 75.1 (2.0 s), → 77.7, 82.7, 86.6 and
  its x 209 → 218 as late and early presses were added; no console errors; screenshot looked at.
- Same step, owner: the starting curve was too full. The simulated bell is now 4 dots high at its peak (was 6.6): 28 simulated dots instead of 47
  (`height()` in Home.jsx; the caption count follows `DOTS.length`). Tested: build, `npm run check -- /`, real presses in headless Chrome (the curve still adapts), screenshot.
- Same step, owner: the Home "Hold for 2 seconds" button (yellow ring on a white fill, thin dark outline) looked off beside the yellow "Start playing" button.
  `.hero-pad` is now a solid ink pill (`--text` on `--bg`, no ring), and turns yellow only while held (`.is-running`, with the thin outline). Tested: build,
  `npm run check -- /`, screenshots idle and held in light and dark.

## 2026-11-15 — Step 93: search in the whole site (Claude)
- Owner: build the search (option 1 of the options given: in-browser index, no server): large scope (topics, games, extras, About, references,
  pages), English and French together, and TRY BOTH places: a button + palette in the header, and a visible field on the topics page; the owner will
  then decide which one to drop.
- `src/search/engine.js` (index of 88 entries: 3 pages, 6 topics, 24 games / extras, 5 About tabs, 50 references; both languages in every entry, so an
  English word finds French content and the other way round; scoring: title 4, keywords 2.2, topic 1.6, description 1; one typo allowed, light stem
  (asymétrie → asymétriques); a citation ranks below the game that cites it), `keywords.js` (synonyms / concept words, EN + FR, per topic, game, kind and
  About tab), `text.js`. UI: `components/Search.jsx`: header button (icon; with "Search" and Ctrl K at ≥ 1000 px), palette (Ctrl/⌘ + K or "/"; arrows, Enter,
  Esc; ARIA combobox; full screen on phones; focus restored on close; reduced motion respected), field on `/topics`. Styles at the end of index.css.
- Phone header: with the new icon it overflowed (+33 px at 390): below 480 px only the language you can switch to is shown (one button), buttons are 32 px,
  below 380 px the logo is 34 px. Measured: no horizontal scroll at 360, 390, 412 px.
- New `tools/search-check.mjs` (run first by `npm run check`): every topic, game and extra found by its own name in EN and FR, and each has keywords. It
  caught three quizzes with no keywords line.
- Tested: engine queries (typo, accents, other language, no result); headless Chrome with real key events: Ctrl+K opens, typing, arrows + Enter navigate, "/"
  opens, Esc closes, no-result text, topics field replaces the plan, Enter opens the first result, no console errors; screenshots EN / FR, light / dark, desktop /
  phone; full npm run check.
- Open decision for the owner: keep the header palette, the topics field, or both.
- Owner's rule added to AGENTS.md (section 4, "Search keywords"): a line in src/search/keywords.js is OBLIGATORY for every new game, topic, extra or About tab (search-check enforces it).

## 2026-11-15 — Step 94: self-hosted fonts and a privacy and legal notice (Claude)
- Owner: after my answer on privacy and cookie rules for a static site (no banner needed; weak point = Google Fonts; a notice naming the publisher and the host
  is wanted), "do what you had recommended for now".
- Fonts: Inter and Fraunces are now served by the site (no request to Google): the four Latin / Latin-ext variable woff2 files (Fraunces keeps its optical-size
  axis) are in `src/assets/fonts/` with their SIL OFL licences, declared by `@font-face` at the top of `src/index.css` (same family names, so no other CSS changed);
  the Google `<link>` and preconnects are gone from `index.html`. `dist/` holds no "googleapis" or "gstatic". Look unchanged (screenshots checked).
- New page `/privacy` (`src/pages/Privacy.jsx`, texts `PRIVACY_PAGE` in `src/pages/text.js`, EN + FR): what stays on the device (4 localStorage choices, no banner needed),
  what happens in the games (nothing leaves the browser), who sees a visit (GitHub as host: IP in its logs; the author sees nothing), rights (GDPR; CNIL), what
  changes if accounts / analytics are added; then the legal notice (mentions légales: publisher Hamza Sabek as a private individual, contact through GitHub issues, host
  GitHub, Inc. with its address, licences). Facts checked against GitHub's privacy statement and against the code (no cookie, no fetch, keys statscool-theme / -lang / -sound / -tour-*).
- `Footer.jsx`: a slim line "Privacy and legal notice · About" under every page except the games (which must fit one screen). `.page` bottom padding 88 → 32 px so pages
  do not grow (the footer fills the rest). About "Use and cite" tab: the privacy card no longer mentions Google and links to the page. Search: `privacy` page entry in `keywords.js` (PAGES); `/privacy` added to the crawl of `tools/check.mjs`.
- Not legal advice: the owner may want his university's data protection officer to read it before wide promotion; a postal address / email can be added to the legal notice if preferred.
- Tested: build; `npm run check` (all pages, EN / FR, desktop / phone); `/privacy` screenshots; search finds the page by "privacy", "cookies", "mentions légales", "RGPD".

## 2026-11-15 — Step 95: the owner's email on the About and privacy pages (Claude)
- Owner: add hamza.sabek.campus@gmail.com to the About page and to the privacy page. About, tab "Author", card "Contact": "…, or write to <mailto link>" (texts `contactAfter`, `contactEnd`);
  /privacy: the legal notice's Contact line names the address and it is a mailto link in "Links" (the "no personal email is published" wording is gone, "no postal address" stays).
  The address is now in the page source, so spam is possible: that was the owner's choice. Tested: build, `npm run check -- about?tab=author privacy`.

## 2026-11-15 — Step 96: search placement decided (Claude)
- Owner decision: keep BOTH the header search (button + palette, Ctrl/⌘ + K or "/") and the visible search field on the topics page. Nothing to remove; the "open decision" of Step 93 is closed. No code change.

## 2026-11-15 — Step 97: header that hides, games with the whole screen, more elegant sounds (Claude)
- Owner: the header should disappear gently on scroll down and in games (games get the space), come back only from a small grey tab, hide again after 2 s; game sounds "more elegant, with some pep".
- `Header.jsx` + `index.css`: the header slides up 60 % and fades (0.8 s, soft easing; none with reduced motion) when scrolling down (after 80 px, 6 px dead zone) and returns on scroll up.
  In a game route (`/topics/:slug/:game`) `<html data-game>` is set: `--header-h` becomes 0 and the header is `position: fixed` (an overlay), so the stage gets the full height; it starts hidden.
  A 56×18 px grey tab (`.header-handle`, top centre) reveals it on hover or tap; it hides again 2 s after the pointer leaves it (also after a tap on touch screens); a press on the game hides it at once; keyboard focus keeps it visible.
  New variable `--header-full` (real header height) next to `--header-h`.
- `sound.js`: bell-like notes (sine + two fast-decaying partials), master low-pass + short quiet echo. `tick` climbs a pentatonic ladder in quick runs (resets after 0.9 s); `right` bright rising fifth + sparkle; `wrong` soft falling two notes (no buzzer); `chime` four-note rising arpeggio. API and when sounds play are unchanged.
- Not yet checked: the guided tour's `headerBottom()` while the header is hidden; the sounds were not heard by me (owner approved them). Tested: build; `npm run check` on quiz, normal-distribution, mean-median (EN/FR, desktop/phone): no problems.

## 2026-11-15 — Step 98 (branch `redesign-frameworks`): CSS frameworks wired in, no visible change yet (Claude)
- Owner: restyle the site with IBM Carbon, UIkit, HiQ and Bootstrap, keeping its colours (navy / blue / sky / sun yellow) and the fluorescent logo colours;
  plan first, then a test branch. Plan approved: one StatsCool look, each kind of element owned by ONE framework, CSS only (no framework JavaScript),
  frameworks in cascade layers so our unlayered CSS always wins, a token bridge, pilot on four pages before the rest.
- Branch `redesign-frameworks`, worktree `.claude/worktrees/redesign3/` (own `npm install`). New exact dependencies: `@carbon/styles` 1.119.0,
  `bootstrap` 5.3.9, `uikit` 3.25.31, `hiq` 4.2.11; dev `sass` 1.108.2, `purgecss` 9.1.0.
- `src/styles/frameworks.scss` loads each framework inside `@layer hiq, bootstrap, uikit, carbon` (HiQ scoped to `.hiq`, controls inside it reverted);
  `_carbon.scss` (no reset, no IBM Plex, no body styles; g10 / g100 tokens), `_bootstrap.scss` (core + buttons, breadcrumb, list group, badge, modal,
  range, switch; no reboot / grid / utilities), `_uikit.scss` (card, off-canvas, subnav, accordion, to-top, tooltip; no base). `src/styles/bridge.css`
  (unlayered) feeds `--bs-*`, `--cds-*`, `--hiq-*` from our tokens.
- Size: the four compiled whole = 521 KB of CSS (Carbon alone 271 KB: each component drags its dependencies). So `tools/frameworks-css.mjs`, a Vite plugin
  serving `virtual:frameworks.css`: Sass compile, then PurgeCSS against `index.html` + `src/**/*.{js,jsx}`, only on the framework CSS (never on ours).
  Framework class names must therefore be written in full in the sources. Result now: 135.6 KB (was 130.6 KB), since almost no framework class is used yet.
- Tested: build; `npm run check` on Home, a topic page, inner clock, quiz, playground, About (desktop + phone): no problems; screenshots compared with
  `main` pixel by pixel: identical (the quiz differs only by its random question).

## 2026-11-15 — Step 99 (branch `redesign-frameworks`): pilot of the framework restyle (Claude)
- What changed for the student (shared pieces, so every page that uses them follows):
  - Switches: every `.segmented` (EN | FR, game views and modes) is a Carbon content switcher. `_carbon.scss` maps our class onto
    Carbon's with Sass @extend, so no game file changed. Drawn as a hairline pill track with a navy pill for the choice; Carbon's
    ::after fill and dividers are off (they sat above plain-text labels). Old `.segmented` rules removed from index.css.
  - Game steps (`Steps` in Stage.jsx): a Carbon progress indicator, with a line on top of each step (navy when done or current). Each
    step has a ring: ✓ when done, a yellow core for "you are here", empty for what comes next. Phones show only the current label.
  - Breadcrumb (new `components/Breadcrumb.jsx`, Bootstrap): "Topics › <topic>" replaces the "← <topic>" back link in every game and
    the back link + eyebrow on topic pages ("Topics › Part 1 · Topic 01").
  - Quiz (`components/Quiz.jsx`): options are Carbon selectable tiles (a check mark at the right marks your pick). The answer shows
    as a Carbon inline notification: a coloured bar and an icon, sky for right, red for not quite. The ✓ / ✗ were taken out of the
    "Right!" / "Juste !" texts (the icon says it). The quiz's coloured score dots are kept: they are the site's dots.
  - Phone menu (new `components/Menu.jsx`): at 700 px or less the header shows logo, search and one menu button. A UIkit off-canvas
    panel slides from the right with Topics / About, the language and two Bootstrap switches (sound, dark mode: yellow when on, navy
    knob). It is rendered in a portal (the header's backdrop blur would trap it). Escape, a tap outside or a link closes it, and focus
    goes into it and back. New COMMON texts (EN / FR): breadcrumb, menu, closeMenu, sound, darkMode, onThisPage.
  - Topic pages (`pages/TopicPage.jsx`): a sticky "On this page" bar (UIkit subnav, pill) with Discover · Explore · Train your eye ·
    Check yourself · References, each with its step colour. The section in view is marked by our own scroll-spy. Buttons, not
    #anchors, because the site uses hash routes. The activity kind ("Game 1", "Free play", ...) is a Carbon tag in its step's colour.
- Supporting changes:
  - `theme.js` / `index.html` also set `data-bs-theme`. The theme hooks follow `<html data-theme>` (MutationObserver), so the header
    and menu switches agree.
  - `tools/check.mjs`: new `--theme=light|dark` option (the screenshot names get the theme).
- Owner's earlier choices kept: cards without shadows (so UIkit cards were NOT applied), rounded corners and pills, Inter + Fraunces,
  no capitals (UIkit subnav's uppercase turned off).
- Size: CSS 170.5 KB (gzip 34.7 KB), was 130.6 KB on main; no framework JavaScript.
- Tested:
  - `npm run build`; full `npm run check`: 35 pages × 2 sizes × EN / FR = 140 views, no problems, every game still one screen on desktop.
  - Screenshots in light and dark (topic page, live calculation, inner clock desktop + phone, quiz, menu).
  - Interactions in headless Chrome (scratch script): the menu opens (bar at right: 0, focus on the close button); the dark switch sets
    data-theme and data-bs-theme; Escape closes the menu; a link navigates and closes it; a quiz answer shows the notification and
    the selected tile; the section bar marks "Train your eye" after a jump.

## 2026-11-16 — Step 100 (branch `redesign-frameworks`): the rectangular look, Carbon + UIkit + a little OpenCode (Claude)
- Owner, after the pilot: "I don't see a lot of changes; the most important thing is the rectangular simple style of Carbon and UIkit,
  use it a lot, especially for cards, buttons...; a style a little like OpenCode".
- Research: opencode.ai photographed in headless Chrome and its computed styles read (scratch script): near-black page, a monospace
  for headings / nav / numbers ("[1] Docs", "01 02 03"), Inter for body text, 0 px corners everywhere, flat rectangles with 1 px
  hairlines (#2e2e2e), solid rectangular buttons (light fill or dark grey with ›), sections split by full-width hairlines with a bold
  monospace label in a left column, bordered grids with shared lines.
- What changed (index.css tokens + `src/styles/bridge.css`, now loaded AFTER index.css so the framework look wins):
  - Shapes: `--r-xs/sm/md/lg/pill` all 0. Cards, buttons, switches, tags, panels, tour and citation bubbles, the search field and the
    phone menu are rectangles; SVG highlight bands and stimulus boxes too (CSS `rx: 0` on `.page svg rect`). Still round: the data
    dots, the step rings, the games' big press buttons (Start, Tap to start), colour swatches, the quiz score dots, the switches' knob.
  - Type: headings in IBM Plex Mono (Carbon's monospace, SIL OFL, self-hosted: `src/assets/fonts/ibm-plex-mono-400/600.woff2` + licence;
    the complete files cover French and the arrows / maths signs). Page titles 400 with tight tracking (OpenCode), section and card titles
    600, body text stays Inter. New token `--font-mono` for labels and numbers (eyebrows, "Part 1", counts, axis ticks, stat values, the
    breadcrumb, tags, tabs). Fraunces is no longer used (its @font-face stays: one token switches back, see the comment on --font-display).
  - Header: OpenCode's numbered links "[1] Topics  [2] About" in the monospace (the number takes the step colour when the page is
    open; the brackets are hidden from screen readers with CSS alt text); the phone menu numbers its links the same way.
  - Buttons (Bootstrap .btn drawn as Carbon buttons): 40 px rectangles (32 small, 48 large); primary = flat yellow with navy text and a
    hairline; secondary = an ink rectangle (light in dark mode, as OpenCode); ghost = text in the link colour (Carbon's ghost button).
  - Cards: UIkit cards (`_uikit.scss` maps `.rule-list > li`, `.qz-card`, `.pg-card`, `.cl-card`, `.rc`, `.hero-sheet` onto `.uk-card
    .uk-card-default` with @extend), drawn flat and square on a hairline; the step tints of Step 90 are kept.
  - Markers: the logo colours as small squares (steps, activities on the topics page, section bar, search results); the four steps on
    Home / About numbered 01-04 in square tinted boxes.
  - Sections split by full-width hairlines (topic page groups, topics page parts, Home sections, references).
  - Switches: Carbon's own rectangular content switcher (hairline edge, hairline dividers, navy fill for the choice).
  - "On this page" bar: Carbon line tabs (hairline under the bar, 2 px under the section in view). About tabs: Carbon vertical tabs
    (a rail with 2 px on the open tab; a line under them on phones). Topics page search field: Carbon text input (filled, line under it).
  - Grids with shared hairlines: the playground's three centres (Mode / Median / Mean), the recap table head (monospace, tinted).
  - Breadcrumb as a path: "Topics / Mean, median and mode" in the monospace. Quiz letters and review marks square; answer keys of
    "Pick a random number" square with monospace digits.
- Texts kept true: About "built" line (EN / FR) now names IBM Carbon, Bootstrap and UIkit and the fonts IBM Plex Mono and Inter; the
  privacy page names Inter and IBM Plex Mono as the self-hosted fonts.
- Licences: `frameworks.scss` starts with a /*! */ notice (Carbon Apache-2.0, Bootstrap / UIkit / HiQ MIT); `vite.config.js` keeps legal
  comments at the end of the built files (`esbuild.legalComments: 'eof'`), so the libraries' own notices ship too (JS +8 KB raw).
- Size: CSS 176.7 KB (gzip 36.2 KB), main 130.6 KB; fonts +93 KB (two Plex Mono weights, loaded only when used).
- Tested: `npm run build`; full `npm run check` (35 pages x 2 sizes x EN / FR: no problems, every game one screen on desktop); `--theme`
  light and dark screenshots of every kind of page (Home, Topics, topic page, About, References, Privacy, 14 games and extras, quiz
  answered, tour bubble, search palette, citation bubble, phone menu); the interaction script again (menu, Escape, dark switch, quiz
  notification, section bar): all as before, no console errors.

## 2026-11-16 — Step 101 (branch `redesign-frameworks`): licences of the frameworks and fonts, always shown (Claude)
- Owner: "make what is necessary so our website always shows the copyright and licence obligations of the frameworks and fonts we recently added".
- What the licences ask:
  - MIT (Bootstrap, UIkit, HiQ, React, React Router, Motion, KaTeX) and ISC (D3): the copyright line and the permission notice travel with the code.
  - Apache 2.0 (IBM Carbon): a copy of the licence, and a notice that we changed the files.
  - SIL OFL 1.1 (Inter, IBM Plex Mono, Fraunces, KaTeX's math fonts): the licence travels with the font files. Before this step it did not:
    the font licences sat in src/assets/fonts and were not part of the built site.
- New `tools/licenses.mjs` (`npm run licenses`):
  - It builds the site in memory and reads what really ships: npm packages in the JavaScript (React + scheduler, React Router, 7 d3-*
    modules, Motion's 4 packages, KaTeX), the font files emitted, and the CSS frameworks whose cascade layer holds rules.
  - It writes `public/licenses/<project>.txt` (served at ./licenses/…; name, packages and versions, licence, "Changes" for the CSS frameworks,
    copyright lines, full licence texts), `public/licenses/THIRD-PARTY-NOTICES.txt` (all in one) and `src/licenses.js` (data of the page).
  - A shipped package with no project in its list stops it. KaTeX ships no licence file for its fonts: their notice is rebuilt from the
    font files' name table (Design Science 2009-2010, Khan Academy 2014-2018, Reserved Font Names KaTeX_*) + the OFL text.
  - `npm run check` now runs `node tools/licenses.mjs --check` (fails if a notice is missing or out of date) and crawls /licences.
- New page /licences (`pages/Licences.jsx`, texts `LICENCES_PAGE` in pages/text.js, EN / FR):
  - Fonts / Styles / Code, one row per project: what it does here, packages and versions, licence, copyright, a link to the full text;
    "Changed by StatsCool" on the CSS frameworks; a link to the file with every notice; StatsCool's own licences (About, Use and cite).
  - It is linked from:
    - the footer of every page except the games (Privacy · Licences · About);
    - the foot of the phone menu (Privacy · Licences);
    - About > Use and cite (new sentence);
    - the privacy page's legal notice ("Licences" entry extended; "Last updated" now 16 November 2026);
    - the search (`keywords.js` PAGES entry).
- CSS: `frameworks.scss` starts with a /*! */ notice; `esbuild.legalComments: 'eof'` keeps it, and the JS libraries' own notices, in the built files.
- HiQ is now really used: the bodies of /licences and /privacy are HiQ prose (class `hiq`). `tools/frameworks-css.mjs` removes HiQ's form,
  meter, dialog and utility rules after PurgeCSS (they were 38 KB of its 49 KB), so HiQ costs 15 KB. `tools/cite-check.mjs` skips the
  generated src/licenses.js (copyright lines looked like hand-typed citations).
- Tested:
  - `npm run licenses` then `--check`; full `npm run check` (36 pages × 2 sizes × EN / FR = 144 views, no problems).
  - Screenshots of /licences, /privacy and About > Use and cite; dist/licenses/ holds the 14 text files.

## 2026-11-16 — Step 102 (branch `redesign-frameworks`): background test for the rectangular look (Claude)
- Owner: before merging, test background colours that fit the new design; search frameworks, repositories and sites and propose some.
- Research:
  - IBM Carbon's themes read from @carbon/themes: white #ffffff / g10 #f4f4f4 / g90 #262626 / g100 #161616, cards #ffffff in g10 and #262626 in g100.
  - UIkit: #fff, muted #f8f8f8, secondary #222. Bootstrap: #fff, dark #212529.
  - Vercel Geist, read from vercel.com/geist/colors in headless Chrome: #ffffff / #fafafa light, #0a0a0a / #000 dark.
  - opencode.ai (measured in Step 100): #0c0c0c, panels #161616, lines #2e2e2e.
  - Tokyo Night (folke/tokyonight.nvim): Night #1a1b26, Storm #24283b. Catppuccin: Latte #eff1f5, Mocha #1e1e2e. GitHub Primer: #0d1117 dark.
- Six options, light and dark, only the neutral tokens change (palette, logo colours, step tints stay):
  StatsCool (today), IBM Carbon (g10 / g100), OpenCode (Geist white / opencode black), Paper (warm), Night blue (Tokyo Night),
  Graph paper (a 24 px grid on the page). File `src/styles/backgrounds.css` (`<html data-bg>`).
- Contrast checked by script: text, muted text and the step colours ≥ 4.5:1, axes ≥ 3:1, on page and cards. The logo pink as text in dark
  mode was 4.37:1 on the Carbon and Night cards: #ff47a2 there (4.8:1).
- TEST picker `components/BgPicker.jsx`: a narrow vertical tab on the left edge, halfway down, on every page. It opens the six options with
  swatches and one line each (EN / FR). The choice is kept in memory only (no new localStorage key, so the privacy page stays true); a
  link can carry one (`#/topics?bg=paper`).
- Tested:
  - Screenshots of Home, a topic page and a game for the 6 options in light and dark (36).
  - Picker in headless Chrome: opens, sets data-bg, body colour changes, Escape closes, kept across pages, back to default.
  - Full `npm run check`: no problems.
- To do once the owner chooses: put the chosen values in index.css (`:root` and `[data-theme='dark']`), delete backgrounds.css and
  BgPicker.jsx (and their two imports), run the check, then merge only on the owner's word.

## 2026-11-16 — Step 103 (branch `redesign-frameworks`): graph paper chosen, the other backgrounds archived, no more lines across the page (Claude)
- Owner: chose the graph background; archive the other ones (they may be used another time); the lines that separate sections are not
  beautiful on the graph background, find another solution; then merge everything into main.
- Graph paper is the default (`src/index.css`): light page #f7f9fc, white sheets #ffffff; dark page #0d1117, sheets #161b22 (with the
  dark greys of Step 102); `--paper-line` (navy 6.5 % light, periwinkle 7.5 % dark) drawn by `body` as a 24 px grid. The grain (`--grain`)
  is gone from the tokens. The test picker and `src/styles/backgrounds.css` are out of the site.
- Archive `design/archive/backgrounds/` (outside src, not built):
  - `backgrounds.css`: StatsCool (the background before this step, written out with its grain), IBM Carbon, OpenCode, Paper (with its
    grain), Night blue, plus the picker's styles and a rule that turns the grid off when an option is on;
  - `BgPicker.jsx`: the picker, graph paper as its default;
  - `README.md`: values, sources, contrast notes, how to make one the default or bring the picker back;
  - `compare-*.jpg`: the Step 102 screenshots of the six options, light and dark.
- Lines across the page replaced. On the grid, a full-width hairline read as a stray grid line. Now:
  - Sections are set apart by space (56-88 px).
  - Every section title is a title block, as on a technical drawing: a white label with a hairline, with its step colour when it has one.
    This covers the topic page groups and references, the Topics page parts, the Home sections, Privacy, Licences and the About tabs.
  - Every list with rows, or group of short texts, lies on an opaque sheet, so its lines are drawn on paper, never on the grid:
    Home's four steps and three facts, About's four steps, teaching rows, three choices, experiments, Use-and-cite cards and its tab
    rail, the Licences list, and the previous / next topic links (now two tiles).
  - The "Start with …" link at the end of Home is a tile. Lines inside cards (recap sheet, search window, phone menu) stay: they sit on paper.
- `postcss` 8.5.32 declared as an exact dev dependency (tools/frameworks-css.mjs imports it; it was only there through Vite and PurgeCSS).
- Tested:
  - Full-page screenshots of Home, Topics, a topic page, the five About tabs, Licences and Privacy, in light and dark; phones (About,
    topic page, Home).
  - Full `npm run check` (36 pages × 2 sizes × EN / FR: no problems; citations, search and licences checks pass).

## 2026-11-16 — Step 104: the framework redesign merged into main (Claude)
- Owner: "then merge all to main". Branch `redesign-frameworks` (Steps 98-103) merged into `main` with a merge commit (`--no-ff`, as in
  Step 91). Main had not moved since the branch started (3556c15), so no conflict.
- What main now has:
  - IBM Carbon, Bootstrap, UIkit and HiQ in cascade layers, trimmed by PurgeCSS, fed by our tokens (src/styles/);
  - the rectangular look (square corners, IBM Plex Mono headings, Carbon buttons and switches, UIkit cards, [1] [2] header links);
  - the breadcrumb, the phone menu, the topic pages' section bar and tags;
  - the /licences page with its generated notices;
  - the graph paper background, with title blocks and sheets instead of lines across the page.
- After the merge: `npm install` in the main folder (new dependencies); full `npm run check` from main: 36 pages × 2 sizes × EN / FR, no
  problems; citations, search and licences checks pass. The licence files came out of git with CRLF line endings on this Windows
  checkout: the licences check ignores line endings (Step 102 fix), and it passed.

## 2026-11-16 — Step 105: logo v3, "labelled bars", with tab and home-screen icons; every logo archived (Claude)
- Owner: a new logo that keeps the originality of the old one, above all its fluorescent colours, adapted to the new design.
- How it was chosen:
  - Round 1 (A tiles, B bars, C keys) and round 2 (owner: "combine the keys and bars logos, give me different logos": H1 key
    chart, H2 labelled bars, H3 stacked chart, H4 badge, H5 keys on an axis, H6 lollipop).
  - Shown on a private comparison page: each logo large and in screenshots of the real header (desktop, phone, light, dark; logo
    swapped in headless Chrome).
  - Owner chose H2 and asked to keep all logos in an archive.
- The logo (H2):
  - The ink "Stats" key (a light key in dark mode), then the four letter keys of the old logo in the same colours and order (pink c
    `#FF2D95`, lime o `#B6FF1A`, cyan o `#12E6FF`, yellow l `#FFF000`). Each is topped by a floating bar of its colour (22, 54, 36,
    70 units), a 5-unit gap apart: a small histogram with its labels.
  - Letters are IBM Plex Mono SemiBold outlines (no font needed); viewBox 576.72 × 155.
  - `design/logo/make_logos.py` (Python + fontTools) writes it and copies it to `src/assets/logo-light.svg` / `logo-dark.svg`.
  - Header.jsx uses the SVGs (5.4 KB each; the PNGs were 31 KB), 186 × 50 attributes; `.brand-logo` 50 px high (40 px ≤ 700 px,
    36 px ≤ 480 px, 32 px ≤ 380 px).
- Icons (the site had none):
  - Tab icon `public/favicon.svg` = `design/logo/statscool-mark.svg`: H2's four keys and bars without letters, on a 32-unit grid with
    whole numbers only, so it stays crisp at 32 and 16 px; transparent, readable on light and dark tabs.
  - `public/favicon-32.png` (fallback) and `public/apple-touch-icon.png` (180 px, H2 with letters on an ink square), rendered from the
    SVGs by `design/logo/rasterize.mjs` (headless Chrome). `index.html` links all three; Vite rewrites them to ./ for the site's base.
- Archive `design/archive/logos/` (README.md tells the story):
  - `v1/`: the owner's first logo (Step 29);
  - `v2/`: Step 67, its SVG sources and the two PNGs the header used until now;
  - `v3-candidates/`: all nine candidates, light + dark, the 2x2 mark of round 1 and its comparison page (links fixed after the move).
- LICENSE-CONTENT.md: the reserved logo files are now the SVGs, the icons, design/logo/ and the archive.
- Tested:
  - `npm run build` (icons at the root of dist/, links rewritten);
  - full `npm run check` (36 pages × 2 sizes × EN / FR: no problems);
  - screenshots of the header (desktop + phone, light + dark, EN + FR); the icons looked at at 16, 32 and 180 px on light and dark.

## 2026-11-16 — Step 106: back to the "keys" logo, a little see-through, and back to the StatsCool background (Claude)
- Owner: "go back to the logo with keys only and make it a little bit transparent; return to the StatsCool theme proposed in the
  comparison." Read as: the logo C (keys, round 1 of Step 105) instead of H2; and the "StatsCool" option of the Step 102 background
  comparison (cool white / charcoal with grain, the site before Step 103) instead of graph paper.
- Logo:
  - `src/assets/logo-light.svg` / `logo-dark.svg` = `keys-light/dark.svg` of the archive (the ink "Stats" key + the four fluorescent letter
    keys, one row, no bars); same files in `design/logo/`. `make_logos.py` now writes `keys(mode)` as the site logo (not run: no Python on
    this machine; the copies are the generator's own earlier output).
  - It is wider than H2 (7.2:1 against 3.7:1), so shown 36 px high (260 px wide) on desktop, 30 / 26 / 22 px on phones (was 50 / 40 / 36 / 32).
  - "A little transparent" = `opacity: 0.86` on `.brand-logo` (CSS, one number to change; the whole image fades as a group, so the letters
    do not show through their keys).
  - The tab and home-screen icons stay H2's (the owner spoke of the logo only).
- Background: the neutral tokens and the grain of `src/index.css` are back to the values of commit a0ea63d (page #f5f7fb / #101216, sheets
  #fdfdff / #181c22, grain on `body`; done by reversing only the colour hunks of the diff, so the Step 105 logo CSS was not touched). The
  grid (`--paper-line`) is gone. Graph paper is archived with its values in `design/archive/backgrounds/README.md`. The title blocks and
  opaque sheets of Step 103 were kept (they read fine without the grid); say if the owner wants the old section lines back.
- Docs: project.md (logo, background), the two archive READMEs.
- Tested: `npm run build`; `npm run check` on Home, Topics and a topic page (no problems); screenshots light and dark, desktop and phone:
  the logo fits the header at 390 px next to search and menu.

## 2026-11-16 — Step 107: accessibility audit (fonts and the rest), no code changed (Claude)
- Owner: "do an audit about accessibility (fonts...)". Audit only; the report is `docs/accessibility-audit.md` (methods, what is good,
  findings H1-H3, M1-M7, L1-L8, a suggested order, and what was NOT tested: real screen reader, real phone with a larger OS text size,
  Windows High Contrast, colour-blindness simulation, a keyboard-only run through every game).
- Measured with throwaway scripts (in the session scratchpad, not in the repo): axe-core 4.10.2 over 36 routes × EN/FR × light/dark ×
  desktop/phone (144 runs); rendered font sizes of every text node; target sizes; 320 px / 200 % / 400 % zoom; WCAG 1.4.12 text spacing;
  reduced-motion emulation; Tab order and focus ring; contrast of the tokens in both themes.
- Main results: no horizontal scroll at 320 px or 400 % zoom, no clipping with the text-spacing override, no animation left with
  reduced motion, text contrast 6:1 or more (muted) and 16:1 (text); 24 of 36 routes clean in axe. To fix, by priority:
  - H1 the page title never changes and nothing announces a new page (no `document.title`, no focus move);
  - H2 root `font-size: 15.5px` ignores the browser's default font size (use `96.875%`);
  - H3 text under 12 px: "Game N" tags 11.2 px with contrast 4.29:1 (fails), KaTeX subscripts 6.6-9.7 px, axis ticks 11.5 px, the
    scale's floor `--fs-xs` 12.1 px;
  - M1 targets under 24 px (header handle 56×18, footer and licences links 20-21 px, Normal plot knobs), M2 no skip link, M3-M7 focus
    cues, 1.2:1 field borders, `role="img"` around focusable knobs, an `<aside>` inside a landmark, one faded formula at 2.17:1.
- `context/next.md`: the order of fixes added to Open items. Waiting for the owner to say which to do.

## 2026-11-16 — Step 108: page title and focus on every page change (accessibility H1) (Claude)
- Owner: "start with the page title and navigation" (finding H1 of the Step 107 audit).
- New `src/hooks/usePageTitle.js`, called in `App.jsx` with the page that is shown:
  - `document.title` = "<the page's h1> · StatsCool" (no repeat when the h1 already says StatsCool, e.g. About); Home keeps the site title,
    now also in French ("StatsCool : les statistiques pour la psychologie et les neurosciences", in a dictionary in the hook file);
    updated on every language change;
  - after a move to another path, focus goes to the new page's h1 (`tabIndex = -1`, `preventScroll`), so a screen reader announces the
    page and keyboard users start at its top. Not on the first load, not for a tab or #section link of the same page, and a language
    change leaves the focus alone. `index.css`: `h1[tabindex="-1"]:focus { outline: none }` (a heading is not a control).
- Tested in headless Chrome (scratch script): Home → Topics → topic → section link (same path: title and focus unchanged) → game → FR
  switch → About → Home in French → unknown address → search palette ("quiz" + Enter): title and focus right each time, scroll at 0; a game
  whose guided tour opens keeps the focus on the tour's button (the tour takes it after the h1). Full `npm run check`: no problems.
- Not done from the audit (next in the list): the root font size, the skip link, small text and targets.

## 2026-11-16 — Step 109: the root font size follows the reader's text-size setting (accessibility H2) (Claude)
- Owner: "fix the root font size" (finding H2 of the Step 107 audit).
- `src/index.css`, `:root`: `font-size: 15.5px` → `font-size: 96.875%` (= 15.5 / 16). At the browser's default of 16 px the page is
  exactly as before (root still 15.5 px, same layout, every game still one screen at 1366×768); a reader who chose a larger default text
  size in the browser, or the text size of Android / iOS, now gets everything bigger (all sizes are in `rem`). Nothing else changed.
- Tested in headless Chrome with the browser's default font set to 16, 20 and 24 px (`Page.setFontSizes`, scratch script): root 15.5 /
  19.4 / 23.3 px; 11 pages (Home, Topics, a topic, 6 games and the quiz, About) at 1366 and 390 px wide: no horizontal scroll; most games
  still one screen at 20 px, the rest (playgrounds, dots, calculation) scroll a little, which is fine at a size the reader chose. Full
  `npm run check`: no problems. Screenshots at 24 px: text, header and the game screen scale.
- Known limit, left for the small-text step: at the largest sizes (24 px default) the SVG charts' text grows but its place is fixed in px
  coordinates, so an axis title can touch the tick numbers (Müller-Lyer chart: "How much too long you made the plain line" over the
  ticks) and the outer tick ("−40%") is clipped. The charts need a little more room under the axis, or labels measured from the text size.

## 2026-11-16 — Step 110: repository audit (security, optimisation, organisation) and plan (Claude)
- Owner: audit the files shared on GitHub that must not be, audit the optimisation of the code and the organisation of files and folders,
  then plan the fixes; and no file about the theoretical rationale may be shared on GitHub.
- The report and the plan are in `private/repo-audit-2026-11-16.md`: a new local-only folder, gitignored (`.gitignore`: `private/`), so the
  audit itself is not published. Nothing else changed in this step.
- Checked: every tracked file and every file ever committed on any branch; a scan of the whole history for keys, tokens, passwords,
  e-mails, phone numbers, local paths; `.gitignore` against what is tracked; the workflow; `npm audit`; the build (sizes, chunks, fonts,
  source maps); files not reached from `main.jsx`; CSS classes never used; the folder structure and the docs.
- Waiting for the owner's decisions before any change (see next.md, "In progress").

## 2026-11-16 — Step 111: the theoretical rationale leaves the public repository (phase A of the Step 110 plan) (Claude)
- Owner's rule: no file about the theoretical rationale of StatsCool may be shared on GitHub; owner's decisions: keep the About tab
  "How it teaches" (public site content), keep the private files on this PC only.
- New local-only folder `private/` (gitignored, never pushed). Moved there and untracked (`git rm --cached`): `context/rationale.md`,
  `docs/learning-science-review.md` (it was listed in .gitignore but still tracked); also `docs/CODE_GUIDE.md` (already untracked). New
  `private/progress-rationale.md`: the original text of progress.md Steps 85-86 and of the learning-science item of next.md.
- Public files rewritten to point to `private/` without describing the rationale: AGENTS.md (sessions, end of step, "Teaching
  claims", and section 5: `private/` is local only, never pushed or quoted; if missing, ask the owner), progress.md Steps 85-86 (code
  changes only), next.md, project.md (folder map), the header comment of src/pages/About.jsx, .gitignore (one `private/` line).
- Not changed (owner's decision): the About tab, its references and its search keywords.
- Next: phase B, the history rewrite (owner gave the go and the noreply address).
- Tested: `npm run build`; `git ls-files private` is empty; `git check-ignore` confirms `private/` is ignored.

## 2026-11-16 — Step 112: history rewritten without the private files, commit e-mail private, old branches deleted (phase B) (Claude)
- Owner: "go ahead", with the GitHub noreply address, for the history purge and the e-mail change decided in Step 110.
- Safety first: full backup of the old history, `D:/Projects/statscool-backups/statscool-before-rewrite-2026-11-16.bundle` (outside the
  repo, verified with `git bundle verify`; restore with `git clone <bundle>`). The stash and `scratch/uncommitted-before-merge.patch`
  saved in `private/`.
- Removed: the 3 worktrees in `.claude/worktrees/` (redesign2's `node_modules` was a junction to the main folder's: only the link was
  removed, the main `node_modules` checked intact), the 3 merged branches `redesign-*` (local and on GitHub), the stash.
- `git filter-branch` on `main` (125 commits): `context/rationale.md`, `docs/learning-science-review.md` and `docs/CODE_GUIDE.md` removed
  from every commit; author and committer e-mail of every commit = `144339427+hamzasabek@users.noreply.github.com`; repo config
  `user.email` set to it for future commits (the global git config was not changed). Then `refs/original` deleted, reflog expired, `gc`.
- Checked before the force-push: same final tree as before (identical tree hash), same 125 commit messages in the same order, no commit
  touches the 3 files, no object of them reachable. Pushed with `--force-with-lease`; GitHub now has only `main`.
- Every commit ID changed: the 7 old IDs quoted in archive/README.md, context/ and design/archive/backgrounds/README.md replaced by the
  new ones (mapped by position, the commit list being one to one). next.md cleaned (finished redesign item, branches, stash, code
  guide and favicon issues); project.md no longer refers to the deleted branch.
- Limits: copies made before today (clones, forks, caches) cannot be recalled; GitHub may serve old commits by their full ID for a while.
  Old versions of progress.md (Steps 85-86 prose) are still in the history, as the owner chose.
- Gemini or any other clone made before today must be re-cloned (or `git fetch && git reset --hard origin/main` on a clean tree).

## 2026-11-16 — Step 113: dependencies: KaTeX patched, HiQ removed, build-only packages moved (phase C) (Claude)
- Owner: "go ahead" with the Step 110 plan.
- Incident while starting this step: removing the `redesign2` worktree in Step 112 had deleted part of the main `node_modules` through
  its junction (git failed only after it started), and the owner's running dev server held `esbuild.exe`. After the owner stopped it,
  `npm ci` restored everything from the lock file. No tracked file was affected. Note: npm 11 now blocks install scripts by default,
  including `ibmtelemetry` (IBM's install telemetry) in the Carbon packages; they stay blocked (not needed for the build).
- `katex` 0.16.11 → 0.16.47 (exact; fixes the `\htmlData` advisory). `npm run check` counts KaTeX errors on every page: none; the live
  calculation's formulas looked at.
- HiQ removed (it pulled 21 of the 22 advisories through its old PostCSS tool chain, for the prose of two pages):
  `frameworks.scss` (no `hiq` layer, notice updated), `bridge.css` (no `--hiq-*`), `tools/frameworks-css.mjs` (no HiQ trimming, no
  postcss import), `tools/licenses.mjs` + `npm run licenses` (public/licenses/hiq.txt gone), the HiQ line of the Licences page (EN, FR).
  Privacy and Licences bodies: class `prose` instead of `hiq`. Checked by script: the computed style (19 properties) of every element of
  both bodies, before and after, light and dark, 1366 and 390 px: 0 differences (our unlayered CSS already set everything HiQ did). HiQ's
  link focus ring replaced by the site's (`.prose a:focus-visible`, index.css).
- `@carbon/styles`, `bootstrap`, `uikit` moved to devDependencies (only compiled at build time); `postcss` removed (no longer imported);
  `"engines": { "node": ">=22" }`.
- `npm audit`: 22 (5 high, 17 moderate) → 1 low: KaTeX's "existing prototype pollution can bypass trust" (needs another prototype
  pollution first; fixed only in KaTeX 0.18.2+ / 0.19, a breaking upgrade; we render only our own formulas, `trust` limited to
  `\htmlClass`). Left as is; a KaTeX 0.19 upgrade can be its own step.
- Built CSS 195 → 181 KB (39 → 37 KB gzip).
- Tested: full `npm run check` (36 pages × 2 sizes × EN/FR, citations, search, licences: no problems).

## 2026-11-16 — Step 114: each page and game loads its own code (phase D) (Claude)
- Owner: "go ahead" with the Step 110 plan. Before: one 1,372 KB JavaScript file (444 KB gzip) with every topic, quiz, text and KaTeX.
- New `src/components/Preloadable.jsx`: `preloadable(() => import(...))` = a lazy component with `.preload()`, rendered directly once its
  file has arrived; `LoadBoundary`: when a file cannot be downloaded (offline, or an old tab after a deploy changed the file names) the
  page shows "This page could not be loaded" + Reload (EN / FR); any other error is thrown on as before.
- `topics/games.jsx`: the 24 games / extras and the recap sheet are preloadable. `App.jsx`: Topics, About, References, Privacy and Licences
  too (Home, the topic page and 404 stay in the main file); `preloadRoute(path)` fetches the next page's file before the View Transition
  starts, so the fade never shows an empty page; `<Suspense>` placeholder `.page-loading` (70vh) only on a first visit straight to a lazy
  page. `usePageTitle`: when the h1 is not there yet (that first visit), waits for it (MutationObserver) to set the title.
- Result (`npm run build`): main JS 1,372 → 395 KB (444 → 131 KB gzip, −71 %); KaTeX + its CSS (261 + 29 KB) only on pages with formulas;
  Motion (147 KB) with the games; each game 5-25 KB; main CSS 181 → 152 KB (KaTeX's CSS moved out). Vite's "chunk larger than 500 kB"
  warning is gone.
- Tested in headless Chrome (scratch scripts): full `npm run check` (36 pages × 2 sizes × EN/FR: no problems); navigation through Home,
  Topics, topic, game, FR, About, 404, search palette: titles and focus right; direct visit to a lazy page: title set, formulas rendered;
  navigation to a game not yet loaded: no placeholder ever shown; chunk blocked (`Network.setBlockedURLs`): the message and Reload button,
  and the next navigation works; guided tours open on lazy games with the focus on their button.

## 2026-11-16 — Step 115: unused CSS and the Fraunces font removed (phase E) (Claude)
- Owner: "go ahead" with the Step 110 plan.
- Unused CSS removed from `src/index.css` after checking each name in the JS / JSX sources and in the class names built in code
  (`is-${…}`, `tint-${…}`): `.back-link` (+ `.topic-head .back-link`), `.btn-icon`, `.btn-danger`, `.btn-row`, `.btn-wrap` (+ `.btn-sm`
  inside it), `.control-count` (also from a selector list in bridge.css), `.legend-item.fit / .real`, and the tokens `--bar`, `--bar-mode`,
  `--mode`, `--miss-soft` (light and dark). The audit's other candidates (`is-center`, `is-spot`, `tint-1`…) are built in code: kept.
  `:not(.btn-danger)` in bridge.css kept (removing it would lower the rules' specificity).
- Fraunces (headings until Step 100) removed: its two `@font-face`, the two woff2 files and its licence, its entry in tools/licenses.mjs
  (`npm run licenses`: 11 projects), its line on the Licences page (EN, FR) and in the search keywords of that page (with HiQ's).
- Not done, on purpose: splitting index.css per page (see next.md: CSS order risk with lazy pages, small gain).
- Result: main CSS 152 → 150 KB (28 KB gzip); dist/ has no Fraunces file.
- Tested: full `npm run check` (36 pages × 2 sizes × EN/FR, citations, search, licences: no problems).
