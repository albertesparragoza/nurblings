// Container sheet: Nurbling candidates inside the avatar containers apps
// actually use (circle, square, squircle), at common avatar sizes, in every
// framing, on light and dark pages, next to Nurbi.
//
//   pnpm sheet        writes wip/container-sheet.html (git-ignored)

import { mkdirSync, writeFileSync } from 'node:fs'
import { ACCENTS, CATCHLIGHT, EYE, SHELLS } from '../packages/nurblings/src/gen1'
import { nurbi as nurbiDrawing } from '../packages/nurblings/src/nurbi'
import { render } from '../packages/nurblings/src/svg'
import type { Antennae, Frame, Palette, Silhouette, Traits } from '../packages/nurblings/src/types'

type ShellKey = keyof typeof SHELLS
type AccentKey = keyof typeof ACCENTS

const palette = (shell: ShellKey, accent: AccentKey): Palette => ({
  shell: SHELLS[shell].shell,
  accent: ACCENTS[accent],
  eye: EYE,
  catchlight: CATCHLIGHT,
  wear: ACCENTS[accent],
  background: SHELLS[shell].background,
})

interface Candidate {
  name: string
  silhouette: Silhouette
  antennae: Antennae
  colours: [ShellKey, AccentKey]
  mouth: Traits['mouth']
  mood: Traits['mood']
  brow: Traits['brow']
}

const pair = (lean: [number, number], length: [number, number], tip = 0.08): Antennae => ({
  count: 2,
  lean,
  length,
  bend: 0,
  tip,
})

// Exaggerated variations of Nurbi's outline, with the plates in different places.
const CANDIDATES: Candidate[] = [
  {
    name: 'close to Nurbi (crown plates)',
    silhouette: {
      hw: 1.02,
      width: 1,
      belly: 0.31,
      tip: 1,
      rows: 3,
      cols: 4,
      grain: 7,
      plates: 'crown',
    },
    antennae: pair([24, 30], [0.34, 0.48]),
    colours: ['mint', 'teal'],
    mouth: 'none',
    mood: 'neutral',
    brow: { shape: 'level', tilt: 2 },
  },
  {
    name: 'basketball (crown plates)',
    silhouette: {
      hw: 1.6,
      width: 0.7,
      belly: 0.3,
      tip: 0.95,
      rows: 4,
      cols: 3,
      grain: 31,
      plates: 'crown',
    },
    antennae: pair([14, 22], [0.44, 0.36]),
    colours: ['butter', 'violet'],
    mouth: 'smile',
    mood: 'pleased',
    brow: { shape: 'wave', tilt: 0 },
  },
  {
    name: 'squat wide (crown plates)',
    silhouette: {
      hw: 0.78,
      width: 1.2,
      belly: 0.36,
      tip: 1.1,
      rows: 3,
      cols: 5,
      grain: 3,
      plates: 'crown',
    },
    antennae: pair([30, 24], [0.26, 0.34]),
    colours: ['sage', 'cobalt'],
    mouth: 'dot',
    mood: 'neutral',
    brow: { shape: 'bold', tilt: 0 },
  },
  {
    name: 'pear (base plates)',
    silhouette: {
      hw: 1.08,
      width: 1.04,
      belly: 0.2,
      tip: 1.15,
      rows: 2,
      cols: 5,
      grain: 41,
      plates: 'base',
    },
    antennae: pair([22, 30], [0.36, 0.28]),
    colours: ['peach', 'rust'],
    mouth: 'line',
    mood: 'thinking',
    brow: { shape: 'split', tilt: 3 },
  },
  {
    name: 'tall bell (side plates)',
    silhouette: {
      hw: 1.32,
      width: 0.9,
      belly: 0.44,
      tip: 1.2,
      rows: 4,
      cols: 2,
      grain: 11,
      plates: 'side',
    },
    antennae: pair([18, 26], [0.4, 0.3]),
    colours: ['sky', 'cobalt'],
    mouth: 'dot',
    mood: 'curious',
    brow: { shape: 'wave', tilt: 0 },
  },
  {
    name: 'smooth (no plates)',
    silhouette: {
      hw: 1.12,
      width: 0.92,
      belly: 0.33,
      tip: 0.9,
      rows: 3,
      cols: 4,
      grain: 5,
      plates: 'none',
    },
    antennae: pair([26, 20], [0.32, 0.42]),
    colours: ['lilac', 'violet'],
    mouth: 'none',
    mood: 'neutral',
    brow: { shape: 'level', tilt: -2 },
  },
  {
    name: 'firm tip, one antenna (crown plates)',
    silhouette: {
      hw: 1.2,
      width: 0.85,
      belly: 0.28,
      tip: 0.8,
      rows: 4,
      cols: 4,
      grain: 19,
      plates: 'crown',
    },
    antennae: { count: 1, lean: [10, 14], length: [0.3, 0.5], bend: 0, tip: 0.1 },
    colours: ['blush', 'ocean'],
    mouth: 'none',
    mood: 'curious',
    brow: { shape: 'level', tilt: 1 },
  },
  {
    name: 'wide (side plates)',
    silhouette: {
      hw: 0.9,
      width: 1.12,
      belly: 0.3,
      tip: 1,
      rows: 4,
      cols: 2,
      grain: 23,
      plates: 'side',
    },
    antennae: pair([28, 34], [0.36, 0.28]),
    colours: ['lemon', 'tomato'],
    mouth: 'smile',
    mood: 'pleased',
    brow: { shape: 'level', tilt: 0 },
  },
  {
    name: 'tall (base plates)',
    silhouette: {
      hw: 1.42,
      width: 0.8,
      belly: 0.3,
      tip: 1,
      rows: 2,
      cols: 4,
      grain: 29,
      plates: 'base',
    },
    antennae: pair([16, 24], [0.4, 0.48]),
    colours: ['cloud', 'amber'],
    mouth: 'dot',
    mood: 'neutral',
    brow: { shape: 'bold', tilt: -1 },
  },
  {
    name: 'round full (crown plates)',
    silhouette: {
      hw: 0.9,
      width: 1.08,
      belly: 0.38,
      tip: 1.2,
      rows: 3,
      cols: 5,
      grain: 13,
      plates: 'crown',
    },
    antennae: pair([26, 32], [0.3, 0.4]),
    colours: ['mint', 'violet'],
    mouth: 'smile',
    mood: 'pleased',
    brow: { shape: 'wave', tilt: 1 },
  },
]

const traits = (c: Candidate): Traits => ({
  gen: 1,
  silhouette: c.silhouette,
  antennae: c.antennae,
  eyes: { shape: 'tall', size: 0.12, spacing: 0.39, depth: 0.53, catchlight: 'asymmetric' },
  brow: c.brow,
  mouth: c.mouth,
  extra: 'none',
  mood: c.mood,
  palette: palette(...c.colours),
})

const SIZES = [24, 32, 40, 48, 64, 96]
const SHAPES = ['circle', 'square', 'squircle'] as const
const FRAMES: Frame[] = ['auto', 'full', 'portrait']

const avatar = (svg: string, size: number, shape: string, tint: string) =>
  `<span class="av ${shape}" style="width:${size}px;height:${size}px;background:${tint}">${svg}</span>`

function containerRow(label: string, draw: (size: number, frame: Frame) => string, tint: string) {
  const groups = FRAMES.map((frame) => {
    const cols = SHAPES.map(
      (shape) =>
        `<div class="shape"><div class="sizes">${SIZES.map((s) => avatar(draw(s, frame), s, shape, tint)).join('')}</div><small>${shape}</small></div>`,
    ).join('')
    return `<div class="frame"><h4>${frame}</h4><div class="shapes">${cols}</div></div>`
  }).join('')
  return `<div class="row"><div class="label">${label}</div><div class="frames">${groups}</div></div>`
}

const big = (svg: string, caption: string, size: number) =>
  `<figure style="width:${size}px">${svg}<figcaption>${caption}</figcaption></figure>`

const nurbi = big(nurbiDrawing({ size: 220, frame: 'full' }), 'Nurbi', 220)

const rows = [
  containerRow('Nurbi (flagship)', (size, frame) => nurbiDrawing({ size, frame }), '#2a2a31'),
  ...CANDIDATES.map((c) => {
    const t = traits(c)
    return containerRow(c.name, (size, frame) => render(t, { size, frame }), t.palette.background)
  }),
].join('')

const strip = [
  big(nurbiDrawing({ size: 160, frame: 'full' }), 'Nurbi', 160),
  ...CANDIDATES.map((c) => big(render(traits(c), { size: 160, frame: 'full' }), c.name, 160)),
].join('')

const html = `<!doctype html><meta charset="utf-8"><title>Nurblings container sheet</title>
<style>
body{margin:0;font:13px/1.4 system-ui,sans-serif}
section{padding:24px 32px}
section.light{background:#f7f5f2;color:#222}
section.dark{background:#16161a;color:#ddd}
h2{margin:0 0 16px;font-size:15px}
h4{margin:0 0 6px;font-size:11px;font-weight:600;opacity:.7;text-transform:uppercase;letter-spacing:.05em}
.strip{display:flex;flex-wrap:wrap;gap:22px}
.strip figure{margin:0;text-align:center}
.strip figcaption{font-size:11px;opacity:.7}
.row{display:flex;gap:18px;align-items:center;padding:12px 0;border-top:1px solid #8883}
.label{width:150px;flex:none;font-weight:600}
.frames{display:flex;gap:28px;flex-wrap:wrap}
.shapes{display:flex;gap:14px}
.shape small{display:block;font-size:10px;opacity:.6;margin-top:4px}
.sizes{display:flex;gap:8px;align-items:flex-end}
.av{display:inline-flex;overflow:hidden;flex:none}
.av svg{display:block;width:100%;height:100%}
.av.circle{border-radius:50%}
.av.square{border-radius:3px}
.av.squircle{border-radius:28%}
</style>
<section class="light"><h2>Nurbi, plated flagship (220 px)</h2><div class="strip">${nurbi}</div></section>
<section class="light"><h2>Family next to Nurbi (full frame, 160 px)</h2><div class="strip">${strip}</div></section>
<section class="dark"><h2>Family next to Nurbi, dark page</h2><div class="strip">${strip}</div></section>
<section class="light"><h2>Containers, light page</h2>${rows}</section>
<section class="dark"><h2>Containers, dark page</h2>${rows}</section>`

mkdirSync('wip', { recursive: true })
writeFileSync('wip/container-sheet.html', html)
console.log('wrote wip/container-sheet.html')
