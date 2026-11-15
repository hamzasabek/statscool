import { useEffect, useRef, useState } from 'react'
import { SETTLE_OMEGA } from '../motion.js'

const QUERY = '(prefers-reduced-motion: reduce)'

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia?.(QUERY).matches ?? false)
  useEffect(() => {
    const mq = window.matchMedia?.(QUERY)
    if (!mq) return
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

const list = (v) => (Array.isArray(v) ? v : [v])
const finite = (v) => typeof v === 'number' && Number.isFinite(v)
const canFollow = (a, b) => a.length === b.length && a.every(finite) && b.every(finite)

/**
 * A number, or an array of numbers, that follows `target` like a spring with no bounce (SETTLE in
 * motion.js). It has no fixed duration: a new target bends the movement that is under way and keeps
 * its speed, so it can be interrupted at any moment (a tween would start again from a standstill).
 * Jumps straight to the target when `immediate` is true (while dragging: the mark must stay under
 * the finger), when the user prefers reduced motion, or when the shape of the value changes
 * (a different array length, a NaN).
 */
export function useSprung(target, { immediate = false } = {}) {
  const reduced = usePrefersReducedMotion()
  const [value, setValue] = useState(target)
  // x: where each number is now, v: its speed, span: how far it had to go (to know when it has arrived)
  const s = useRef(null)
  if (s.current === null) s.current = { x: list(target), v: list(target).map(() => 0), goal: list(target), span: [], raf: 0, last: 0 }
  const isArray = Array.isArray(target)
  // Compare by content, so a new array with the same numbers doesn't restart anything.
  const key = list(target).join(',')

  useEffect(() => {
    const st = s.current
    const goal = list(target)
    if (immediate || reduced || !canFollow(st.x, goal)) {
      cancelAnimationFrame(st.raf)
      st.raf = 0
      st.x = goal
      st.v = goal.map(() => 0)
      st.goal = goal
      setValue(target)
      return
    }
    st.goal = goal
    st.span = goal.map((g, i) => Math.max(Math.abs(g - st.x[i]), st.span[i] ?? 0, 1e-9))
    if (st.raf) return // already moving: it now heads for the new goal, at the speed it has
    st.last = performance.now()
    const W = SETTLE_OMEGA
    const frame = (now) => {
      const dt = Math.min(0.064, Math.max(0, (now - st.last) / 1000))
      st.last = now
      const decay = Math.exp(-W * dt)
      let moving = false
      // The exact solution of a critically damped spring over dt: stable whatever the frame rate.
      st.x = st.x.map((x, i) => {
        const d = x - st.goal[i]
        const c = st.v[i] + W * d
        const nx = st.goal[i] + (d + c * dt) * decay
        st.v[i] = (st.v[i] - c * W * dt) * decay
        if (Math.abs(nx - st.goal[i]) > 0.001 * st.span[i] || Math.abs(st.v[i]) > 0.001 * st.span[i] * W) moving = true
        return nx
      })
      if (!moving) {
        st.x = st.goal
        st.v = st.goal.map(() => 0)
        st.span = []
        st.raf = 0
      } else st.raf = requestAnimationFrame(frame)
      setValue(isArray ? st.x : st.x[0])
    }
    st.raf = requestAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, immediate, reduced])

  // Stop when the component goes away (not on each new target: the movement must carry on).
  useEffect(
    () => () => {
      cancelAnimationFrame(s.current.raf)
      s.current.raf = 0
    },
    [],
  )

  return value
}
