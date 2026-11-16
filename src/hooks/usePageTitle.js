import { useEffect, useRef } from 'react'
import { frenchTypo, useLang, useText } from '../i18n.jsx'

// Single-page app accessibility (WCAG 2.4.2 Page Titled, 4.1.3 Status Messages; audit of Step 107):
//  - the tab title names the page: "<the page's h1> · StatsCool" ("/" keeps the site title);
//  - after a move to another page, focus goes to its h1, so a screen reader announces the new page and
//    keyboard users start at its top instead of on the link they clicked. Not on the first load (the browser
//    already announces the page), not when only a tab or a #reference changes (same path), not on a language
//    change (the title is updated, the focus stays where it is).
// The h1 takes focus with tabIndex -1: it is not a tab stop, and its focus ring is off (index.css).
const DICT = {
  en: { site: 'StatsCool: statistics for psychology and neuroscience' },
  fr: frenchTypo({ site: 'StatsCool : les statistiques pour la psychologie et les neurosciences' }),
}

export function usePageTitle(pathname) {
  const tx = useText(DICT)
  const { lang } = useLang()
  const last = useRef(null) // the path of the previous run; null before the first one

  useEffect(() => {
    const moved = last.current !== null && last.current !== pathname
    last.current = pathname
    const apply = (h1) => {
      const name = h1?.textContent.trim()
      document.title = pathname === '/' || !name ? tx.site : name.includes('StatsCool') ? name : `${name} · StatsCool`
      if (moved && h1) {
        h1.tabIndex = -1
        h1.focus({ preventScroll: true })
      }
    }
    const h1 = document.querySelector('main h1')
    apply(h1)
    if (h1) return
    // The page's file is still downloading (first visit straight to a game or page, Step 114): wait for its h1.
    const main = document.querySelector('main')
    if (!main) return
    const watch = new MutationObserver(() => {
      const found = main.querySelector('h1')
      if (!found) return
      watch.disconnect()
      apply(found)
    })
    watch.observe(main, { childList: true, subtree: true })
    return () => watch.disconnect()
    // tx changes with the language only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, lang])
}
