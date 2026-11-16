# Next steps and ideas

## In progress
Work started but not finished, for whichever AI tool (Claude or Gemini) comes next. Say what is done,
what is left and which files; remove the item once it is committed. (AGENTS.md, section 2.)
- (nothing)

## Open items
- Repository plan (Step 110; report, plan and decisions in `private/repo-audit-2026-11-16.md`, local only): phases A-F done (Steps
  111-116). Left for the owner to decide: G (unit tests for the statistics helpers, ESLint); keep or delete `archive/` (old code, also
  in the git history); keep `.claude/skills/graphify` public (check its licence) or make it local; pin GitHub actions by commit SHA;
  once the "Check every page" workflow has been green a few times, make the deploy wait for it.
- Optional, not done on purpose (Step 115): split `src/index.css` into one CSS file per page / game. With lazy pages their CSS would
  load later and in another order, so rules of equal specificity could start winning differently; the gain is small (main CSS 28 KB
  gzip, cached). Also optional: split `src/pages/text.js` (43 KB, every page's texts) per page.
- Framework restyle (Steps 98-104) not applied yet to: About (Carbon vertical tabs, UIkit accordion), References (Bootstrap list group),
  search palette (Bootstrap modal + list group), playgrounds and live calculations (Carbon tiles, Bootstrap range), Train shell (Carbon
  progress bar), tour and citation bubbles (Carbon popover), icon tooltips (UIkit), Bootstrap-owned buttons.
- "What we do not claim" block: an uncommitted change (2026-11-15, not by Claude) put it back after Step 87 removed it; it was never
  re-applied. Its patch is in `private/stash-premerge-claim-block.patch`; re-add it by hand on the About page if the owner wants it.
- Accessibility fixes (audit of Step 107, `docs/accessibility-audit.md`, owner has not chosen yet). Order: (1) [`document.title` per route + focus
  on the h1 after navigation: DONE, Step 108], [root font-size `96.875%` instead of `15.5px`: DONE, Step 109], a skip link; (2) font floor 13 px, KaTeX scale, "Game N" tag
  contrast (4.29:1), axis ticks, targets under 24 px; (3) focus cues, field borders, `role="img"` around the Normal knobs, the playground
  `<aside>`; (4) text-size control, `forced-colors`; (5) a manual pass with NVDA / VoiceOver and a phone.
- "Tap with the beat" (Step 64) was only tested with synthetic taps in headless Chrome: check the
  click sound and tap timing on a real phone and a laptop (audio output latency, touch latency;
  Bluetooth headphones add ~150 ms and shift the bell). Owner asked for simpler games focused on the
  normal distribution only (Step 64): "Which line is longer?" and signal detection were set aside.
- Test on a real phone (GitHub Pages https://hamzasabek.github.io/statscool/, or locally with
  `npm run dev -- --host`). The Müller-Lyer drag, the dot dragging and the reaction-time taps
  were only tested with an emulated mouse in headless Chrome. Check that the yellow appears
  without delay and tap times feel right on a phone (touch adds latency).
- Live site: https://hamzasabek.github.io/statscool/ (GitHub Pages only, deployed on every push
  to `main`; Netlify removed in Step 22).

- Guided tours on all topics (Steps 40–41). Idea: in topic 01's "bell curve" bubble, draw an example
  bell on the still-empty chart.
- Accounts / progress over time (asked in Step 41, not started): options discussed = progress in
  localStorage only; Supabase (auth + Postgres); Firebase; AWS (Amplify Gen 2 = Cognito + AppSync +
  DynamoDB, or Cognito + API Gateway + Lambda + DynamoDB, region eu-west-3); own backend. Suggested
  plan: a `progress.js` module saving locally first, then an optional account that syncs it. Open
  questions for the owner: cross-device? teachers / classes? users under 15 (consent in France)?

- Sound (Step 67): listen once on real speakers and a phone (volume, timbre; iOS silent switch mutes
  Web Audio). Ideas not done: D sonification (each dot plays a pitch for its value; a "Listen to your
  data" button: hear spread and skew), E read the Stage sentence aloud (speechSynthesis, en / fr).

- About / author (Step 68): add an ORCID iD when the owner has one (bio links + CITATION.cff
  `orcid:`); a Zenodo DOI for the citation (GitHub release + Zenodo integration); bump YEAR in
  About.jsx and CITATION.cff with a new version. Not chosen for now: an "independent project, not an
  official product of Université Paris Nanterre" line, a selected-publications list.

- Citations (Step 70): the owner may want to choose another statistics textbook than Howell (2013)
  (e.g. Field); change `howell2013` in src/references.js and the keys. A full pass on the quizzes'
  and the games' remaining sentences for claims without a source is worth doing topic by topic (the
  named concepts were done in Step 70). Ebbinghaus's own description of the illusion is not cited
  (no verified reference). A Zotero / BibTeX export of src/references.js could be generated for the
  owner.

- Train your eye (Step 71): topics 01–03 have one each (components/TrainShell.jsx). Next: topics 04–06
  (ideas: topic 04 "Order mode, median, mean on a skewed pile", topic 05 "Is it due?" quick bets,
  topic 06 "Luck or not?" from a count), then a mixed-practice mode across topics (interleaving;
  would need its own source, e.g. Rohrer & Taylor, 2007).
  Step 85 added mastery criteria + adaptive spacing to the three Train games (TrainShell). The values
  (2 in a row, 12 s, gaps 2 / 3 / 5, cap 2 × 10 rounds) are starting values, not tested with real
  students: watch whether sessions feel too long, and whether 12 s suits "mean + 1 SD" and "Read the
  bell" (`fastSec` prop per game). Not done: remembering mastery between visits (needs progress.js),
  "Play again" starting with the kinds missed last time.

- Teaching changes not built yet: listed in `private/rationale.md` (local only). The About "How it teaches" tab lists only what
  is built: add a row there when one ships.

## Known issues
- French texts were written by Claude: have a French speaker read them once (tone: "vous").
- Playground (topic 01): the reaction-times scenario already scrolls ~34 px at 1366×768 (long intro
  sentence in the foot), and "free" ~35 px at 1280×720. Not new in Step 61; shorten the texts or the
  stats/challenges column.
- Mean & median: on very small phones (360×640) the page scrolls ~60 px. That is allowed for
  phones, but the illusion figure could shrink further.
- The Step 15–16 issues of the dot-drawing chart (tall stacks overflow, click above a stack,
  thresholds tuned for old column counts) now only concern archived code (`archive/`).

## Topic ideas
- Each topic could get a quiz like topic 01's (Step 55): components/Quiz.jsx is generic, and a
  recap sheet like topic 01's (Step 61, RECAPS in games.jsx). Topic 02 has its playground, live
  calculation and quiz (Step 63) but no recap sheet yet. Topic 03 has its playground and live
  calculation (Step 65) and a quiz (Step 72) but no recap sheet yet.
- Each topic could get a playground like topic 01's (Step 52; topic 02 done in Step 63), e.g.
  topic 03: shape a bell with mean / SD sliders.
- Goal (owner, Step 49): at least 3 games per topic. Done: topic 01 (Müller-Lyer, digit span,
  blue-seven), topic 02 (memory, find the middle, how many dots; Step 62), topic 03 (inner clock, a neuron adds
  up, tap with the beat; Step 64). Each other topic needs 2 more games: see the ideas below for each topic.
- More binomial games suggested in Step 37: can you be random? (switches in 20 "random" H/T
  vs Binomial(19, ½); people switch too often), Asch conformity (conforming answers out of 12,
  Asch's 37 %), Monty Hall (wins out of 10 staying vs switching), change blindness.
- More exponential games suggested in Step 33: roll until six (gambler's fallacy, geometric),
  regular or random? (clock vs neuron, "tap randomly yourself"), the Necker cube (time between
  perceptual flips).
- More right-skew games suggested in Step 26 (owner picked reaction time first): anagram race
  (very long tail), Stroop (two skewed humps, conflict adds slow trials), "don't press on 3"
  (SART: the tail grows as attention drifts), how many dots (a crowd's guesses are skewed).
- More mean/median games suggested in Step 23 (owner picked Müller-Lyer first): Stroop reaction
  times (skewed: mean > median), inner clock with distractions (outliers), Galton's crowd /
  "how many dots?" (the median beats the mean), memory span (the mean can be an impossible
  score), rate the face 1–7 (median for ratings), and seesaw / fair share / find-the-middle
  warm-ups.
- Variance / SD: topic 02 has 3 games since Step 62 (memory, find the middle, how many dots).
  Possible 4th: rod and frame (within- vs between-person spread), match the grey (SD = threshold).
  To check on a real phone: tapping lines (finger width adds scatter) and typing guesses (keyboard
  covering the chart). "How precise is your memory?" was Step 48. "Aim and tap" (Step 47)
  was replaced: the owner found it hard to understand (code in git history, commit 0985a04).
  Other ideas from Steps 46 and 48: rod and frame (Witkin 1948), line bisection / pseudoneglect
  (Bowers & Heilman 1980), Stroop (more variable when incongruent; better for a later topic).
  Older suggestions:
  keep the beat (tapping after the metronome stops: same mean, more spread), match the grey
  (method of adjustment: SD = sensitivity), how many dots (SD grows with numerosity), place the
  number (deviations drawn as literal squares).
- Sampling & the central limit theorem
- Correlation (like rpsychologist.com/correlation: draggable scatter points, slider for r)
- Archived, can come back (see `archive/README.md`): the draw-a-bell lesson, "Shapes of
  distributions", the Home and About pages.

## Possible improvements
- Inner-clock game: a prediction question (less / same / more spread?) was removed in Step 21
  because it sat between the games; it could come back inside the 5 s page, before the first
  press. Let the student pick 10 s instead of 5 s for the second target; pool results of a
  whole class (needs a backend); remember results in localStorage.
- Mean & median: a fins-in round (<—>, looks shorter) to compare two bells on opposite sides
  of the real length; remember results in localStorage.
- Unused CSS tokens left from archived parts: `--bar`, `--bar-mode`, `--mode`, `--real-soft`,
  `--miss-soft`, `.legend-item.fit/.real`.
- (Done in Step 94: fonts are self-hosted.) When accounts, progress sync, analytics, a contact form or research data are added, the privacy page (/privacy) must be rewritten first: legal basis, processor agreement, retention, consent (see Step 94 in progress.md).
