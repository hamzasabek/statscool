import { ABOUT } from '../pages/text.js'
import { REFS } from '../references.js'
import { topics } from '../topics/topics.js'
import { ABOUT_KW, KIND_KW, KW, PAGES } from './keywords.js'

// The search of the whole site, in the browser (no server, no library: the index is a few hundred
// short entries). Every entry holds its title, description and keywords in BOTH languages, so a
// student on the French site can type an English word and the other way round. Words are compared
// without accents or capitals; every typed word must be found (as a whole word, a beginning of a
// word, a part of a word, or with one typo); titles weigh more than keywords, keywords more than
// descriptions.
//
// An entry: { id, kind, to, title: {en, fr}, sub: {en, fr}, topic?: {en, fr} (the topic of a game),
// fields: [[weight, [words]]…] }. `kind` is one of page, topic, discover, play, train, quiz, about, ref.

const LANGS = ['en', 'fr']
const W = { title: 4, kw: 2.2, topic: 1.6, topicKw: 0.9, sub: 1 }

// "Écart-type", "ŒIL" → "ecart type", "oeil"
export const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
const words = (s) => norm(s).split(' ').filter(Boolean)
// A citation token in a text ("[@repp2005]", "@miller1956") is not searchable text.
const plain = (s) => String(s ?? '').replace(/\[[^\[\]]*@[^\[\]]*\]/g, '').replace(/@[a-z][a-z-]*\d{4}[a-z]?/g, '').replace(/\s+/g, ' ').trim()
const both = (get) => Object.fromEntries(LANGS.map((l) => [l, get(l)]))

const ENTRIES = []
function add(e) {
  const fields = [
    [W.title, e.title.en + ' ' + e.title.fr],
    [W.kw, (e.kw?.en ?? '') + ' ' + (e.kw?.fr ?? '')],
    [W.sub, (e.snippet?.en ?? '') + ' ' + (e.snippet?.fr ?? '')],
  ]
  if (e.topic) fields.push([W.topic, e.topic.en + ' ' + e.topic.fr])
  if (e.topicKw) fields.push([W.topicKw, e.topicKw.en + ' ' + e.topicKw.fr])
  ENTRIES.push({
    id: e.id,
    kind: e.kind,
    to: e.to,
    title: e.title,
    sub: e.sub ?? e.snippet,
    topic: e.topic,
    titleNorm: norm(e.title.en) + ' | ' + norm(e.title.fr),
    fields: fields.map(([w, t]) => [w, [...new Set(words(t))]]),
  })
}

// ---------- Pages ----------
for (const p of PAGES) add({ id: `page-${p.id}`, kind: 'page', to: p.to, title: p.title, sub: p.sub, snippet: p.sub, kw: p.kw })

// ---------- Topics, games and extras ----------
for (const t of topics) {
  const tt = both((l) => t.text[l].title)
  const tkw = KW[t.slug]
  add({ id: `topic-${t.slug}`, kind: 'topic', to: `/topics/${t.slug}`, title: tt, sub: both((l) => t.text[l].summary), snippet: both((l) => t.text[l].summary), kw: tkw })
  const item = (a, kind) =>
    add({
      id: `${t.slug}/${a.slug}`,
      kind,
      to: `/topics/${t.slug}/${a.slug}`,
      title: both((l) => a.text[l].name),
      sub: tt,
      snippet: both((l) => plain(a.text[l].idea) + ' ' + plain(a.text[l].ref)),
      topic: tt,
      kw: {
        en: `${KW[`${t.slug}/${a.slug}`]?.en ?? ''} ${KIND_KW[kind].en}`,
        fr: `${KW[`${t.slug}/${a.slug}`]?.fr ?? ''} ${KIND_KW[kind].fr}`,
      },
      topicKw: tkw,
    })
  for (const g of t.games) if (g.available) item(g, 'discover')
  for (const x of t.extras ?? []) item(x, x.kind)
}

// ---------- About: one entry per tab ----------
for (const tab of ['idea', 'teaching', 'experiments', 'use', 'author']) {
  add({
    id: `about-${tab}`,
    kind: 'about',
    to: `/about?tab=${tab}`,
    title: both((l) => ABOUT[l].tabs[tab]),
    sub: both((l) => ABOUT[l].title),
    snippet: both((l) => ABOUT[l].title),
    kw: ABOUT_KW[tab],
  })
}

// ---------- References: one entry per work ----------
const family = (r) => {
  const f = r.authors.map((a) => a[0])
  return f.length === 1 ? f[0] : f.length === 2 ? `${f[0]} & ${f[1]}` : `${f[0]} et al.`
}
for (const [key, r] of Object.entries(REFS)) {
  const t = `${family(r)} (${r.year})`
  add({
    id: `ref-${key}`,
    kind: 'ref',
    to: `/references#ref-${key}`,
    title: { en: t, fr: t },
    sub: { en: r.title, fr: r.title },
    snippet: { en: r.title, fr: r.title },
    kw: { en: `${r.authors.map((a) => a[0]).join(' ')} ${r.year} ${r.journal ?? ''}`, fr: '' },
  })
}

// ---------- Matching ----------
// Edit distance ≤ 1 (one letter added, removed or changed).
function near(a, b) {
  if (a === b) return true
  const d = a.length - b.length
  if (d > 1 || d < -1) return false
  let i = 0
  let j = 0
  let miss = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++
      j++
    } else {
      if (++miss > 1) return false
      if (d > 0) i++
      else if (d < 0) j++
      else {
        i++
        j++
      }
    }
  }
  return miss + (a.length - i) + (b.length - j) <= 1
}

// How well one typed word matches one field (0 = not at all).
function wordScore(q, ws) {
  let best = 0
  for (const w of ws) {
    let s = 0
    if (w === q) s = 1
    else if (w.startsWith(q)) s = q.length >= 2 ? 0.8 : 0.3
    else if (q.length >= 6 && w.startsWith(q.slice(0, -1))) s = 0.7 // asymétrie → asymétrique, standardised → standardised
    else if (q.length >= 4 && w.includes(q)) s = 0.5
    else if (q.length >= 5 && w.length >= 4 && near(q, w)) s = 0.45
    else if (q.length >= 5 && w.length >= 5 && near(q, w.slice(0, q.length))) s = 0.4
    if (s > best) best = s
    if (best === 1) break
  }
  return best
}

const KIND_BOOST = { topic: 0.6, discover: 0.4, play: 0.3, train: 0.3, quiz: 0.3, page: 0.2, about: 0.1, ref: 0 }

function score(e, tokens, q) {
  let total = 0
  for (const t of tokens) {
    let best = 0
    for (const [w, ws] of e.fields) {
      const s = wordScore(t, ws) * w
      if (s > best) best = s
    }
    if (!best) return 0 // every typed word must be found
    total += best
  }
  if (e.titleNorm.startsWith(q) || e.titleNorm.includes(` | ${q}`)) total += 3 // the title starts with what was typed
  return (total + KIND_BOOST[e.kind]) * (e.kind === 'ref' ? 0.6 : 1) // a citation comes after the game that cites it
}

// The best entries for what was typed, shaped for display in `lang`.
export function search(query, lang, limit = 10) {
  const q = norm(query)
  if (!q) return []
  const tokens = q.split(' ')
  return ENTRIES.map((e) => ({ e, s: score(e, tokens, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ e }) => show(e, lang))
}

// Nothing typed yet: the topics and the pages, to start from.
export function suggest(lang) {
  const more = ['page-topics', 'about-idea', 'page-references']
  const pick = [...ENTRIES.filter((e) => e.kind === 'topic'), ...more.map((id) => ENTRIES.find((e) => e.id === id))]
  return pick.map((e) => show(e, lang))
}

const show = (e, lang) => ({ id: e.id, kind: e.kind, to: e.to, title: e.title[lang], sub: e.sub?.[lang] ?? '', topic: e.topic?.[lang] })

// For tools/search-check.mjs
export const entries = () => ENTRIES
