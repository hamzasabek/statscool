import { Component, lazy } from 'react'
import { frenchTypo, useText } from '../i18n.jsx'

// Code splitting (Step 114): each game, extra, recap sheet and most pages are separate files, downloaded the
// first time they are needed (Home stays in the main file).
//
// preloadable(() => import('./X.jsx')) returns a component with a .preload() method:
//  - App.jsx calls preload() BEFORE a page change (and the View Transition), so the new page is ready and
//    renders at once: no blank frame inside the fade, the h1 is there for usePageTitle.
//  - Once the file has arrived, the component renders the module directly (no Suspense); before that (first
//    visit straight to that address), React.lazy shows the <Suspense> fallback of App.jsx for a moment.
export function preloadable(load) {
  let mod = null
  let pending = null
  const preload = () => {
    pending ??= load().then(
      (m) => (mod = m),
      (err) => {
        pending = null // a later try may succeed (network back)
        throw err
      },
    )
    return pending
  }
  const Lazy = lazy(() => preload().then(() => mod))
  function Preloaded(props) {
    const Loaded = mod?.default
    return Loaded ? <Loaded {...props} /> : <Lazy {...props} />
  }
  Preloaded.preload = preload
  return Preloaded
}

const TEXT = {
  en: {
    title: 'This page could not be loaded',
    text: 'The connection may have dropped, or the site was updated while this tab was open.',
    reload: 'Reload the page',
  },
  fr: frenchTypo({
    title: 'Cette page n’a pas pu être chargée',
    text: 'La connexion a peut-être été coupée, ou le site a été mis à jour pendant que cet onglet était ouvert.',
    reload: 'Recharger la page',
  }),
}

function LoadFailed() {
  const tx = useText(TEXT)
  return (
    <section className="load-failed">
      <h1>{tx.title}</h1>
      <p>{tx.text}</p>
      <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
        {tx.reload}
      </button>
    </section>
  )
}

// The messages browsers give when a dynamic import cannot be fetched (Chrome / Edge, Firefox, Safari).
const isLoadError = (e) =>
  /dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(String(e?.message ?? e))

// Wraps the routes: a page whose file cannot be downloaded (offline, or an old tab after a new deploy, whose
// file names changed) shows LoadFailed instead of a blank page. Any other error is thrown on, as before (a bug
// must not look like a network problem). `resetKey` (the path) clears it on navigation.
export class LoadBoundary extends Component {
  state = { error: null, key: this.props.resetKey }
  static getDerivedStateFromError(error) {
    return { error }
  }
  static getDerivedStateFromProps(props, state) {
    return props.resetKey !== state.key ? { error: null, key: props.resetKey } : null
  }
  render() {
    const { error } = this.state
    if (!error) return this.props.children
    if (isLoadError(error)) return <LoadFailed />
    throw error
  }
}
