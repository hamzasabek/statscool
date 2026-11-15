// The site's motion, in one place (Step 89). CSS uses the tokens of index.css (--dur-1 / 2 / 3 and
// --ease-out); everything animated with Motion uses the two springs below.
//
// Rules (from Apple's "Designing fluid interfaces", see .claude/skills/apple-design):
//   - feedback starts on the press, not on the release;
//   - a move starts from where the thing is on screen, and keeps the speed it has (springs do both,
//     so an animation can be interrupted at any time);
//   - no bounce, unless the thing really has momentum (it was dropped or thrown).

// A dot that falls, or is thrown: it arrives with speed, so it bounces a little (damping ratio 0.67).
export const DROP = { type: 'spring', stiffness: 420, damping: 26, mass: 0.9 }

// Everything else that moves to a new place (marks, bars, chips changing order): no bounce
// (critically damped, about 0.4 s).
export const SETTLE = { type: 'spring', stiffness: 250, damping: 32 }

// Appearing and disappearing: a short fade (= --dur-2), no movement.
export const FADE = { duration: 0.18 }
export const INSTANT = { duration: 0 }

// SETTLE as numbers, for values animated by hand (hooks/useSprung.js): ω = √(stiffness / mass).
export const SETTLE_OMEGA = Math.sqrt(SETTLE.stiffness)

// Where a thrown thing comes to rest: its position + project(speed). The decay of a scroll view
// (0.998 per ms is iOS's own; 0.99 stops sooner, so a careful drag is hardly changed).
export const project = (velocity /* px per s */, decay = 0.99) => ((velocity / 1000) * decay) / (1 - decay)

// Past an edge, a dragged thing follows less and less instead of stopping dead.
export const rubberband = (overshoot, dimension, constant = 0.55) =>
  (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
