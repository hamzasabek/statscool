import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useText } from '../../i18n.jsx'
import { usePrefersReducedMotion, useSprung } from '../../hooks/useSprung.js'
import { DROP, FADE, INSTANT, SETTLE, project, rubberband } from '../../motion.js'
import { listOf, mean, median, modes, snap } from './play.js'
import { PLAY } from './playText.js'

// The playground's dot plot. A new dot falls exactly like a press in the inner-clock game (topic 03):
// a plain yellow dot falls from the top of the chart and springs onto its stack (same spring, same
// size), and the newest one is ringed. The dots behave like things you can hold (Step 89):
//   - tap empty space → a new dot falls into that column
//   - drag a dot → it stays under the pointer exactly where it was grabbed (on a touch screen it floats
//     a little above the finger), with a tick on the axis where it will land; past the ends of the
//     axis it follows less and less instead of stopping dead
//   - let go → the dot keeps the speed of the hand and springs into its column from where it is; a
//     flick carries it further (it lands where that speed would take it); the dots it left settle
//   - tap a dot without moving it → it pops away
//   - the markers follow: the mode's column(s) fade in and out, the median (dashed) and the mean
//     (line + ▲ balance point) spring to their new places (and stay under the hand while dragging)
// Values snap to the scenario's step, so equal values stack in a column. Keyboard: ← → move (the dot
// slides to its new column), Delete removes.
//   dots: [{ id, v }]   sc: the scenario   lastId: the dot to ring   onAdd(v)   onMove(id, v, done)
//   trim   : a 20 % trimmed mean to draw as a dotted line (or undefined)
//   centres: { mean, median, modes } when they come from other values than the dots drawn (grouped
//            measurements: the dots show the groups, the centres use the exact values)
//   onRemove(id)
//   Overlay: optional component drawn instead of the three centres (another topic's marks, e.g. the
//            mean ± SD of topic 02). It gets { xOf, top, base, plotL, plotR, size, r, placed, cy,
//            values, dragging, ROW, M } and `overlayProps`; it is drawn under the dots.

const M = { top: 10, right: 16, bottom: 44, left: 16 }
const ROW = 15
const POP = { duration: 0.18, ease: 'easeIn' }
const STRETCH_X = 36 // how far a dot can be pulled past an end of the axis, in px
const STRETCH_Y = 30
const RECENT = 100 // ms of the pointer's path that give the speed at release
const STILL = 60 // ms without moving before the release: the hand had stopped, no throw
const MAX_SPEED = 4000 // px per s

// Past [lo, hi], the value follows less and less (a soft edge).
const soft = (v, lo, hi, stretch) => (v < lo ? lo - rubberband(lo - v, stretch) : v > hi ? hi + rubberband(v - hi, stretch) : v)

// The pointer's speed at release, from the last RECENT ms of its path.
function speedOf(trail, now) {
  const last = trail[trail.length - 1]
  if (!last || now - last.t > STILL) return { vx: 0, vy: 0 }
  const first = trail.find((p) => last.t - p.t <= RECENT)
  const dt = (last.t - first.t) / 1000
  if (dt <= 0) return { vx: 0, vy: 0 }
  const cap = (v) => Math.max(-MAX_SPEED, Math.min(MAX_SPEED, v))
  return { vx: cap((last.x - first.x) / dt), vy: cap((last.y - first.y) / dt) }
}

export default function PlayChart({ dots, sc, fmt, lastId, centres, trim, onAdd, onMove, onRemove, Overlay, overlayProps }) {
  const tx = useText(PLAY)
  const reduced = usePrefersReducedMotion()
  const wrapRef = useRef(null)
  const svgRef = useRef(null)
  const drag = useRef(null) // { id, x0, y0, gx, gy, lift, moved, trail }
  const focusAfter = useRef(null) // a dot moved with the keyboard keeps the focus in its new place
  const landed = useRef(new Set()) // the dots that have already fallen once: they slide from now on
  const [dragPos, setDragPos] = useState(null) // { id, x, y }: the centre of the dot being dragged
  const [thrown, setThrown] = useState(null) // { id, vx, vy }: the speed handed to the dot just released
  const [topId, setTopId] = useState(null) // the last dot held is drawn above the others
  const [{ width, height }, setSize] = useState({ width: 640, height: 320 })

  useLayoutEffect(() => {
    const el = wrapRef.current
    setSize({ width: el.clientWidth, height: el.clientHeight })
    const ro = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const [lo, hi] = sc.domain
  const cols = Math.round((hi - lo) / sc.step) + 1
  const plotW = Math.max(200, width - M.left - M.right)
  const colW = plotW / cols
  const xOf = (v) => M.left + ((v - lo) / sc.step + 0.5) * colW
  const vOf = (x) => snap(lo + ((x - M.left) / colW - 0.5) * sc.step, sc)
  const H = Math.max(140, height) // never taller than its box (it would cover what is below)
  const base = H - M.bottom
  const top = M.top + 3 * ROW + 8
  const values = dots.map((d) => d.v)
  const dragging = dragPos !== null

  // Stack the dots per value, in the order they were added (the dragged dot keeps no slot).
  const levels = {}
  const placed = dots.map((d) => (d.id === dragPos?.id ? { ...d, level: 0 } : { ...d, level: (levels[d.v] = (levels[d.v] ?? 0) + 1) - 1 }))
  const cap = Math.max(3, ...Object.values(levels).map((c) => c + 1)) // room for the tallest stack and one more dot
  const size = Math.min(colW, (base - top) / cap, 26)
  const r = Math.max(2.5, size / 2 - 0.75) // as in the inner-clock game: the dots of a stack touch
  const cy = (level) => base - (level + 0.5) * size

  const n = values.length
  const mo = centres?.modes ?? modes(values)
  const exactMean = centres?.mean ?? mean(values)
  const exactMedian = centres?.median ?? median(values)
  // The mean and the median spring to their new places (and follow at once while dragging).
  const [m, md] = useSprung([exactMean, exactMedian], { immediate: dragging || n < 1 })

  const local = (e) => {
    const box = svgRef.current.getBoundingClientRect()
    return [e.clientX - box.left, e.clientY - box.top]
  }
  function hit(x, y) {
    let best = null
    let bestD = Math.max(r + 6, 14)
    for (const p of placed) {
      const d = Math.hypot(xOf(p.v) - x, cy(p.level) - y)
      if (d <= bestD) {
        best = p
        bestD = d
      }
    }
    return best
  }
  function onPointerDown(e) {
    if (e.button !== 0) return
    const [x, y] = local(e)
    if (y > base + 30 || x < M.left - 4 || x > M.left + plotW + 4) return
    const p = hit(x, y)
    e.preventDefault()
    if (!p) {
      onAdd(vOf(x))
      return
    }
    svgRef.current.setPointerCapture(e.pointerId)
    drag.current = {
      id: p.id,
      x0: x,
      y0: y,
      // where the dot was grabbed, so it does not jump to the pointer; a finger hides the dot: lift it
      gx: x - xOf(p.v),
      gy: y - cy(p.level),
      lift: e.pointerType === 'touch' ? Math.max(r * 1.5, 14) : 0,
      moved: false,
      trail: [],
    }
  }
  // The centre of the held dot for a pointer at (x, y): 1 to 1 inside the chart, softer past its edges.
  const heldAt = (d, x, y) => ({
    x: soft(x - d.gx, M.left, M.left + plotW, STRETCH_X),
    y: soft(y - d.gy - d.lift, top + r, base - r, STRETCH_Y),
  })
  function onPointerMove(e) {
    const d = drag.current
    if (!d) return
    const [x, y] = local(e)
    if (!d.moved && Math.hypot(x - d.x0, y - d.y0) < 5) return
    d.moved = true
    d.trail = [...d.trail.slice(-11), { x, y, t: e.timeStamp }]
    setDragPos({ id: d.id, ...heldAt(d, x, y) })
    onMove(d.id, vOf(x - d.gx), false)
  }
  function release(e, canThrow) {
    const d = drag.current
    if (!d) return
    drag.current = null
    setDragPos(null)
    if (!d.moved) {
      onRemove(d.id)
      return
    }
    const x = local(e)[0] - d.gx
    const { vx, vy } = canThrow && !reduced ? speedOf(d.trail, e.timeStamp) : { vx: 0, vy: 0 }
    setTopId(d.id)
    setThrown({ id: d.id, vx, vy })
    onMove(d.id, vOf(x + project(vx)), true) // a flick lands where its speed carries it
  }
  // The speed is handed over once, to the animation that starts with the release.
  useEffect(() => {
    if (thrown) setThrown(null)
  }, [thrown])

  function onDotKey(e, p) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const v = snap(p.v + (e.key === 'ArrowRight' ? sc.step : -sc.step), sc)
      focusAfter.current = { id: p.id, v }
      onMove(p.id, v, true)
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      onRemove(p.id)
    }
  }

  useEffect(() => {
    for (const d of dots) landed.current.add(d.id)
    if (focusAfter.current === null) return
    const { id, v } = focusAfter.current
    svgRef.current?.querySelector(`[data-dot="${id}"][data-v="${v}"]`)?.focus()
    focusAfter.current = null
  })

  const every = Math.max(1, Math.ceil(cols / Math.max(2, Math.floor(plotW / 46))))
  const ticks = Array.from({ length: cols }, (_, k) => lo + k * sc.step).filter((_, k) => k % every === 0)
  const labelX = (x) => Math.min(M.left + plotW - 34, Math.max(M.left + 34, x))
  // Drawing order: the dot in the hand (then the last one held) on top. Same elements, moved in the page.
  const above = dragPos?.id ?? topId
  const ordered = [...placed.filter((p) => p.id !== above), ...placed.filter((p) => p.id === above)]

  return (
    <div ref={wrapRef} className="chart-fill" data-tour="chart">
      <MotionConfig reducedMotion="user">
        <svg
          ref={svgRef}
          className={`chart pg-chart${dragging ? ' is-dragging' : ''}`}
          width={width}
          height={H}
          role="group"
          aria-label={tx.chartAria(n)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => release(e, true)}
          onPointerCancel={(e) => release(e, false)}
        >
          <rect className="pg-hit" x={M.left} y={top - 6} width={plotW} height={base - top + 36} rx="10" />

          {Overlay && (
            <Overlay {...overlayProps} xOf={xOf} top={top} base={base} plotL={M.left} plotR={M.left + plotW} size={size} r={r} placed={placed} cy={cy} values={values} dragging={dragging} ROW={ROW} M={M} />
          )}

          {/* Mode: its column(s) fade in and out */}
          <AnimatePresence>
            {!Overlay &&
              mo.map((v) => (
                <motion.rect
                  key={`mode-${v}`}
                  className="ds-mode-col"
                  x={xOf(v) - colW / 2 + 1}
                  width={colW - 2}
                  y={top}
                  height={base - top}
                  rx="6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={FADE}
                />
              ))}
          </AnimatePresence>

          {n > 0 && !Overlay && (
            <g pointerEvents="none">
              <line className="ds-mark-line is-median" x1={xOf(md)} x2={xOf(md)} y1={top - 2} y2={base} />
              <line className="ds-mark-line is-mean" x1={xOf(m)} x2={xOf(m)} y1={top - 2} y2={base} />
              <path className="ds-fulcrum" d={`M${xOf(m)},${base + 1}l-7,10h14z`} />
              {Number.isFinite(trim) && (
                <>
                  <line className="ds-mark-line is-trim" x1={xOf(trim)} x2={xOf(trim)} y1={top + 14} y2={base} />
                  <text className="pg-trim-label" x={xOf(trim) + 5} y={top + 12}>
                    {tx.trimMark}
                  </text>
                </>
              )}
              <text className="ds-mark-label is-mode" x={labelX(mo.length ? xOf((mo[0] + mo[mo.length - 1]) / 2) : xOf(md))} y={M.top + 11} textAnchor="middle">
                {mo.length ? tx.markMode(listOf(mo, fmt, tx.and)) : tx.noModeMark}
              </text>
              <text className="ds-mark-label is-median" x={labelX(xOf(md))} y={M.top + 11 + ROW} textAnchor="middle">
                {tx.markMedian(fmt(exactMedian))}
              </text>
              <text className="ds-mark-label is-mean" x={labelX(xOf(m))} y={M.top + 11 + 2 * ROW} textAnchor="middle">
                {tx.markMean(fmt(exactMean))}
              </text>
            </g>
          )}

          {!n && (
            <text className="ck-empty" x={M.left + plotW / 2} y={(top + base) / 2} textAnchor="middle">
              {tx.chartEmpty}
            </text>
          )}

          <line className="axis-line" x1={M.left} x2={M.left + plotW} y1={base} y2={base} />
          {ticks.map((v) => (
            <text key={v} className="tick-label" x={xOf(v)} y={base + 26} textAnchor="middle" pointerEvents="none">
              {fmt(v, true)}
            </text>
          ))}

          {/* One element per dot, for its whole life: it falls from the top when it is new, stays
              under the pointer while it is held, and springs to its place from wherever it is (with
              the hand's speed when it was just released). A removed dot pops away. */}
          <AnimatePresence>
            {ordered.map((p) => {
              const held = p.id === dragPos?.id
              const cx = held ? dragPos.x : xOf(p.v)
              const y = held ? dragPos.y : cy(p.level)
              let spring = landed.current.has(p.id) ? SETTLE : DROP
              if (held) spring = INSTANT
              else if (thrown?.id === p.id) spring = { ...DROP, cx: { ...DROP, velocity: thrown.vx }, cy: { ...DROP, velocity: thrown.vy } }
              return (
                <motion.circle
                  key={p.id}
                  data-dot={p.id}
                  data-v={p.v}
                  className={`ck-dot is-a pg-dot${p.id === lastId || held ? ' is-last' : ''}${held ? ' is-held' : ''}`}
                  initial={{ cx: xOf(p.v), cy: M.top, r, opacity: 0 }}
                  animate={{ cx, cy: y, r, opacity: 1 }}
                  exit={{ opacity: 0, r: 0, transition: POP }}
                  transition={spring}
                  tabIndex={0}
                  role="button"
                  aria-label={tx.dotLabel(fmt(p.v))}
                  onKeyDown={(e) => onDotKey(e, p)}
                />
              )
            })}
          </AnimatePresence>

          {/* While dragging: where the dot will land */}
          {dragging && (
            <line className="pg-landing" x1={xOf(vOf(dragPos.x))} x2={xOf(vOf(dragPos.x))} y1={base - 4} y2={base + 6} pointerEvents="none" />
          )}
        </svg>
      </MotionConfig>
    </div>
  )
}
