import { useText } from '../i18n.jsx'
import { PRIVACY_PAGE } from './text.js'

// /privacy: privacy notice + legal notice (mentions légales). Plain text, two columns on a wide screen
// (title on the left, as on /references). Texts: PRIVACY_PAGE in text.js.
const REPO = 'https://github.com/hamzasabek/statscool'
const GITHUB_PRIVACY = 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement'
const CNIL = 'https://www.cnil.fr/en'
const EMAIL = 'hamza.sabek.campus@gmail.com'

export default function Privacy() {
  const tx = useText(PRIVACY_PAGE)
  return (
    <article className="privacy prose split">
      <header className="split-aside">
        <h1>{tx.title}</h1>
        <p className="lead">{tx.lead}</p>
        <p className="privacy-date">{tx.updated}</p>
      </header>
      <div className="privacy-body prose">
        {tx.sections.map(([title, paras]) => (
          <section key={title}>
            <h2>{title}</h2>
            {paras.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
        ))}
        <section>
          <h2>{tx.legalTitle}</h2>
          <dl className="privacy-legal">
            {tx.legal.map(([term, text]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section>
          <h2>{tx.linksTitle}</h2>
          <ul className="privacy-links">
            <li>
              <a href={GITHUB_PRIVACY} target="_blank" rel="noreferrer">
                {tx.github}
              </a>
            </li>
            <li>
              <a href={CNIL} target="_blank" rel="noreferrer">
                {tx.cnil}
              </a>
            </li>
            <li>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </li>
            <li>
              <a href={`${REPO}/issues`} target="_blank" rel="noreferrer">
                {tx.contact}
              </a>
            </li>
          </ul>
        </section>
      </div>
    </article>
  )
}
