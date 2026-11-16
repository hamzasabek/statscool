import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Route, Routes, useLocation } from 'react-router'
import Footer from './components/Footer.jsx'
import { LoadBoundary, preloadable } from './components/Preloadable.jsx'
import Header from './components/Header.jsx'
import { SearchProvider } from './components/Search.jsx'
import { usePageTitle } from './hooks/usePageTitle.js'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'
import { GamePage, TopicPage } from './pages/TopicPage.jsx'
import { GAMES, RECAPS } from './topics/games.jsx'

// Pages other than Home, the topic pages and 404 are their own files, fetched when first needed (Step 114).
const Topics = preloadable(() => import('./pages/Topics.jsx'))
const About = preloadable(() => import('./pages/About.jsx'))
const References = preloadable(() => import('./pages/References.jsx'))
const Privacy = preloadable(() => import('./pages/Privacy.jsx'))
const Licences = preloadable(() => import('./pages/Licences.jsx'))
const PAGES = { topics: Topics, about: About, references: References, privacy: Privacy, licences: Licences }

// Fetch the file(s) a path needs (a page, a game, a topic's recap sheet); resolves at once if there is none.
function preloadRoute(path) {
  const [first, slug, game] = path.split('/').filter(Boolean)
  const lazy = first === 'topics' && game ? GAMES[`${slug}/${game}`] : first === 'topics' && slug ? RECAPS[slug] : PAGES[first]
  return lazy ? lazy.preload() : Promise.resolve()
}

// Home = the concept of the site, Topics = the course plan, a page per topic (its games), each
// game, About. Archived pages are in archive/.
//
// Moving between pages: the page shown (`shown`) follows the address one step behind, so the
// browser can photograph the old page, swap, and fade into the new one (View Transitions API;
// timings in index.css, "Moving between pages"). An element with the same `view-transition-name` on
// both pages travels from its old place to its new one: a topic's small curve (TopicGlyph `name`).
// Browsers without the API, and readers who prefer reduced motion, get the new page at once.
// The new page's file is fetched first (preloadRoute), so the swap never shows an empty page.
function App() {
  const location = useLocation()
  const [shown, setShown] = useState(location)
  const asked = useRef(location) // the last address a swap was started for (effects run twice in dev)

  useEffect(() => {
    if (location === shown || asked.current === location) return
    asked.current = location
    const samePage = location.pathname === shown.pathname // a tab or a #reference: no fade
    // A failed download is shown by LoadBoundary when the page renders: go on either way.
    preloadRoute(location.pathname)
      .catch(() => {})
      .then(() => {
        if (asked.current !== location) return // a newer navigation took over while the file came
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        if (samePage || reduced || !document.startViewTransition) {
          setShown(location)
          return
        }
        const t = document.startViewTransition(() => flushSync(() => setShown(location)))
        // A newer navigation skips this one: that is not an error.
        t.ready.catch(() => {})
        t.finished.catch(() => {})
      })
  }, [location, shown])

  // A new page starts at the top (the router keeps the scroll position otherwise). In a layout
  // effect: it runs inside the swap, so the new page is photographed from its top.
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [shown.pathname])

  usePageTitle(shown.pathname)

  return (
    <SearchProvider>
      <Header />
      <main className="page">
        <LoadBoundary resetKey={shown.pathname}>
          <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
            <Routes location={shown}>
              <Route path="/" element={<Home />} />
              <Route path="/topics" element={<Topics />} />
              <Route path="/about" element={<About />} />
              <Route path="/references" element={<References />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/licences" element={<Licences />} />
              <Route path="/topics/:slug" element={<TopicPage />} />
              <Route path="/topics/:slug/:game" element={<GamePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </LoadBoundary>
      </main>
      {shown.pathname.split('/').filter(Boolean).length < 3 && <Footer />}
    </SearchProvider>
  )
}

export default App
