import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import Breadcrumb from '../components/Breadcrumb.jsx'
import cites from 'virtual:cites'
import { keysIn, plainCites } from '../cite.jsx'
import RefList from '../components/RefList.jsx'
import { useLang, useText } from '../i18n.jsx'
import { COMMON } from '../text.js'
import { PARTS, findTopic, topics } from '../topics/topics.js'
import { GAMES, RECAPS } from '../topics/games.jsx'
import TopicGlyph from '../components/TopicGlyph.jsx'
import NotFound from './NotFound.jsx'

// A topic's page (/topics/<slug>): the topic in the margin (title, idea, its small drawing), and next
// to it its activities as ruled rows, grouped by learning step (Discover: one row per game, with the
// experiment behind it and the one idea it teaches; then Explore, Train your eye, Check yourself),
// its recap sheet, its references, and links to the previous and next topics.
// The heading of a group of activities: its role and one line on what it is for.
function RoleHead({ role, extra, kind }) {
  return (
    <div className={`topic-role is-${kind}`}>
      <h2 className="topic-games-title step-dot">
        {role.title}
        {extra && <span className="topic-role-extra"> · {extra}</span>}
      </h2>
      <p className="topic-role-text">{role.text}</p>
    </div>
  )
}

// "On this page": a sticky bar of the page's sections (UIkit subnav, pill style); the section in view is
// marked (our own scroll-spy, no UIkit JavaScript). Buttons, not #anchors: the site uses hash routes.
function SectionBar({ sections }) {
  const tx = useText(COMMON)
  const [now, setNow] = useState(sections[0]?.id)
  useEffect(() => {
    const els = sections.map((x) => document.getElementById(x.id)).filter(Boolean)
    const onScroll = () => {
      const line = window.innerHeight * 0.35
      let cur = els[0]?.id
      for (const el of els) if (el.getBoundingClientRect().top <= line) cur = el.id
      setNow(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [sections.map((x) => x.id).join()]) // eslint-disable-line react-hooks/exhaustive-deps
  const go = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: reduce ? 'auto' : 'smooth' })
  }
  return (
    <nav className="topic-sections" aria-label={tx.onThisPage}>
      <ul className="uk-subnav uk-subnav-pill">
        {sections.map((x) => (
          <li key={x.id} className={`${x.kind ? `is-${x.kind}` : ''}${now === x.id ? ' uk-active' : ''}`}>
            <button type="button" aria-current={now === x.id ? 'location' : undefined} onClick={() => go(x.id)}>
              {x.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// The kind of an activity as a Carbon tag, in its step's colour (Discover pink, Explore lime, …).
const Tag = ({ children }) => (
  <span className="cds--tag cds--tag--gray topic-tag">
    <span className="cds--tag__label">{children}</span>
  </span>
)

export function TopicPage() {
  const { slug } = useParams()
  const { lang } = useLang()
  const tx = useText(COMMON)
  const topic = findTopic(slug)
  if (!topic) return <NotFound />
  const i = topics.indexOf(topic)
  const part = PARTS.findIndex((p) => p.id === topic.part)
  const { title, summary } = topic.text[lang]
  const prev = topics[i - 1]
  const next = topics[i + 1]
  const num = (k) => String(k + 1).padStart(2, '0')
  const kinds = ['play', 'train', 'quiz'].filter((kind) => topic.extras?.some((x) => x.kind === kind))
  const refKeys = [...(cites.topics[topic.slug] ?? []), ...topic.games.flatMap((g) => keysIn(g.text.en.ref))]
  const sections = [
    { id: 'sec-discover', kind: 'discover', label: tx.roles.discover.title },
    ...kinds.map((kind) => ({ id: `sec-${kind}`, kind, label: tx.roles[kind].title })),
    ...(refKeys.length ? [{ id: 'sec-refs', label: tx.references }] : []),
  ]

  return (
    <section className="topic-page split">
      <header className="split-aside topic-head">
        <Breadcrumb items={[{ to: '/topics', label: tx.navTopics }, { label: tx.topicEyebrow(part + 1, num(i)) }]} className="topic-crumbs" />
        <h1>{title}</h1>
        <p className="lead">{summary}</p>
        <TopicGlyph shape={topic.shape} name={`glyph-${topic.slug}`} />
      </header>

      <div className="split-main">
        <SectionBar sections={sections} />
        <section id="sec-discover" className="topic-role-group is-discover">
          <RoleHead role={tx.roles.discover} extra={tx.gamesCount(topic.games.length)} kind="discover" />
          <ol className="rule-list topic-games">
            {topic.games.map((g, k) => {
              // The card is a link: its citations are plain text (no button inside a link).
              const [name, ref, idea] = ['name', 'ref', 'idea'].map((f) => plainCites(g.text[lang][f], lang))
              const inner = (
                <>
                  <span className="topic-game-num">
                    <Tag>{tx.gameN(k + 1)}</Tag>
                  </span>
                  <span className="topic-row-body">
                    <span className="topic-game-name">{name}</span>
                    <span className="topic-game-ref">{ref}</span>
                    <span className="topic-game-idea">{idea}</span>
                  </span>
                  <span className="tl-cta">{g.available ? tx.play : tx.comingSoon}</span>
                </>
              )
              return (
                <li key={g.slug}>
                  {g.available ? (
                    <Link to={`/topics/${topic.slug}/${g.slug}`} className="row topic-row">
                      {inner}
                    </Link>
                  ) : (
                    <div className="row topic-row is-disabled" aria-disabled="true">
                      {inner}
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        </section>

        {/* The extras, grouped by role: Explore (play), Train your eye (train), Check yourself (quiz) */}
        {['play', 'train', 'quiz'].map((kind) => {
          const list = topic.extras?.filter((x) => x.kind === kind) ?? []
          if (!list.length) return null
          const tag = { play: tx.playgroundTag, train: tx.trainTag, quiz: tx.quizTag }[kind]
          return (
            <section key={kind} id={`sec-${kind}`} className={`topic-role-group is-${kind}`}>
              <RoleHead role={tx.roles[kind]} kind={kind} />
              <ul className="rule-list topic-games">
                {list.map((x) => (
                  <li key={x.slug}>
                    <Link to={`/topics/${topic.slug}/${x.slug}`} className="row topic-row">
                      <span className="topic-game-num">
                        <Tag>{tag}</Tag>
                      </span>
                      <span className="topic-row-body">
                        <span className="topic-game-name">{x.text[lang].name}</span>
                        <span className="topic-game-idea">{x.text[lang].idea}</span>
                      </span>
                      <span className="tl-cta">{tx.play}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}

        {RECAPS[topic.slug] && (() => {
          const Recap = RECAPS[topic.slug]
          return <Recap />
        })()}

        {/* APA 7 references of everything this topic cites: its games' cards and its folder's texts */}
        {(() => {
          const keys = refKeys
          if (!keys.length) return null
          return (
            <section id="sec-refs" className="topic-refs" aria-labelledby="topic-refs-title">
              <h2 id="topic-refs-title" className="topic-games-title">
                {tx.references}
              </h2>
              <RefList keys={keys} />
            </section>
          )
        })()}

        <nav className="topic-nav" aria-label={tx.topicNav}>
          {prev ? (
            <Link to={`/topics/${prev.slug}`} className="topic-nav-link is-prev">
              <span>{tx.prevTopic}</span>
              {num(i - 1)} · {prev.text[lang].title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/topics/${next.slug}`} className="topic-nav-link is-next">
              <span>{tx.nextTopic}</span>
              {num(i + 1)} · {next.text[lang].title}
            </Link>
          )}
        </nav>
      </div>
    </section>
  )
}

// A game's page (/topics/<slug>/<game>): the game's component, or 404.
export function GamePage() {
  const { slug, game } = useParams()
  const Game = GAMES[`${slug}/${game}`]
  return Game ? <Game /> : <NotFound />
}
