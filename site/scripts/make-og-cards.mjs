#!/usr/bin/env node
// Social cards and app icons for the site, drawn by the library itself.
//
//   pnpm build && node site/scripts/make-og-cards.mjs
//
// Each card is an HTML page with real Nurblings in it, screenshotted by the
// Chrome already on the machine (no project dependency) and turned into a
// 1200x630 JPEG by ffmpeg. The icons are Nurbi, drawn by nurbi() the same way.
//
// Why these choices:
// - 1200x630 is the size every platform sizes its link preview to.
// - JPEG under ~150 KB: WhatsApp drops a heavy image to the small thumbnail.
// - Drawn at 2x and downscaled, so the type stays crisp in a preview.
// - Headless Chrome lays out a viewport shorter than the window it is given,
//   so the window is taller than the card and ffmpeg crops the card out.
//
// Output: site/public/og/<key>.jpg, and site/public/{favicon-32,
// apple-touch-icon,icon-192,icon-512,icon-maskable-512}.png

import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../..')
const site = path.join(root, 'site')
const dist = path.join(root, 'packages/nurblings/dist')
const { nurbling } = await import(path.join(dist, 'index.js'))
const { nurbi } = await import(path.join(dist, 'nurbi.js'))
const { themed } = await import(path.join(dist, 'themes.js'))

const CHROME = process.env.CHROME_BIN || 'google-chrome'
const W = 1200
const H = 630
const PAPER = '#fff8ee'
const INK = '#2a2140'
const MUTED = '#665b7a'
const ACCENT = '#6a4bd6'
const NIGHT = '#1e1830'

const fontUrl = (pkg, file) =>
  `file://${path.join(site, 'node_modules/@fontsource-variable', pkg, 'files', file)}`
const FONTS = `
  @font-face { font-family: Display; font-weight: 200 800;
    src: url(${fontUrl('bricolage-grotesque', 'bricolage-grotesque-latin-wght-normal.woff2')}) format('woff2'); }
  @font-face { font-family: Text; font-weight: 100 1000;
    src: url(${fontUrl('dm-sans', 'dm-sans-latin-wght-normal.woff2')}) format('woff2'); }`

const esc = (s) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

/** a card: the words on the left, creatures on the right */
function card({ kicker, headline, art, dark = false, code }) {
  const ground = dark ? NIGHT : PAPER
  const ink = dark ? '#f7f1ff' : INK
  const muted = dark ? '#b8acd0' : MUTED
  return `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS}
    * { margin: 0; box-sizing: border-box; }
    html, body { width: ${W}px; height: ${H}px; background: ${ground}; overflow: hidden; }
    body { display: grid; grid-template-columns: 560px 1fr; align-items: center;
      padding: 0 64px; font-family: Text, sans-serif; color: ${ink}; }
    .mark { position: absolute; top: 52px; left: 64px; font: 800 30px Display, sans-serif;
      letter-spacing: -0.03em; }
    .mark small { font: 400 17px Text, sans-serif; color: ${muted}; margin-left: 8px; }
    .kicker { font: 600 22px Text, sans-serif; color: ${dark ? '#c9b8ff' : ACCENT}; margin-bottom: 16px; }
    h1 { font: 800 68px/1.02 Display, sans-serif; letter-spacing: -0.035em; }
    pre { margin-top: 26px; font: 500 22px ui-monospace, monospace; color: ${muted}; }
    .art { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; align-content: center; }
    .art span { line-height: 0; }
    .url { position: absolute; bottom: 48px; left: 64px; font: 500 18px Text, sans-serif; color: ${muted}; }
  </style></head><body>
    <div class="mark">nurblings<small>avatars</small></div>
    <div>
      ${kicker ? `<p class="kicker">${esc(kicker)}</p>` : ''}
      <h1>${esc(headline)}</h1>
      ${code ? `<pre>${esc(code)}</pre>` : ''}
    </div>
    <div class="art">${art}</div>
    <div class="url">nurblings.com</div>
  </body></html>`
}

const still = { animate: false }
const crowd = (seeds, size, opts = {}) =>
  seeds
    .map((s) => `<span>${nurbling(s, { ...still, size, background: 'circle', ...opts })}</span>`)
    .join('')

const THEME_ROW = [
  'lagoon',
  'punch',
  'candy',
  'picnic',
  'sorbet',
  'terracotta',
  'marble',
  'riso',
  'lime',
]

const cards = {
  home: card({
    headline: 'A small creature for every account',
    art: crowd(['ada', 'grace', 'linus', 'radia', 'hedy', 'alan'], 150),
  }),
  playground: card({
    kicker: 'Playground',
    headline: 'Type a name, meet its creature',
    art: `<span>${nurbling('ada@example.com', { ...still, size: 250, background: 'squircle' })}</span>
      ${crowd(['grace', 'linus', 'radia'], 96)}`,
  }),
  gallery: card({
    kicker: 'Gallery',
    headline: 'Ten designs, ten themes, one family',
    art: THEME_ROW.map(
      (t, i) =>
        `<span>${themed(t).nurbling(`gallery-${i}`, { ...still, size: 124, background: 'circle' })}</span>`,
    ).join(''),
  }),
  ai: card({
    kicker: 'AI skill',
    headline: 'Teach your coding agent Nurblings',
    code: 'npx skills add albertesparragoza/nurblings',
    art: crowd(['assistant', 'copilot-friend', 'agent-smol'], 170),
  }),
  docs: card({
    kicker: 'Docs',
    headline: 'Any string in, a small creature out',
    code: "nurbling('ada@example.com')",
    art: crowd(['ada@example.com', 'grace', 'linus', 'radia'], 170),
  }),
  nurbi: card({
    dark: true,
    kicker: 'A Nurblings legend',
    headline: 'The one who wondered',
    art: `<span>${nurbi({ ...still, size: 420, frame: 'full' })}</span>`,
  }),
}

/** screenshot an HTML page at 2x in a tall window */
function shoot(html, width, height, { transparent = false } = {}) {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'nurblings-card-'))
  const file = path.join(tmp, 'page.html')
  const png = path.join(tmp, 'shot.png')
  writeFileSync(file, html)
  execFileSync(
    CHROME,
    [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      '--force-device-scale-factor=2',
      `--window-size=${width},${height + 240}`,
      ...(transparent ? ['--default-background-color=00000000'] : []),
      `--screenshot=${png}`,
      `file://${file}`,
    ],
    { stdio: 'pipe' },
  )
  return { png, cleanup: () => rmSync(tmp, { recursive: true, force: true }) }
}

const ogDir = path.join(site, 'public/og')
mkdirSync(ogDir, { recursive: true })
for (const [key, html] of Object.entries(cards)) {
  const { png, cleanup } = shoot(html, W, H)
  const out = path.join(ogDir, `${key}.jpg`)
  execFileSync('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-i',
    png,
    '-vf',
    `crop=${W * 2}:${H * 2}:0:0,scale=${W}:${H}:flags=lanczos`,
    '-q:v',
    '3',
    out,
  ])
  cleanup()
  console.log(`og/${key}.jpg  ${Math.round(statSync(out).size / 1024)} KB`)
}
// the fallback for any page without a card of its own
execFileSync('cp', [path.join(ogDir, 'home.jpg'), path.join(ogDir, 'default.jpg')])
console.log('og/default.jpg  (copy of home)')

/** an icon: Nurbi centred on a square, transparent or on paper */
function icon(size, name, { ground, scale = 1 } = {}) {
  const box = 512
  const drawn = Math.round(box * scale)
  const html = `<!doctype html><html><head><style>
    * { margin: 0; } html, body { width: ${box}px; height: ${box}px; overflow: hidden;
      background: ${ground ?? 'transparent'}; }
    body { display: grid; place-items: center; }
  </style></head><body>${nurbi({ ...still, size: drawn, frame: 'full', title: 'Nurbi' })}</body></html>`
  const { png, cleanup } = shoot(html, box, box, { transparent: !ground })
  const out = path.join(site, 'public', name)
  execFileSync('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-i',
    png,
    '-vf',
    `crop=${box * 2}:${box * 2}:0:0,scale=${size}:${size}:flags=lanczos`,
    '-pix_fmt',
    'rgba',
    out,
  ])
  cleanup()
  console.log(`${name}  ${size}x${size}  ${Math.round(statSync(out).size / 1024)} KB`)
}

icon(32, 'favicon-32.png')
icon(192, 'icon-192.png')
icon(512, 'icon-512.png')
// iOS fills transparency with black and rounds the corners itself: give it paper
icon(180, 'apple-touch-icon.png', { ground: PAPER, scale: 0.86 })
// maskable icons are cropped to a circle or squircle: keep Nurbi in the middle 80%
icon(512, 'icon-maskable-512.png', { ground: PAPER, scale: 0.72 })
