import { Link } from 'react-router'
import { useText } from '../i18n.jsx'
import { LICENSES } from '../licenses.js'
import { LICENCES_PAGE } from './text.js'

// /licences: the fonts, styles and code of other authors that the site ships, with their copyright and
// licence, and a link to each full text (public/licenses/, served with the site). The list is generated
// from what the build really contains (tools/licenses.mjs, checked by npm run check): never edit it by hand.
// Texts: LICENCES_PAGE in text.js. The body is reading text (class "prose", index.css).
const KINDS = ['font', 'style', 'code']

export default function Licences() {
  const tx = useText(LICENCES_PAGE)
  return (
    <article className="licences split">
      <header className="split-aside">
        <h1>{tx.title}</h1>
        <p className="lead">{tx.lead}</p>
        <p className="licences-all">
          <a href="licenses/THIRD-PARTY-NOTICES.txt">{tx.all}</a>
        </p>
      </header>
      <div className="licences-body prose">
        {KINDS.map((kind) => {
          const list = LICENSES.filter((p) => p.kind === kind)
          if (!list.length) return null
          return (
            <section key={kind} aria-labelledby={`lic-${kind}`}>
              <h2 id={`lic-${kind}`}>{tx.groups[kind]}</h2>
              <p className="licences-lead">{tx.groupLeads[kind]}</p>
              <ul className="licences-list">
                {list.map((p) => (
                  <li key={p.id} className="licences-item">
                    <div className="licences-head">
                      <h3>
                        <a href={p.url} target="_blank" rel="noreferrer">
                          {p.name}
                        </a>
                      </h3>
                      <span className="licences-licence">{p.licence}</span>
                    </div>
                    {tx.uses[p.id] && <p className="licences-use">{tx.uses[p.id]}</p>}
                    <p className="licences-meta">
                      {p.packages.length ? p.packages.map((x) => `${x.name} ${x.version}`).join(' · ') : tx.fontFiles(p.files)}
                    </p>
                    <p className="licences-copy">
                      {p.copyright.map((c) => (
                        <span key={c}>{c}</span>
                      ))}
                    </p>
                    {p.changed && <p className="licences-changed">{tx.changed}</p>}
                    <a className="licences-text" href={p.file}>
                      {tx.fullText}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
        <section aria-labelledby="lic-own">
          <h2 id="lic-own">{tx.ownTitle}</h2>
          <p>
            {tx.own}
            <Link to="/about?tab=use">{tx.ownLink}</Link>
            {tx.ownAfter}
          </p>
        </section>
      </div>
    </article>
  )
}
