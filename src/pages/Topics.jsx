import { useState } from 'react'
import { Link } from 'react-router'
import { useLang, useText } from '../i18n.jsx'
import { COMMON } from '../text.js'
import { PARTS, topics } from '../topics/topics.js'
import TopicGlyph from '../components/TopicGlyph.jsx'
import { SearchField } from '../components/Search.jsx'

// Topics page (/topics): the course plan. The title stays in the margin; next to it, one heading
// per part (PARTS) and under it the part's topics as ruled rows: the topic's number, its title, one
// sentence, its activities (a dot in the colour of their learning step) and a small drawing.
// Numbers run on across parts.

export default function Topics() {
  const { lang } = useLang()
  const tx = useText(COMMON)
  const [searching, setSearching] = useState(false) // something is typed in the field: its results replace the plan
  return (
    <section className="topics-page split">
      <header className="split-aside">
        <h1>{tx.topicsTitle}</h1>
        <p className="lead">{tx.topicsLead}</p>
      </header>

      <div className="split-main">
        <SearchField onActive={setSearching} />
        {!searching && PARTS.map((part, p) => {
          const { title, lead } = part.text[lang]
          const items = topics.map((t, i) => ({ t, i })).filter(({ t }) => t.part === part.id)
          return (
            <section key={part.id} className={`tl-part${part.soon ? ' is-soon' : ''}`} aria-labelledby={`part-${part.id}`}>
              <p className="tl-part-label">{tx.part(p + 1)}</p>
              <h2 id={`part-${part.id}`}>{title}</h2>
              <p className="tl-part-lead">{lead}</p>
              {items.length > 0 && (
                <ol className="rule-list timeline">
                  {items.map(({ t, i }, j) => (
                    <TopicItem key={t.slug} topic={t} number={i + 1} delay={j} lang={lang} />
                  ))}
                </ol>
              )}
            </section>
          )
        })}
      </div>
    </section>
  )
}

function TopicItem({ topic: t, number, delay, lang }) {
  const { title, summary } = t.text[lang]
  return (
    <li className={`tl-item tint-${(number - 1) % 6 + 1}`} style={{ '--i': delay }}>
      <Link to={`/topics/${t.slug}`} className="row tl-link">
        <span className="tl-node" aria-hidden="true">
          {String(number).padStart(2, '0')}
        </span>
        <span className="tl-body">
          <span className="tl-title">{title}</span>
          <span className="tl-summary">{summary}</span>
          <span className="tl-games">
            {t.games.map((g) => (
              <span key={g.slug} className={`tl-act step-dot is-discover${g.available ? '' : ' is-soon'}`}>
                {g.text[lang].name}
              </span>
            ))}
            {t.extras?.map((x) => (
              <span key={x.slug} className={`tl-act step-dot is-${x.kind}`}>
                {x.text[lang].name}
              </span>
            ))}
          </span>
        </span>
        <TopicGlyph shape={t.shape} name={`glyph-${t.slug}`} />
      </Link>
    </li>
  )
}
