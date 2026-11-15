// Search check, run by `npm run check` (and alone: node tools/search-check.mjs).
// Fails if a topic, a game or an extra (playground, live calculation, quick practice, quiz):
//   - has no line in src/search/keywords.js,
//   - cannot be found by typing its own name, in English and in French (it must come up in the first 5 results).
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent', optimizeDeps: { noDiscovery: true } })
const { search } = await server.ssrLoadModule('/src/search/engine.js')
const { topics } = await server.ssrLoadModule('/src/topics/topics.js')
const { KW } = await server.ssrLoadModule('/src/search/keywords.js')
const problems = []
let n = 0
const probe = (id, nameEn, nameFr, to) => {
  n++
  for (const [lang, name] of [['en', nameEn], ['fr', nameFr]]) {
    const hits = search(name, lang, 5)
    if (!hits.some((h) => h.to === to)) problems.push(`"${name}" (${lang}) does not find ${to}`)
  }
}
for (const t of topics) {
  if (!KW[t.slug]) problems.push(`no keywords for topic ${t.slug}`)
  probe(t.slug, t.text.en.title, t.text.fr.title, `/topics/${t.slug}`)
  for (const a of [...t.games.filter((g) => g.available), ...(t.extras ?? [])]) {
    if (!KW[`${t.slug}/${a.slug}`]) problems.push(`no keywords for ${t.slug}/${a.slug}`)
    // A quiz or playground has the same name in every topic: also look for it with its topic's name.
    const generic = ['Quiz', 'Playground', 'Live calculation'].includes(a.text.en.name)
    probe(`${t.slug}/${a.slug}`, generic ? `${a.text.en.name} ${t.text.en.title}` : a.text.en.name, generic ? `${a.text.fr.name} ${t.text.fr.title}` : a.text.fr.name, `/topics/${t.slug}/${a.slug}`)
  }
}
await server.close()
if (problems.length) {
  console.log('Search: ' + problems.length + ' problem(s):\n  ' + problems.join('\n  '))
  process.exit(1)
}
console.log(`Search: ${n} topics, games and extras are found by their own name in English and French.`)
process.exit(0)
