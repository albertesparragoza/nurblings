// Trait sheet: hand-picked Nurblings beside Nurbi, at the sizes and grounds
// every trait has to survive before it enters a generation.
//
//   pnpm sheet        writes wip/trait-sheet.html (git-ignored)

import { mkdirSync, writeFileSync } from 'node:fs'
import { renderFlagship } from '../packages/nurblings/src/protect'
import { render } from '../packages/nurblings/src/svg'
import type { Palette, Silhouette, Traits } from '../packages/nurblings/src/types'

const SHAPES: Record<string, Silhouette> = {
  // every crown is a soft ogive point (crown >= 0.55), never a dome
  pebble: { hw: 0.94, widest: 0.42, crown: 0.6, base: 0.45, facets: 3 },
  drop: { hw: 1.14, widest: 0.3, crown: 0.9, base: 0.55, facets: 4 },
  bean: { hw: 0.86, widest: 0.42, crown: 0.6, base: 0.9, facets: 2 },
  bell: { hw: 0.98, widest: 0.2, crown: 0.6, base: 1, facets: 3 },
  acorn: { hw: 1.08, widest: 0.44, crown: 0.75, base: 0.6, facets: 4 },
  loaf: { hw: 0.82, widest: 0.46, crown: 0.55, base: 1, facets: 3 },
}

const INK = '#141414'
const GLINT = '#9a9a9a'
const palette = (shell: string, accent: string, wear: string, background: string): Palette => ({
  shell,
  accent,
  eye: INK,
  catchlight: GLINT,
  wear,
  background,
})

const PALETTES: Record<string, Palette> = {
  // shell, accent, wear, background: every accent clears 3:1 on its shell and
  // 2.5:1 on both the dark and the light ground
  mint: palette('#a8e0d1', '#16857d', '#b5532f', '#eef6f3'),
  sky: palette('#b8d8f7', '#2f6fd6', '#d9502a', '#eef4fb'),
  butter: palette('#f6dd99', '#2e8b4f', '#7a52c7', '#fbf6e6'),
  peach: palette('#f9c3ae', '#7a52c7', '#1f7fa8', '#fcf1ec'),
  lilac: palette('#d6c8f4', '#b5532f', '#16857d', '#f4f0fb'),
  sage: palette('#c8d8b0', '#2f6fd6', '#b7700a', '#f2f5ec'),
  cloud: palette('#dfe3ea', '#b7700a', '#2f6fd6', '#f1f3f6'),
  blush: palette('#f3cfc6', '#1f7fa8', '#6f7f1f', '#fcf1ee'),
}

type Pick = Omit<Traits, 'gen' | 'silhouette' | 'palette'> & { shape: string; colours: string }

const PICKS: Pick[] = [
  {
    shape: 'pebble',
    colours: 'mint',
    mood: 'neutral',
    mouth: 'none',
    extra: 'none',
    brow: { shape: 'level', tilt: 0 },
    eyes: { shape: 'tall', size: 0.12, spacing: 0.38, depth: 0.54, catchlight: 'asymmetric' },
    antennae: { lean: [24, 30], length: [0.34, 0.46], bend: 0, tip: 0.08 },
  },
  {
    shape: 'drop',
    colours: 'sky',
    mood: 'curious',
    mouth: 'dot',
    extra: 'none',
    brow: { shape: 'wave', tilt: 2 },
    eyes: { shape: 'round', size: 0.13, spacing: 0.36, depth: 0.55, catchlight: 'dot' },
    antennae: { lean: [16, 34], length: [0.4, 0.3], bend: 0.35, tip: 0.07 },
  },
  {
    shape: 'bean',
    colours: 'butter',
    mood: 'pleased',
    mouth: 'smile',
    extra: 'scarf',
    brow: { shape: 'level', tilt: -2 },
    eyes: { shape: 'wide', size: 0.11, spacing: 0.42, depth: 0.52, catchlight: 'pair' },
    antennae: { lean: [30, 22], length: [0.28, 0.38], bend: -0.25, tip: 0.09 },
  },
  {
    shape: 'bell',
    colours: 'peach',
    mood: 'thinking',
    mouth: 'line',
    extra: 'none',
    brow: { shape: 'split', tilt: 4 },
    eyes: { shape: 'almond', size: 0.12, spacing: 0.4, depth: 0.56, catchlight: 'dot' },
    antennae: { lean: [20, 26], length: [0.46, 0.36], bend: 0, tip: 0.08 },
  },
  {
    shape: 'acorn',
    colours: 'lilac',
    mood: 'sleepy',
    mouth: 'none',
    extra: 'hat',
    brow: { shape: 'bold', tilt: 0 },
    eyes: { shape: 'round', size: 0.12, spacing: 0.37, depth: 0.55, catchlight: 'none' },
    antennae: { lean: [28, 18], length: [0.32, 0.44], bend: 0.2, tip: 0.1 },
  },
  {
    shape: 'loaf',
    colours: 'sage',
    mood: 'neutral',
    mouth: 'dot',
    extra: 'collar',
    brow: { shape: 'wave', tilt: -3 },
    eyes: { shape: 'tall', size: 0.1, spacing: 0.43, depth: 0.5, catchlight: 'asymmetric' },
    antennae: { lean: [34, 28], length: [0.26, 0.34], bend: 0, tip: 0.07 },
  },
  {
    shape: 'pebble',
    colours: 'cloud',
    mood: 'curious',
    mouth: 'smile',
    extra: 'pin',
    brow: { shape: 'bold', tilt: 3 },
    eyes: { shape: 'wide', size: 0.13, spacing: 0.39, depth: 0.53, catchlight: 'pair' },
    antennae: { lean: [18, 24], length: [0.44, 0.52], bend: -0.3, tip: 0.08 },
  },
  {
    shape: 'drop',
    colours: 'blush',
    mood: 'pleased',
    mouth: 'none',
    extra: 'none',
    brow: { shape: 'split', tilt: -1 },
    eyes: { shape: 'tall', size: 0.11, spacing: 0.35, depth: 0.57, catchlight: 'dot' },
    antennae: { lean: [26, 32], length: [0.36, 0.28], bend: 0.15, tip: 0.09 },
  },
  {
    shape: 'bean',
    colours: 'mint',
    mood: 'thinking',
    mouth: 'line',
    extra: 'hat',
    brow: { shape: 'level', tilt: 5 },
    eyes: { shape: 'round', size: 0.1, spacing: 0.41, depth: 0.54, catchlight: 'asymmetric' },
    antennae: { lean: [22, 20], length: [0.3, 0.42], bend: 0, tip: 0.07 },
  },
  {
    shape: 'bell',
    colours: 'sky',
    mood: 'neutral',
    mouth: 'smile',
    extra: 'scarf',
    brow: { shape: 'wave', tilt: 0 },
    eyes: { shape: 'almond', size: 0.13, spacing: 0.38, depth: 0.53, catchlight: 'pair' },
    antennae: { lean: [32, 24], length: [0.4, 0.5], bend: 0.3, tip: 0.1 },
  },
  {
    shape: 'acorn',
    colours: 'butter',
    mood: 'curious',
    mouth: 'none',
    extra: 'collar',
    brow: { shape: 'split', tilt: 2 },
    eyes: { shape: 'tall', size: 0.12, spacing: 0.36, depth: 0.55, catchlight: 'dot' },
    antennae: { lean: [14, 30], length: [0.48, 0.34], bend: -0.2, tip: 0.08 },
  },
  {
    shape: 'loaf',
    colours: 'peach',
    mood: 'sleepy',
    mouth: 'dot',
    extra: 'none',
    brow: { shape: 'level', tilt: -4 },
    eyes: { shape: 'wide', size: 0.12, spacing: 0.44, depth: 0.52, catchlight: 'none' },
    antennae: { lean: [26, 36], length: [0.3, 0.24], bend: 0, tip: 0.09 },
  },
  {
    shape: 'pebble',
    colours: 'lilac',
    mood: 'pleased',
    mouth: 'line',
    extra: 'pin',
    brow: { shape: 'wave', tilt: 1 },
    eyes: { shape: 'round', size: 0.11, spacing: 0.4, depth: 0.56, catchlight: 'asymmetric' },
    antennae: { lean: [20, 28], length: [0.38, 0.3], bend: 0.25, tip: 0.07 },
  },
  {
    shape: 'drop',
    colours: 'sage',
    mood: 'neutral',
    mouth: 'smile',
    extra: 'hat',
    brow: { shape: 'bold', tilt: -2 },
    eyes: { shape: 'almond', size: 0.12, spacing: 0.37, depth: 0.54, catchlight: 'pair' },
    antennae: { lean: [24, 18], length: [0.42, 0.5], bend: 0, tip: 0.08 },
  },
  {
    shape: 'bean',
    colours: 'cloud',
    mood: 'thinking',
    mouth: 'none',
    extra: 'scarf',
    brow: { shape: 'split', tilt: 6 },
    eyes: { shape: 'tall', size: 0.13, spacing: 0.4, depth: 0.53, catchlight: 'dot' },
    antennae: { lean: [30, 26], length: [0.34, 0.28], bend: -0.35, tip: 0.1 },
  },
  {
    shape: 'bell',
    colours: 'blush',
    mood: 'curious',
    mouth: 'dot',
    extra: 'collar',
    brow: { shape: 'level', tilt: 0 },
    eyes: { shape: 'round', size: 0.12, spacing: 0.38, depth: 0.55, catchlight: 'asymmetric' },
    antennae: { lean: [18, 32], length: [0.36, 0.46], bend: 0.1, tip: 0.09 },
  },
]

const traits = ({ shape, colours, ...rest }: Pick): Traits => ({
  gen: 1,
  silhouette: SHAPES[shape] as Silhouette,
  palette: PALETTES[colours] as Palette,
  ...rest,
})

const label = (p: Pick) =>
  `${p.shape} · ${p.colours} · ${p.mood} · brow ${p.brow.shape} · eyes ${p.eyes.shape} · mouth ${p.mouth} · ${p.extra}`

const SIZES = [256, 48, 24, 16]

function cell(name: string, svgAt: (size: number) => string): string {
  const imgs = SIZES.map(
    (s) => `<figure class="s${s}">${svgAt(s)}<figcaption>${s}</figcaption></figure>`,
  ).join('')
  return `<article><div class="row">${imgs}</div><p>${name}</p></article>`
}

const cells = [
  cell('Nurbi (flagship, stored drawing)', (size) => renderFlagship({ size })),
  ...PICKS.map((p) => cell(label(p), (size) => render(traits(p), { size }))),
].join('')

const favicon = PICKS.map((p) => render(traits(p), { size: 16 })).join('')

const html = `<!doctype html><meta charset="utf-8"><title>Nurblings trait sheet</title>
<style>
body{margin:0;font:13px/1.4 system-ui,sans-serif}
section{padding:24px 32px}
section.light{background:#f7f5f2;color:#222}
section.dark{background:#16161a;color:#ddd}
section.mono{background:#f7f5f2;color:#222;filter:grayscale(1)}
h2{margin:0 0 16px;font-size:15px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:20px}
article{border:1px solid #8883;border-radius:10px;padding:12px}
.row{display:flex;align-items:flex-end;gap:12px}
figure{margin:0;text-align:center}
figcaption{font-size:10px;opacity:.6}
.tabs{display:flex;gap:4px;align-items:center;padding:8px;background:#ddd;border-radius:8px 8px 0 0;width:max-content}
.tabs svg{display:block}
</style>
<section class="light"><h2>Light</h2><div class="grid">${cells}</div></section>
<section class="dark"><h2>Dark</h2><div class="grid">${cells}</div></section>
<section class="mono"><h2>Monochrome</h2><div class="grid">${cells}</div></section>
<section class="light"><h2>Favicon strip (16 px)</h2><div class="tabs">${favicon}</div></section>`

mkdirSync('wip', { recursive: true })
writeFileSync('wip/trait-sheet.html', html)
console.log('wrote wip/trait-sheet.html')
