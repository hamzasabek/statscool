import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Route, Routes, useLocation } from 'react-router'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import { SearchProvider } from './components/Search.jsx'
import Home from './pages/Home.jsx'
import Topics from './pages/Topics.jsx'
import About from './pages/About.jsx'
import NotFound from './pages/NotFound.jsx'
import Privacy from './pages/Privacy.jsx'
import References from './pages/References.jsx'
import { GamePage, TopicPage } from './pages/TopicPage.jsx'

// Home = the concept of the site, Topics = the course plan, a page per topic (its games), each
// game, About. Archived pages are in archive/.
//
// Moving between pages: the page shown (`shown`) follows the address one step behind, so the
// browser can photograph the old page, swap, and fade into the new one (View Transitions API;
// timings in index.css, "Moving between pages"). An element with the same `view-transition-name` on
// both pages travels from its old place to its new one: a topic's small curve (TopicGlyph `name`).
// Browsers without the API, and readers who prefer reduced motion, get the new page at once.
function App() {
  const location = useLocation()
  const [shown, setShown] = useState(location)
  const asked = useRef(location) // the last address a swap was started for (effects run twice in dev)

  useEffect(() => {
    if (location === shown || asked.current === location) return
    asked.current = location
    const samePage = location.pathname === shown.pathname // a tab or a #reference: no fade
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (samePage || reduced || !document.startViewTransition) {
      setShown(location)
      return
    }
    const t = document.startViewTransition(() => flushSync(() => setShown(location)))
    // A newer navigation skips this one: that is not an error.
    t.ready.catch(() => {})
    t.finished.catch(() => {})
  }, [location, shown])

  // A new page starts at the top (the router keeps the scroll position otherwise). In a layout
  // effect: it runs inside the swap, so the new page is photographed from its top.
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [shown.pathname])

  return (
    <SearchProvider>
      <Header />
      <main className="page">
        <Routes location={shown}>
          <Route path="/" element={<Home />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/about" element={<About />} />
          <Route path="/references" element={<References />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/topics/:slug" element={<TopicPage />} />
          <Route path="/topics/:slug/:game" element={<GamePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {shown.pathname.split('/').filter(Boolean).length < 3 && <Footer />}
    </SearchProvider>
  )
}

export default App
