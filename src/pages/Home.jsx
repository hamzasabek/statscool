import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useLang, useText } from '../i18n.jsx'
import { sfx } from '../sound.js'
import TopicGlyph from '../components/TopicGlyph.jsx'
import { fmtS } from '../topics/normal-distribution/clock.js'
import { firstGamePath, topics } from '../topics/topics.js'
import { HOME } from './text.js'

// Home page (/): what StatsCool is. A hero you can play (a hidden clock: hold a button for what
// feels like 2 seconds, and your try lands as a dot in a bell of simulated tries; near the pointer
// the dots and the curve bend away, like a soft sheet), then the topics, the four learning steps of
// every topic with three short facts, and a link to the first game.

// ---------- Hero figure: the idea of every game, playable ----------
const COLS = 17
const MID = (COLS - 1) / 2
const SIZE = 22 // one dot + gap, in viewBox units
const ROWS = 10 // dots that fit in one column
const X0 = 22
const W = COLS * SIZE + 44
const BASE = ROWS * SIZE + 12
const H = BASE + 34
const TARGET = 2 // seconds
const BIN = 0.125 // seconds per column: the chart goes from 1 s to 3 s
const TOO_SHORT = 0.3 // seconds: a tap, not a hold (the same limit as the inner-clock game)
const MAX_TRIES = 12 // of the student's dots kept on the chart
const FULL_GAME = '/topics/normal-distribution/inner-clock'

// The simulated tries: a bell centred on 2 s with a standard deviation of 2.9 columns (0.36 s),
// in dots per column. Simulated data, labelled as such in the caption.
const height = (c) => 6.6 * Math.exp(-0.5 * ((c - MID) / 2.9) ** 2)
const COUNT = Array.from({ length: COLS }, (_, c) => Math.round(height(c))) // 0 0 1 1 3 4 5 6 7 6 5 4 3 1 1 0 0
const DOTS = []
for (let c = 0; c < COLS; c++) {
  for (let level = 0; level < COUNT[c]; level++) DOTS.push({ c, level })
}
// Drop order: shuffled with a fixed seed (the same every visit), like presses coming in at random.
let seed = 7
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const ORDER = DOTS.map((d, i) => ({ i, k: rand() }))
  .sort((a, b) => a.k - b.k)
  .map((o) => o.i)
// A dot can only land on the dots under it: re-number so each column fills from the bottom up.
const dropAt = new Array(DOTS.length)
const nextLevel = new Array(COLS).fill(0)
ORDER.forEach((di, step) => {
  const { c } = DOTS[di]
  const j = DOTS.findIndex((d) => d.c === c && d.level === nextLevel[c])
  nextLevel[c] += 1
  dropAt[j] = step
})
const DROP_MS = 45
const CURVE_PTS = Array.from({ length: 121 }, (_, i) => {
  const c = -0.5 + (i / 120) * COLS
  return [X0 + (c + 0.5) * SIZE, BASE - height(c) * SIZE]
})
const pathOf = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('')
const CURVE = pathOf(CURVE_PTS)
const cxOf = (c) => X0 + (c + 0.5) * SIZE
const cyOf = (level) => BASE - (level + 0.5) * SIZE
const colOf = (seconds) => Math.round((seconds - TARGET) / BIN) + MID
const TICKS = [1, 1.5, 2, 2.5, 3] // seconds; the whole ones are labelled

// The soft sheet: a point at distance l from the pointer moves away from it by
// PUSH × exp(−l² / 2·REACH²) (a Gaussian bump), and springs back when the pointer leaves.
const PUSH = 24
const REACH = 40
const SPRING = 0.18 // share of the way to the target covered each frame

// The dots are read from the page on every frame (their resting place is in data-x / data-y), so
// the dots the student adds bend like the others.
function useSoftSheet(svgRef) {
  useEffect(() => {
    const svg = svgRef.current
    const curve = svg.querySelector('.hero-curve')
    const offs = new WeakMap() // current displacement of each dot
    const curveOff = CURVE_PTS.map(() => [0, 0])
    let pointer = null
    let raf = 0

    // Moves one displacement towards its target; true while it is still moving.
    const ease = (o, x, y) => {
      let tx = 0
      let ty = 0
      if (pointer) {
        const dx = x - pointer.x
        const dy = y - pointer.y
        const l = Math.hypot(dx, dy) || 1
        const k = PUSH * Math.exp(-(l * l) / (2 * REACH * REACH))
        tx = (dx / l) * k
        ty = (dy / l) * k
      }
      o[0] += (tx - o[0]) * SPRING
      o[1] += (ty - o[1]) * SPRING
      return Math.abs(tx - o[0]) > 0.05 || Math.abs(ty - o[1]) > 0.05
    }
    const frame = () => {
      let moving = false
      for (const c of svg.querySelectorAll('.hero-dot')) {
        const x = Number(c.dataset.x)
        const y = Number(c.dataset.y)
        let o = offs.get(c)
        if (!o) offs.set(c, (o = [0, 0]))
        if (ease(o, x, y)) moving = true
        c.setAttribute('cx', (x + o[0]).toFixed(2))
        c.setAttribute('cy', (y + o[1]).toFixed(2))
      }
      const bent = CURVE_PTS.map(([x, y], j) => {
        if (ease(curveOff[j], x, y)) moving = true
        return [x + curveOff[j][0], y + curveOff[j][1]]
      })
      curve.setAttribute('d', pathOf(bent))
      raf = moving || pointer ? requestAnimationFrame(frame) : 0
    }
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    const toView = (e) => {
      const p = svg.createSVGPoint()
      p.x = e.clientX
      p.y = e.clientY
      return p.matrixTransform(svg.getScreenCTM().inverse())
    }
    const onMove = (e) => {
      pointer = toView(e)
      wake()
    }
    const onLeave = (e) => {
      if (e.type === 'pointerup' && e.pointerType === 'mouse') return
      pointer = null
      wake()
    }
    svg.addEventListener('pointermove', onMove)
    svg.addEventListener('pointerdown', onMove)
    svg.addEventListener('pointerleave', onLeave)
    svg.addEventListener('pointerup', onLeave)
    svg.addEventListener('pointercancel', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      svg.removeEventListener('pointermove', onMove)
      svg.removeEventListener('pointerdown', onMove)
      svg.removeEventListener('pointerleave', onLeave)
      svg.removeEventListener('pointerup', onLeave)
      svg.removeEventListener('pointercancel', onLeave)
    }
  }, [svgRef])
}

// One gesture per try: press and hold the button (or the space bar) for what feels like 2 seconds,
// then let go. No clock is shown while it runs. The try lands as a bright dot in its column, on
// top of the simulated ones; outside 1 to 3 s it cannot be drawn and the text says so.
function HeroClock({ tx }) {
  const svgRef = useRef(null)
  useSoftSheet(svgRef)
  const [tries, setTries] = useState([]) // the student's dots, oldest first: { id, c }
  const [holding, setHolding] = useState(false)
  const [note, setNote] = useState(null) // { kind: 'short' } | { kind: 'off', v } | { kind: 'ok', v }
  const startRef = useRef(null)
  const nextId = useRef(0)

  // `t` is the event's timestamp (the same clock for the press and the release).
  function begin(t) {
    if (startRef.current !== null) return
    startRef.current = t
    setHolding(true)
  }
  function cancel() {
    startRef.current = null
    setHolding(false)
  }
  function end(t) {
    if (startRef.current === null) return
    const v = (t - startRef.current) / 1000
    cancel()
    if (v < TOO_SHORT) {
      setNote({ kind: 'short' })
      return
    }
    const c = colOf(v)
    if (c < 0 || c >= COLS) {
      setNote({ kind: 'off', v })
      return
    }
    sfx.tick() // a try became a dot
    setNote({ kind: 'ok', v })
    const id = nextId.current++
    setTries((list) => {
      let next = [...list, { id, c }]
      // A full column, or too many dots: the oldest one leaves.
      const inCol = next.filter((d) => d.c === c)
      if (COUNT[c] + inCol.length > ROWS) next = next.filter((d) => d !== inCol[0])
      if (next.length > MAX_TRIES) next = next.slice(1)
      return next
    })
  }
  const isKey = (e) => e.key === ' ' || e.key === 'Enter'

  // Each of the student's dots sits on the simulated ones of its column, then on their own earlier ones.
  const stacked = {}
  const yours = tries.map((d) => ({ ...d, level: COUNT[d.c] + (stacked[d.c] = (stacked[d.c] ?? 0) + 1) - 1 }))
  const lastId = tries.length ? tries[tries.length - 1].id : null

  let result = tx.heroIdle
  if (note?.kind === 'short') result = tx.heroShort
  else if (note?.kind === 'off') result = tx.heroOff(fmtS(note.v))
  else if (note?.kind === 'ok') {
    const gap = note.v - TARGET
    result = (
      <>
        <span>
          <strong>{fmtS(note.v)}</strong> {Math.abs(gap) < 0.005 ? tx.heroSpot : tx.heroGap(fmtS(Math.abs(gap)), gap < 0)}
        </span>
        <Link to={FULL_GAME}>{tx.heroMore}</Link>
      </>
    )
  }

  return (
    <figure className="hero-figure">
      <div className="hero-sheet">
        <svg ref={svgRef} className="hero-dots" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={tx.heroAria(DOTS.length)}>
          <line className="hero-target" x1={cxOf(MID)} x2={cxOf(MID)} y1={12} y2={BASE} />
          {DOTS.map((d, i) => (
            <circle
              key={i}
              className="hero-dot"
              cx={cxOf(d.c)}
              cy={cyOf(d.level)}
              data-x={cxOf(d.c)}
              data-y={cyOf(d.level)}
              r={SIZE / 2 - 1.5}
              style={{ animationDelay: `${dropAt[i] * DROP_MS}ms` }}
            />
          ))}
          {yours.map((d) => (
            <circle
              key={`you-${d.id}`}
              className={`hero-dot is-you${d.id === lastId ? ' is-last' : ''}`}
              cx={cxOf(d.c)}
              cy={cyOf(d.level)}
              data-x={cxOf(d.c)}
              data-y={cyOf(d.level)}
              r={SIZE / 2 - 1.5}
            />
          ))}
          <path className="hero-curve" d={CURVE} pathLength="1" style={{ animationDelay: `${DOTS.length * DROP_MS + 250}ms` }} />
          <line className="hero-axis" x1={X0 - 6} x2={X0 + COLS * SIZE + 6} y1={BASE + 0.5} y2={BASE + 0.5} />
          {TICKS.map((s) => (
            <g key={s}>
              <line className="hero-tick" x1={cxOf(colOf(s))} x2={cxOf(colOf(s))} y1={BASE} y2={BASE + (Number.isInteger(s) ? 6 : 4)} />
              {Number.isInteger(s) && (
                <text className="hero-tick-label" x={cxOf(colOf(s))} y={BASE + 24} textAnchor="middle">
                  {tx.sec(s)}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      <div className="hero-play">
        <button
          type="button"
          className={`hero-pad${holding ? ' is-running' : ''}`}
          onPointerDown={(e) => {
            if (e.button !== 0) return
            e.currentTarget.setPointerCapture(e.pointerId) // the release counts even off the button
            begin(e.timeStamp)
          }}
          onPointerUp={(e) => end(e.timeStamp)}
          onPointerCancel={cancel}
          onKeyDown={(e) => {
            if (!isKey(e)) return
            e.preventDefault()
            if (!e.repeat) begin(e.timeStamp)
          }}
          onKeyUp={(e) => {
            if (!isKey(e)) return
            e.preventDefault()
            end(e.timeStamp)
          }}
          onBlur={cancel}
          onContextMenu={(e) => e.preventDefault()}
        >
          {holding ? tx.padHolding : tx.padHold}
        </button>
        <p className="hero-result" aria-live="polite">
          {result}
        </p>
      </div>
      <figcaption>{tx.heroCaption(DOTS.length)}</figcaption>
    </figure>
  )
}

const STEPS = ['discover', 'explore', 'train', 'check'] // one logo colour per learning step

export default function Home() {
  const { lang } = useLang()
  const tx = useText(HOME)
  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero-text">
          <p className="eyebrow">{tx.eyebrow}</p>
          <h1>
            {tx.title} <em>{tx.titleEm}</em>
          </h1>
          <p className="lead">{tx.lead}</p>
          <div className="home-cta">
            <Link to="/topics" className="btn btn-primary btn-lg">
              {tx.start}
            </Link>
            <Link to="/about" className="btn btn-ghost btn-lg">
              {tx.about}
            </Link>
          </div>
        </div>
        <HeroClock tx={tx} />
      </section>

      <section className="home-section split">
        <header className="split-aside">
          <h2>{tx.topicsTitle}</h2>
          <Link to="/topics" className="home-more">
            {tx.topicsMore}
          </Link>
        </header>
        <ol className="rule-list home-topics">
          {topics.map((t, i) => {
            const { title, summary } = t.text[lang]
            return (
              <li key={t.slug}>
                <Link to={`/topics/${t.slug}`} className="row home-topic">
                  <span className="home-topic-num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="home-topic-body">
                    <span className="home-topic-title">{title}</span>
                    <span className="home-topic-game">{summary}</span>
                  </span>
                  <TopicGlyph shape={t.shape} name={`glyph-${t.slug}`} />
                </Link>
              </li>
            )
          })}
        </ol>
      </section>

      {/* The four steps of every topic (the learning path), then three short facts about the site */}
      <section className="home-section split">
        <header className="split-aside">
          <h2>{tx.pathTitle}</h2>
          <p className="lead">{tx.pathLead}</p>
        </header>
        <div className="split-main">
          <ol className="home-path">
            {tx.path.map((s, i) => (
              <li key={s.title} className={`is-${STEPS[i]}`}>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          <ul className="home-why" aria-label={tx.whyTitle}>
            {tx.why.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p className="home-end">
        <Link to={firstGamePath(topics[0])}>{tx.endButton}</Link>
      </p>
    </div>
  )
}
