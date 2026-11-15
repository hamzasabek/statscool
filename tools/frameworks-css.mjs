// Vite plugin: `virtual:frameworks.css`, the four CSS frameworks (src/styles/frameworks.scss) compiled
// by Sass and then trimmed to the selectors the site really uses (PurgeCSS reads src/ and index.html).
// Only the frameworks are trimmed: our own CSS (src/index.css, src/styles/bridge.css) is never touched.
// Why: imported whole, IBM Carbon alone is ~270 KB (each component brings its dependencies); trimmed,
// the four frameworks cost only what the pages show.
// Class names must appear literally in the sources ('cds--progress-step--current', not
// 'cds--progress-step--' + state) or they are dropped: write them out in full, in an object if needed.
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'
import { PurgeCSS } from 'purgecss'
import * as sass from 'sass'

const ID = 'virtual:frameworks.css'
const RESOLVED = '\0virtual:frameworks.css'
// HiQ is only used for prose (inside .hiq): its form controls, meters, dialogs and utility classes
// (38 KB of its 49 KB once scoped) are removed after PurgeCSS, which keeps them because the tags exist.
const HIQ_UNUSED =
  /\b(input|select|textarea|button|label|fieldset|legend|meter|progress|dialog|output|datalist|option|summary|details)\b|::-webkit|::-moz|\[role=|\.(button|checkbox|radio|is-|has-|overflow-touch)/

export function frameworksCss(rootUrl) {
  const root = fileURLToPath(new URL('.', rootUrl)).replace(/\\/g, '/') // globs need forward slashes (Windows)
  const src = root + 'src/styles/frameworks.scss'
  let cache = null
  async function make() {
    const compiled = sass.compile(src, {
      loadPaths: [root + 'src/styles', root + 'node_modules'],
      style: 'expanded',
      quietDeps: true,
      logger: sass.Logger.silent,
      silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'mixed-decls', 'if-function'],
    })
    const [out] = await new PurgeCSS().purge({
      content: [root + 'index.html', root + 'src/**/*.{js,jsx}'],
      css: [{ raw: compiled.css }],
      variables: true,
      keyframes: true,
      fontFace: true,
      safelist: { standard: [/^:root$/], greedy: [/data-theme/, /data-bs-theme/] },
    })
    const ast = postcss.parse(out.css)
    ast.walkAtRules('layer', (layer) => {
      if (layer.params !== 'hiq') return
      layer.walkRules((rule) => {
        const keep = rule.selectors.filter((s) => !HIQ_UNUSED.test(s))
        if (!keep.length) rule.remove()
        else rule.selectors = keep
      })
      layer.walkAtRules((at) => {
        if (at.nodes && !at.nodes.length) at.remove()
      })
    })
    return ast.toString()
  }
  return {
    name: 'statscool-frameworks-css',
    resolveId: (s) => (s === ID ? RESOLVED : null),
    async load(id) {
      if (id !== RESOLVED) return null
      cache ??= await make()
      return cache
    },
    handleHotUpdate({ file, server }) {
      // A source file may start using a framework class, or the Sass changed: rebuild the trimmed CSS.
      if (!/[\\/](src|index\.html)/.test(file)) return
      cache = null
      const mod = server.moduleGraph.getModuleById(RESOLVED)
      if (mod) server.reloadModule(mod)
    },
  }
}
