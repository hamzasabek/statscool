// PNG icons from the logo's SVGs (Step 105), rendered by headless Chrome (CHROME=/path/to/chrome if not found).
//   public/favicon-32.png         the tab icon for browsers without SVG favicons (from statscool-mark.svg, transparent)
//   public/apple-touch-icon.png   the home-screen icon of iPhones and iPads (from statscool-icon.svg, 180 x 180)
// usage (repository root, after python design/logo/make_logos.py):  node design/logo/rasterize.mjs
import { spawn } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const JOBS = [
  ['design/logo/statscool-mark.svg', 'public/favicon-32.png', 32],
  ['design/logo/statscool-icon.svg', 'public/apple-touch-icon.png', 180],
]
const chromePath = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) => p && existsSync(p))
if (!chromePath) throw new Error('Chrome not found: set CHROME=/path/to/chrome')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=9408', `--user-data-dir=${join(tmpdir(), 'statscool-icons-' + process.pid)}`, '--no-first-run', 'about:blank'])
let tabs
for (let i = 0; i < 60 && !tabs; i++) {
  try {
    tabs = await (await fetch('http://127.0.0.1:9408/json')).json()
  } catch {
    await sleep(250)
  }
}
const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r))
let id = 0
const pending = new Map()
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) (pending.get(m.id)(m), pending.delete(m.id))
})
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
await send('Page.enable')
await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } }) // transparent page
for (const [src, out, size] of JOBS) {
  await send('Emulation.setDeviceMetricsOverride', { width: size, height: size, deviceScaleFactor: 1, mobile: false })
  const svg = Buffer.from(readFileSync(src)).toString('base64')
  const html = `<!doctype html><html style="margin:0;background:transparent"><body style="margin:0;background:transparent"><img src="data:image/svg+xml;base64,${svg}" width="${size}" height="${size}" style="display:block"></body></html>`
  await send('Page.navigate', { url: 'data:text/html;base64,' + Buffer.from(html).toString('base64') })
  await sleep(500)
  const r = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: size, height: size, scale: 1 } })
  writeFileSync(out, Buffer.from(r.result.data, 'base64'))
  console.log(out)
}
ws.close()
chrome.kill()
process.exit(0)
