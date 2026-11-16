// Third-party licences (Step 101): what the built site ships, and the notices that must travel with it.
// The site is built in memory (Vite, write: false); the tool reads which npm packages end up in the
// JavaScript, which font files are emitted, and which CSS frameworks have rules in the stylesheet (the
// layers of src/styles/frameworks.scss). It writes:
//   public/licenses/<project>.txt          full licence text of each project (served at ./licenses/…)
//   public/licenses/THIRD-PARTY-NOTICES.txt all of them in one file
//   src/licenses.js                         the data of the Licences page (/licences)
// usage:  npm run licenses                  write the files
//         node tools/licenses.mjs --check   exit 1 if the committed files are out of date (npm run check)
// A package that is shipped but belongs to no project below stops the tool: add it to PROJECTS.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public', 'licenses')
const DATA = join(ROOT, 'src', 'licenses.js')
const check = process.argv.includes('--check')
const slash = (p) => p.replace(/\\/g, '/')

// kind: font | style | code. Fonts are found by the path of their files, styles by their cascade layer,
// code by its npm packages. `copyright` replaces the lines read from the licence file (Apache texts
// carry none; the font files' own notices are used for fonts).
const PROJECTS = [
  { id: 'inter', kind: 'font', name: 'Inter', url: 'https://rsms.me/inter/', spdx: 'OFL-1.1', fonts: /\/src\/assets\/fonts\/inter-/,
    text: 'src/assets/fonts/LICENSE-Inter-OFL.txt', copyright: ['Copyright 2016 The Inter Project Authors (https://github.com/rsms/inter)'] },
  { id: 'ibm-plex-mono', kind: 'font', name: 'IBM Plex Mono', url: 'https://github.com/IBM/plex', spdx: 'OFL-1.1', fonts: /\/src\/assets\/fonts\/ibm-plex-mono-/,
    text: 'src/assets/fonts/LICENSE-IBM-Plex-Mono-OFL.txt', copyright: ['Copyright © 2017 IBM Corp. with Reserved Font Name "Plex"'] },
  { id: 'fraunces', kind: 'font', name: 'Fraunces', url: 'https://github.com/undercasetype/Fraunces', spdx: 'OFL-1.1', fonts: /\/src\/assets\/fonts\/fraunces-/,
    text: 'src/assets/fonts/LICENSE-Fraunces-OFL.txt', copyright: ['Copyright 2020 The Fraunces Project Authors (github.com/undercasetype/Fraunces)'] },
  { id: 'katex-fonts', kind: 'font', name: 'KaTeX fonts', url: 'https://katex.org', spdx: 'OFL-1.1', fonts: /\/node_modules\/katex\/dist\/fonts\//,
    copyright: ['Copyright (c) 2009-2010, Design Science, Inc. (www.mathjax.org)', 'Copyright (c) 2014-2018 Khan Academy (www.khanacademy.org)'] },
  { id: 'carbon', kind: 'style', name: 'IBM Carbon Design System', url: 'https://carbondesignsystem.com', layer: 'carbon', packages: ['@carbon/styles'],
    copyright: ['Copyright IBM Corp.'], changed: true },
  { id: 'bootstrap', kind: 'style', name: 'Bootstrap', url: 'https://getbootstrap.com', layer: 'bootstrap', packages: ['bootstrap'], changed: true },
  { id: 'uikit', kind: 'style', name: 'UIkit', url: 'https://getuikit.com', layer: 'uikit', packages: ['uikit'], changed: true },
  { id: 'react', kind: 'code', name: 'React', url: 'https://react.dev', packages: ['react', 'react-dom', 'scheduler'] },
  { id: 'react-router', kind: 'code', name: 'React Router', url: 'https://reactrouter.com', packages: ['react-router'] },
  { id: 'd3', kind: 'code', name: 'D3', url: 'https://d3js.org', packages: [/^d3-/] },
  { id: 'motion', kind: 'code', name: 'Motion', url: 'https://motion.dev', packages: ['motion', 'framer-motion', 'motion-dom', 'motion-utils'] },
  { id: 'katex', kind: 'code', name: 'KaTeX', url: 'https://katex.org', packages: ['katex'] },
]
const LICENCE_NAMES = { MIT: 'MIT', ISC: 'ISC', 'Apache-2.0': 'Apache 2.0', 'OFL-1.1': 'SIL Open Font License 1.1' }

// ---------- 1. what the build ships ----------
const out = await build({ root: ROOT, logLevel: 'error', build: { write: false } })
const shipped = { packages: new Set(), fonts: [], css: '' }
for (const o of Array.isArray(out) ? out : [out]) {
  for (const f of o.output) {
    if (f.type === 'chunk') {
      for (const id of Object.keys(f.modules)) {
        const m = slash(id).match(/.*\/node_modules\/((?:@[^/]+\/)?[^/]+)\//)
        if (m) shipped.packages.add(m[1])
      }
    } else {
      if (/\.(woff2?|ttf|otf)$/.test(f.fileName)) shipped.fonts.push(...(f.originalFileNames ?? [f.name]).map((p) => '/' + slash(p)))
      if (f.fileName.endsWith('.css')) shipped.css += typeof f.source === 'string' ? f.source : Buffer.from(f.source).toString()
    }
  }
}
// A framework counts as shipped when its layer holds at least one rule.
const layerHasRules = (name) => {
  let i = shipped.css.indexOf(`@layer ${name}{`)
  while (i >= 0) {
    if (shipped.css[i + `@layer ${name}{`.length] !== '}') return true
    i = shipped.css.indexOf(`@layer ${name}{`, i + 1)
  }
  return false
}

// ---------- 2. projects, packages, notices ----------
const pkgDir = (name) => join(ROOT, 'node_modules', ...name.split('/'))
const pkgJson = (name) => JSON.parse(readFileSync(join(pkgDir(name), 'package.json'), 'utf8'))
const licenceFiles = (name) =>
  readdirSync(pkgDir(name))
    .filter((f) => /^(licen[cs]e|copying|notice)(\.(md|txt))?$/i.test(f))
    .sort()
    .map((f) => readFileSync(join(pkgDir(name), f), 'utf8').replace(/\r\n/g, '\n').trim())
const copyrightLines = (text) =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^copyright\b/i.test(l) && !/above copyright/i.test(l))
    .map((l) => l.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)'))
const matches = (p, name) => p.packages?.some((x) => (x instanceof RegExp ? x.test(name) : x === name))

const unknown = [...shipped.packages].filter((n) => !PROJECTS.some((p) => matches(p, n)))
if (unknown.length) {
  console.error(`Licences: shipped package(s) with no project in tools/licenses.mjs: ${unknown.join(', ')}. Add them to PROJECTS.`)
  process.exit(1)
}

const OFL_BODY = (() => {
  const t = readFileSync(join(ROOT, 'src/assets/fonts/LICENSE-Inter-OFL.txt'), 'utf8').replace(/\r\n/g, '\n')
  return t.slice(t.indexOf('This Font Software is licensed under the SIL Open Font License')).trim()
})()

const projects = []
for (const p of PROJECTS) {
  let packages = []
  let texts = []
  let copyright = p.copyright ?? []
  let files = []
  if (p.kind === 'font') {
    files = [...new Set(shipped.fonts.filter((f) => p.fonts.test(f)).map((f) => f.split('/').pop()))].sort()
    if (!files.length) continue
    if (p.text) texts = [readFileSync(join(ROOT, p.text), 'utf8').replace(/\r\n/g, '\n').trim()]
    else {
      // KaTeX ships no licence file for its fonts: the notice is the one inside the font files (name table).
      const families = [...new Set(files.map((f) => f.replace(/-[^-]+$/, '')))].sort()
      texts = [`${copyright.join('\n')},\nwith Reserved Font Names ${families.join(', ')}.\n\n${OFL_BODY}`]
    }
  } else {
    const names = [...shipped.packages].filter((n) => matches(p, n)).sort()
    if (p.kind === 'style' ? !layerHasRules(p.layer) : !names.length) continue
    const list = p.kind === 'style' ? p.packages : names
    packages = list.map((n) => ({ name: n, version: pkgJson(n).version, spdx: pkgJson(n).license }))
    texts = [...new Set(list.flatMap(licenceFiles))]
    if (!p.copyright) copyright = [...new Set(texts.flatMap(copyrightLines))]
  }
  const spdx = p.spdx ?? [...new Set(packages.map((x) => x.spdx))].join(' / ')
  projects.push({
    id: p.id,
    kind: p.kind,
    name: p.name,
    url: p.url,
    licence: spdx.split(' / ').map((s) => LICENCE_NAMES[s] ?? s).join(' / '),
    packages: packages.map(({ name, version }) => ({ name, version })),
    files: files.length,
    copyright,
    changed: !!p.changed,
    file: `licenses/${p.id}.txt`,
    texts,
  })
}

// ---------- 3. the files ----------
const SITE = 'StatsCool (https://hamzasabek.github.io/statscool/)'
const CHANGED = 'StatsCool compiles its Sass sources, keeps only the rules the site uses, and changes colours, fonts and corners (see src/styles/ in the StatsCool repository).'
const noticeOf = (p) =>
  [
    `${p.name} — ${p.url}`,
    `Used by ${SITE}.`,
    p.packages.length ? `Packages: ${p.packages.map((x) => `${x.name} ${x.version}`).join(', ')}` : `Font files: ${p.files}`,
    `Licence: ${p.licence}`,
    ...(p.changed ? [`Changes: ${CHANGED}`] : []),
    '',
    ...p.copyright,
    '',
    p.texts.join('\n\n----------\n\n'),
    '',
  ].join('\n')
const outputs = new Map()
for (const p of projects) outputs.set(join(OUT_DIR, `${p.id}.txt`), noticeOf(p))
outputs.set(
  join(OUT_DIR, 'THIRD-PARTY-NOTICES.txt'),
  [`Third-party notices of ${SITE}`, 'Generated by tools/licenses.mjs from what the build ships.', '', ...projects.map((p) => '='.repeat(72) + '\n' + noticeOf(p))].join('\n'),
)
const data = projects.map(({ texts, ...p }) => p) // eslint-disable-line no-unused-vars
outputs.set(
  DATA,
  `// Generated by tools/licenses.mjs (npm run licenses) from what the build ships: do not edit by hand.\n` +
    `// The Licences page (/licences) shows it; the full texts are in public/licenses/.\n` +
    `export const LICENSES = ${JSON.stringify(data, null, 2)}\n`,
)

const stale = existsSync(OUT_DIR) ? readdirSync(OUT_DIR).map((f) => join(OUT_DIR, f)).filter((f) => !outputs.has(f)) : []
if (check) {
  // Line endings do not count: git on Windows may check the files out with CRLF.
  const same = (f, text) => readFileSync(f, 'utf8').replace(/\r\n/g, '\n') === text.replace(/\r\n/g, '\n')
  const bad = [...outputs].filter(([f, text]) => !existsSync(f) || !same(f, text)).map(([f]) => f)
  if (bad.length || stale.length) {
    console.error(`Licences out of date (${[...bad, ...stale].map((f) => slash(f).replace(slash(ROOT) + '/', '')).join(', ')}): run npm run licenses.`)
    process.exit(1)
  }
  console.log(`Licences: ${projects.length} projects shipped (${projects.map((p) => p.name).join(', ')}), notices up to date.`)
} else {
  mkdirSync(OUT_DIR, { recursive: true })
  for (const f of stale) rmSync(f)
  for (const [f, text] of outputs) writeFileSync(f, text)
  console.log(`Licences: wrote ${outputs.size} files for ${projects.length} projects.`)
}
process.exit(0)
