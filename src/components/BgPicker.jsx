import { useEffect, useRef, useState } from 'react'
import { frenchTypo, useText } from '../i18n.jsx'
import { useTheme } from '../theme.js'

// TEST ONLY (Step 102, branch redesign-frameworks): a small picker, bottom left, to try six backgrounds
// (src/styles/backgrounds.css) on every page, in light and dark. The choice lives in memory only (no
// localStorage: the privacy page lists the four saved choices), so a reload goes back to StatsCool; a link
// can carry one: …/#/topics?bg=paper. Remove this component and backgrounds.css once the owner has chosen.
const OPTIONS = [
  { id: 'statscool', light: ['#f5f7fb', '#fdfdff'], dark: ['#101216', '#181c22'] },
  { id: 'carbon', light: ['#f4f4f4', '#ffffff'], dark: ['#161616', '#262626'] },
  { id: 'opencode', light: ['#fafafa', '#ffffff'], dark: ['#0c0c0c', '#161616'] },
  { id: 'paper', light: ['#f6f3ec', '#fffdf8'], dark: ['#14120f', '#1d1a16'] },
  { id: 'night', light: ['#e8ebf4', '#f7f8fc'], dark: ['#1a1b26', '#222536'] },
  { id: 'graph', light: ['#f7f9fc', '#ffffff'], dark: ['#0d1117', '#161b22'] },
]
const IDS = OPTIONS.map((o) => o.id)

const TEXT = {
  en: {
    button: 'Background',
    title: 'Try a background',
    note: 'Test: only until you reload the page. The light / dark switch works with each one.',
    names: {
      statscool: ['StatsCool', 'Today’s cool white and charcoal, with a faint grain.'],
      carbon: ['IBM Carbon', 'Gray 10 and Gray 100: Carbon’s own neutral greys.'],
      opencode: ['OpenCode', 'Paper white and near-black, as opencode.ai and Vercel Geist.'],
      paper: ['Paper', 'Warm paper and warm charcoal: the yellow sits softly.'],
      night: ['Night blue', 'Blue-tinted greys that echo the navy, after Tokyo Night.'],
      graph: ['Graph paper', 'A faint square grid on the page, like a lab notebook.'],
    },
  },
  fr: frenchTypo({
    button: 'Fond',
    title: 'Essayer un fond',
    note: 'Test : seulement jusqu’au rechargement de la page. Le bouton clair / sombre marche avec chacun.',
    names: {
      statscool: ['StatsCool', 'Le blanc froid et l’anthracite actuels, avec un léger grain.'],
      carbon: ['IBM Carbon', 'Gray 10 et Gray 100 : les gris neutres de Carbon.'],
      opencode: ['OpenCode', 'Blanc papier et presque noir, comme opencode.ai et Vercel Geist.'],
      paper: ['Papier', 'Papier chaud et anthracite chaud : le jaune s’y pose en douceur.'],
      night: ['Bleu nuit', 'Des gris teintés de bleu qui répondent au bleu marine, d’après Tokyo Night.'],
      graph: ['Papier quadrillé', 'Une fine grille sur la page, comme un cahier de laboratoire.'],
    },
  }),
}

// A link may carry a background: …/#/route?bg=paper (read once, at load).
function fromLink() {
  const q = window.location.hash.split('?')[1]
  const bg = q ? new URLSearchParams(q).get('bg') : null
  return IDS.includes(bg) ? bg : 'statscool'
}

const Swatch = ({ colours }) => (
  <span className="bgp-swatch" aria-hidden="true">
    {colours.map((c) => (
      <i key={c} style={{ background: c }} />
    ))}
  </span>
)

export default function BgPicker() {
  const tx = useText(TEXT)
  const [bg, setBg] = useState(fromLink)
  const [open, setOpen] = useState(false)
  const box = useRef(null)
  const [theme] = useTheme() // the swatch follows light / dark

  useEffect(() => {
    if (bg === 'statscool') delete document.documentElement.dataset.bg
    else document.documentElement.dataset.bg = bg
  }, [bg])
  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !box.current?.contains(e.target)) setOpen(false)
    }
    window.addEventListener('pointerdown', close, true)
    window.addEventListener('keydown', close, true)
    return () => {
      window.removeEventListener('pointerdown', close, true)
      window.removeEventListener('keydown', close, true)
    }
  }, [open])

  const current = OPTIONS.find((o) => o.id === bg)
  return (
    <div className="bgp" ref={box}>
      {open && (
        <div className="bgp-panel" role="dialog" aria-label={tx.title}>
          <p className="bgp-title">{tx.title}</p>
          <p className="bgp-note">{tx.note}</p>
          <ul className="bgp-list">
            {OPTIONS.map((o) => (
              <li key={o.id}>
                <button type="button" className="bgp-option" aria-pressed={o.id === bg} onClick={() => setBg(o.id)}>
                  <Swatch colours={[...o.light, ...o.dark]} />
                  <span className="bgp-name">{tx.names[o.id][0]}</span>
                  <span className="bgp-desc">{tx.names[o.id][1]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button type="button" className="bgp-toggle" aria-expanded={open} aria-label={`${tx.button}: ${tx.names[bg][0]}`} title={tx.title} onClick={() => setOpen(!open)}>
        <Swatch colours={current[theme === 'dark' ? 'dark' : 'light']} />
        <span className="bgp-label">{tx.names[bg][0]}</span>
      </button>
    </div>
  )
}
