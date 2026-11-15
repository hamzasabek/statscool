import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink } from 'react-router'
import { LANGS, useLang, useText } from '../i18n.jsx'
import { COMMON } from '../text.js'
import { PRIVACY_PAGE } from '../pages/text.js'
import { useSoundOn } from '../sound.js'
import { useTheme } from '../theme.js'

// The phone menu (≤ 700 px): one button in the header opens a panel from the right (UIkit off-canvas)
// with the links, the language and two switches (Bootstrap form-switch) for sound and dark mode.
// UIkit's CSS only: opening, closing, Escape and focus are handled here (no UIkit JavaScript).
// The panel is rendered in <body>: the header's backdrop blur would otherwise trap a fixed panel inside it.
const SLIDE_MS = 300 // UIkit's .uk-offcanvas-bar-animation

export default function Menu() {
  const tx = useText(COMMON)
  const legal = useText(PRIVACY_PAGE)
  const { lang, setLang } = useLang()
  const [theme, toggleTheme] = useTheme()
  const [sound, setSound] = useSoundOn()
  const [mounted, setMounted] = useState(false) // in the page
  const [open, setOpen] = useState(false) // slid in (uk-open)
  const button = useRef(null)
  const close = useRef(null)

  function show() {
    setMounted(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)))
  }
  function hide() {
    setOpen(false)
    setTimeout(() => setMounted(false), SLIDE_MS)
    button.current?.focus()
  }
  useEffect(() => {
    if (!mounted) return
    close.current?.focus()
    const onKey = (e) => e.key === 'Escape' && hide()
    window.addEventListener('keydown', onKey)
    document.documentElement.classList.add('uk-offcanvas-page')
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('uk-offcanvas-page')
    }
  }, [mounted])

  return (
    <>
      <button
        ref={button}
        type="button"
        className="btn btn-ghost menu-btn"
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={tx.menu}
        onClick={show}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      {mounted &&
        createPortal(
          <div className="uk-offcanvas-flip menu-root">
            <div
              id="site-menu"
              className={`uk-offcanvas uk-offcanvas-overlay${open ? ' uk-open' : ''}`}
              role="dialog"
              aria-modal="true"
              aria-label={tx.menu}
              onClick={(e) => e.target === e.currentTarget && hide()}
            >
              <div className="uk-offcanvas-bar uk-offcanvas-bar-animation menu-bar">
                <button ref={close} type="button" className="uk-offcanvas-close btn btn-ghost menu-close" aria-label={tx.closeMenu} onClick={hide}>
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
                <nav className="menu-nav" aria-label={tx.nav}>
                  <NavLink to="/topics" onClick={hide}>
                    {tx.navTopics}
                  </NavLink>
                  <NavLink to="/about" onClick={hide}>
                    {tx.navAbout}
                  </NavLink>
                </nav>
                <div className="menu-settings">
                  <p className="menu-label">{tx.language}</p>
                  <div className="segmented" role="group" aria-label={tx.language}>
                    {LANGS.map((l) => (
                      <button key={l} type="button" lang={l} className={l === lang ? 'is-active' : ''} aria-pressed={l === lang} onClick={() => setLang(l)}>
                        {l === 'en' ? 'English' : 'Français'}
                      </button>
                    ))}
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" role="switch" id="menu-sound" checked={sound} onChange={() => setSound(!sound)} />
                    <label className="form-check-label" htmlFor="menu-sound">
                      {tx.sound}
                    </label>
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" role="switch" id="menu-dark" checked={theme === 'dark'} onChange={toggleTheme} />
                    <label className="form-check-label" htmlFor="menu-dark">
                      {tx.darkMode}
                    </label>
                  </div>
                </div>
                <p className="menu-legal">
                  <NavLink to="/privacy" onClick={hide}>
                    {legal.footPrivacy}
                  </NavLink>
                  <NavLink to="/licences" onClick={hide}>
                    {legal.footLicences}
                  </NavLink>
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
