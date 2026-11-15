import { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useLang, useText } from '../i18n.jsx'
import { search, suggest } from '../search/engine.js'
import { SEARCH } from '../search/text.js'

// The site search. Three pieces share one engine (src/search/engine.js):
//   - SearchProvider: opens the palette with Ctrl/⌘ + K, or "/" outside a text field; holds its state;
//   - SearchButton: the header button that opens the palette;
//   - SearchField: the visible field of the topics page, with its results under it.
// The palette is a combobox (the input keeps the focus; the arrow keys move a highlighted option; Enter opens it).

const SearchContext = createContext({ show: () => {} })
export const useSearchUi = () => useContext(SearchContext)

const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
const typing = (el) => el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))

export function SearchProvider({ children }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !typing(e.target)) {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return (
    <SearchContext.Provider value={{ show: () => setOpen(true) }}>
      {children}
      {open && <Palette onClose={() => setOpen(false)} />}
    </SearchContext.Provider>
  )
}

const Magnifier = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 21 21" />
  </svg>
)

export function SearchButton() {
  const tx = useText(SEARCH)
  const { show } = useSearchUi()
  return (
    <button type="button" className="btn btn-ghost search-btn" aria-label={tx.openAria} title={`${tx.openAria} (${isMac() ? '⌘K' : 'Ctrl K'})`} onClick={show}>
      <Magnifier />
      <span className="search-btn-label">{tx.open}</span>
      <kbd className="search-btn-kbd" aria-hidden="true">
        {isMac() ? '⌘K' : 'Ctrl K'}
      </kbd>
    </button>
  )
}

// What a result looks like (the same in the palette and under the field).
function Body({ r, tx }) {
  return (
    <>
      <span className={`sr-dot is-${r.kind}`} aria-hidden="true" />
      <span className="sr-text">
        <span className="sr-title">{r.title}</span>
        {r.sub && <span className="sr-sub">{r.sub}</span>}
      </span>
      <span className="sr-kind">{tx.kinds[r.kind]}</span>
    </>
  )
}

const useResults = (query, lang, limit) =>
  useMemo(() => (query.trim() ? search(query, lang, limit) : null), [query, lang, limit])

function Palette({ onClose }) {
  const tx = useText(SEARCH)
  const { lang } = useLang()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const closeRef = useRef(null)
  const listId = useId()
  const found = useResults(q, lang, 9)
  const list = found ?? suggest(lang)

  // Focus the field, keep the page from scrolling behind, and give the focus back on close.
  useEffect(() => {
    const before = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    inputRef.current?.focus()
    return () => {
      document.body.style.overflow = overflow
      if (before && document.contains(before)) before.focus()
    }
  }, [])
  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, listId])

  const go = (r) => {
    onClose()
    navigate(r.to)
  }
  function onKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (a + 1) % Math.max(1, list.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (a - 1 + list.length) % Math.max(1, list.length))
    } else if (e.key === 'Enter' && list[active]) {
      e.preventDefault()
      go(list[active])
    } else if (e.key === 'Tab') {
      // Two things can take the focus in the dialog: the field and the close button.
      e.preventDefault()
      ;(document.activeElement === inputRef.current ? closeRef : inputRef).current?.focus()
    }
  }

  return (
    <div className="sr-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sr-panel" role="dialog" aria-modal="true" aria-label={tx.openAria} onKeyDown={onKeyDown}>
        <div className="sr-inputrow">
          <Magnifier />
          <input
            ref={inputRef}
            className="sr-input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={list.length ? `${listId}-${active}` : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder={tx.placeholder}
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setActive(0)
            }}
          />
          <button ref={closeRef} type="button" className="btn btn-ghost btn-sm sr-close" onClick={onClose} aria-label={tx.close}>
            <span aria-hidden="true">Esc</span>
          </button>
        </div>
        {found && found.length === 0 ? (
          <div className="sr-empty">
            <p className="sr-empty-title">{tx.none(q.trim())}</p>
            <p>{tx.noneHelp}</p>
          </div>
        ) : (
          <>
            {!found && <p className="sr-heading">{tx.browse}</p>}
            <ul id={listId} className="sr-list" role="listbox" aria-label={found ? tx.results(found.length) : tx.browse}>
              {list.map((r, i) => (
                <li
                  key={r.id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className={`sr-item${i === active ? ' is-active' : ''}`}
                  onMouseMove={() => i !== active && setActive(i)}
                  onClick={() => go(r)}
                >
                  <Body r={r} tx={tx} />
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="sr-status" aria-live="polite">
          {found ? tx.results(found.length) : ''}
        </p>
        <footer className="sr-foot" aria-hidden="true">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> {tx.keyMove}
          </span>
          <span>
            <kbd>↵</kbd> {tx.keyOpen}
          </span>
          <span>
            <kbd>Esc</kbd> {tx.keyClose}
          </span>
        </footer>
      </div>
    </div>
  )
}

// The field of the topics page. `onActive(true)` tells the page to show the results instead of its lists.
export function SearchField({ onActive }) {
  const tx = useText(SEARCH)
  const { lang } = useLang()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const found = useResults(q, lang, 20)
  const listId = useId()
  useEffect(() => {
    onActive?.(Boolean(q.trim()))
  }, [q, onActive])
  return (
    <div className="sr-field" role="search">
      <label className="sr-fieldrow">
        <Magnifier />
        <input
          className="sr-input"
          type="search"
          aria-label={tx.fieldLabel}
          placeholder={tx.fieldLabel}
          autoComplete="off"
          spellCheck={false}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setQ('')
            else if (e.key === 'Enter' && found?.[0]) navigate(found[0].to)
          }}
        />
        {q && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setQ('')}>
            {tx.clear}
          </button>
        )}
      </label>
      {found && (
        <div className="sr-inline" id={listId}>
          <p className="sr-count" aria-live="polite">
            {found.length ? tx.results(found.length) : tx.none(q.trim())}
          </p>
          {found.length > 0 ? (
            <ul className="sr-list">
              {found.map((r) => (
                <li key={r.id} className="sr-item">
                  <Link to={r.to} className="sr-link">
                    <Body r={r} tx={tx} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="sr-empty-help">{tx.noneHelp}</p>
          )}
        </div>
      )}
    </div>
  )
}
