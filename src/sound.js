import { useEffect, useRef, useSyncExternalStore } from 'react'
import { celebrate } from './celebrate.js'

// Feedback sounds for the whole site, synthesised with Web Audio (no audio files).
// One switch in the header turns every sound of the site on or off (saved in localStorage,
// on by default). Three kinds of feedback, used the same way in every game (context/project.md):
//   sfx.tick()  an answer was recorded (it became a dot); says nothing about right or wrong
//   sfx.right() / sfx.wrong(): only where a right answer exists and is already shown on screen
//               (quiz, digit span, reaction time "too early")
//   sfx.chime() a milestone: the next step unlocks, a round ends, a challenge is done
// Rules: no sound between a stimulus and the response of a timed task, no right / wrong in games
// that give no feedback on purpose, none on sliders or drags, one sound for a batch.
// The experiment sounds (the neuron's spikes, the metronome) also follow the switch: isSoundOn().

const KEY = 'statscool-sound'

function load() {
  try {
    return localStorage.getItem(KEY) !== 'off'
  } catch {
    return true
  }
}

let on = load()
const listeners = new Set()

export function isSoundOn() {
  return on
}

export function setSoundOn(v) {
  on = !!v
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    /* not saved, still switched */
  }
  listeners.forEach((f) => f())
  if (on) unlock()
}

function subscribe(f) {
  listeners.add(f)
  return () => listeners.delete(f)
}

// [on, setOn] for a switch (the header's, the neuron game's).
export function useSoundOn() {
  const v = useSyncExternalStore(subscribe, isSoundOn, () => true)
  return [v, setSoundOn]
}

// ---------- Audio context: created and resumed on the first gesture (browsers require one) ----------
let ctx = null
let master = null

function unlock() {
  if (!ctx) {
    const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
    if (!AC) return null
    try {
      ctx = new AC()
    } catch {
      return null
    }
    // dry -> soft low-pass -> out, plus a short, quiet echo that gives a little air (no harsh edges)
    master = ctx.createGain()
    master.gain.value = 0.55
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 5200
    lp.Q.value = 0.4
    master.connect(lp)
    lp.connect(ctx.destination)
    const echo = ctx.createDelay(0.5)
    echo.delayTime.value = 0.13
    const fb = ctx.createGain()
    fb.gain.value = 0.28
    const wet = ctx.createGain()
    wet.gain.value = 0.22
    lp.connect(echo)
    echo.connect(fb)
    fb.connect(echo)
    echo.connect(wet)
    wet.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume?.().catch(() => {})
  return ctx
}

if (typeof window !== 'undefined') {
  const first = () => {
    if (on) unlock()
  }
  window.addEventListener('pointerdown', first, { capture: true, passive: true })
  window.addEventListener('keydown', first, { capture: true })
}

function ready() {
  if (!on || (typeof document !== 'undefined' && document.hidden)) return null
  const c = unlock()
  return c && c.state !== 'closed' ? c : null
}

// One bell-like note: a pure tone plus a quiet 2nd/3rd partial that dies faster (the "glassy" pluck),
// a soft attack and an exponential decay; optional glide to `to` Hz.
function note(c, { f, to, at = 0, dur = 0.2, gain = 0.2, type = 'sine', bright = 0.35 }) {
  const t0 = c.currentTime + 0.005 + at
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  g.connect(master)
  const partials = bright ? [[1, 1, dur], [2, bright, dur * 0.55], [3, bright * 0.35, dur * 0.3]] : [[1, 1, dur]]
  for (const [mult, amp, d] of partials) {
    const osc = c.createOscillator()
    const pg = c.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(f * mult, t0)
    if (to) osc.frequency.exponentialRampToValueAtTime(to * mult, t0 + dur)
    pg.gain.setValueAtTime(amp, t0)
    pg.gain.exponentialRampToValueAtTime(0.0001, t0 + d)
    osc.connect(pg).connect(g)
    osc.start(t0)
    osc.stop(t0 + dur + 0.03)
  }
}

// Throttle per kind, so a batch or two triggers in the same moment play once.
const last = {}
function play(kind, gap, draw) {
  const c = ready()
  if (!c) return
  const now = performance.now()
  if (now - (last[kind] ?? -1e9) < gap) return
  last[kind] = now
  draw(c)
}

// A soft "pop" that rises a little, higher each time in a row (a pentatonic ladder), so a run of
// dots sounds like a small melody instead of the same click.
const LADDER = [784, 880, 988, 1175, 1319, 1568]
let rung = 0
let lastTick = 0
function tick() {
  play('tick', 45, (c) => {
    const now = performance.now()
    rung = now - lastTick < 900 ? (rung + 1) % LADDER.length : 0
    lastTick = now
    note(c, { f: LADDER[rung], dur: 0.14, gain: 0.13, bright: 0.25 })
  })
}

// Right: a bright rising fifth, with a sparkle on top.
function right() {
  play('answer', 150, (c) => {
    note(c, { f: 659, dur: 0.16, gain: 0.15 })
    note(c, { f: 988, at: 0.07, dur: 0.3, gain: 0.15 })
    note(c, { f: 1976, at: 0.07, dur: 0.22, gain: 0.04, bright: 0 })
  })
}

// Wrong: a gentle, low, falling two-note "oh" (never a buzzer).
function wrong() {
  play('answer', 150, (c) => {
    note(c, { f: 330, to: 294, dur: 0.22, gain: 0.16, bright: 0.15 })
    note(c, { f: 247, to: 220, at: 0.1, dur: 0.3, gain: 0.15, bright: 0.12 })
  })
}

// Milestone: a quick rising arpeggio (C major, with the octave) that rings out.
function chime() {
  play('chime', 400, (c) => {
    ;[523, 659, 784, 1047].forEach((f, i) => note(c, { f, at: i * 0.075, dur: i === 3 ? 0.7 : 0.3, gain: i === 3 ? 0.14 : 0.11 }))
    note(c, { f: 2093, at: 0.23, dur: 0.5, gain: 0.03, bright: 0 })
  })
}

// Usage: sfx.tick(), sfx.right(), sfx.wrong(), sfx.chime() (one object, so no local name hides them).
export const sfx = { tick, right, wrong, chime }

// A milestone chime when `count` goes up past one of the thresholds (any rise if none is given):
// useChime(n, MIN_TRIALS, TRIALS) rings when the next step unlocks and when the round is full,
// useChime(done.length) when a challenge is done, useChime(Number(finished)) once at the end.
// Going back (undo, reset, another step) never rings; reaching a threshold again does.
export function useChime(count, ...thresholds) {
  const prev = useRef(count)
  const key = thresholds.join(',')
  useEffect(() => {
    const before = prev.current
    prev.current = count
    if (!(count > before)) return
    if (!thresholds.length || thresholds.some((t) => before < t && t <= count)) chime()
    // The last threshold is the end of the game (or of one of its blocks): a burst of logo colours.
    const end = Math.max(...thresholds)
    if (thresholds.length && before < end && end <= count) celebrate()
  }, [count, key])
}
