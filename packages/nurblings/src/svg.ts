// Draft for feat/core-svg: Traits -> SVG string.
//
// Stability rules for everything in this file:
// - only + - * / and Math.sqrt/floor/round/abs/min/max on geometry: those are
//   exact or correctly rounded in every engine. Math.sin, cos and pow are not
//   specified bit for bit, so trigonometry comes from `sinDeg`/`cosDeg` below.
// - every emitted number goes through `n()`, two decimals, no exponent form.
// - no ids: several avatars on one page must not collide, so nothing here
//   uses clipPath, mask, gradients or url(#...) references.

import type { Antennae, Background, Eyes, RenderOptions, Silhouette, Traits } from './types'

const VIEW = 100
const CX = 50
const BASE_Y = 93
const BW = 52

/** Two decimals, trailing zeros trimmed, never "-0". */
export function n(value: number): string {
  const r = Math.round(value * 100) / 100
  return (r === 0 ? 0 : r).toString()
}

/** sin of an angle in degrees, |deg| <= 90, from a Taylor series: deterministic. */
export function sinDeg(deg: number): number {
  const x = (deg * Math.PI) / 180
  const x2 = x * x
  return x * (1 - (x2 / 6) * (1 - (x2 / 20) * (1 - (x2 / 42) * (1 - (x2 / 72) * (1 - x2 / 110)))))
}

export function cosDeg(deg: number): number {
  const x = (deg * Math.PI) / 180
  const x2 = x * x
  return 1 - (x2 / 2) * (1 - (x2 / 12) * (1 - (x2 / 30) * (1 - (x2 / 56) * (1 - x2 / 90))))
}

type Pt = readonly [number, number]
type Cubic = readonly [Pt, Pt, Pt, Pt]

function cubicAt([p0, p1, p2, p3]: Cubic, t: number): Pt {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
  ]
}

export interface BodyGeometry {
  top: number
  height: number
  radius: number
  /** right-half outline, base centre to apex */
  right: readonly [Cubic, Cubic]
  /** half-width of the body at a given y, by sampling the outline */
  halfWidthAt(y: number): number
}

export function body(s: Silhouette): BodyGeometry {
  const height = s.hw * BW
  const top = BASE_Y - height
  const radius = BW / 2
  const yw = BASE_Y - s.widest * height
  const lower: Cubic = [
    [CX, BASE_Y],
    [CX + radius * (0.55 + 0.4 * s.base), BASE_Y],
    [CX + radius, yw + (BASE_Y - yw) * (0.55 - 0.35 * s.base)],
    [CX + radius, yw],
  ]
  const upper: Cubic = [
    [CX + radius, yw],
    [CX + radius, yw - (yw - top) * 0.55],
    [CX + radius * (0.55 - 0.45 * s.crown), top + (yw - top) * 0.28 * s.crown],
    [CX, top],
  ]
  const samples: Pt[] = []
  for (const seg of [lower, upper]) for (let i = 0; i <= 24; i++) samples.push(cubicAt(seg, i / 24))
  return {
    top,
    height,
    radius,
    right: [lower, upper],
    halfWidthAt(y) {
      let best = 0
      for (let i = 1; i < samples.length; i++) {
        const [x0, y0] = samples[i - 1] as Pt
        const [x1, y1] = samples[i] as Pt
        if ((y0 - y) * (y1 - y) <= 0 && y0 !== y1) {
          best = Math.max(best, x0 + ((x1 - x0) * (y - y0)) / (y1 - y0) - CX)
        }
      }
      return best
    },
  }
}

const mirror = ([x, y]: Pt): Pt => [2 * CX - x, y]
const pt = ([x, y]: Pt) => `${n(x)},${n(y)}`

function bodyPath(g: BodyGeometry): string {
  const [lower, upper] = g.right
  const lu = upper.map(mirror).reverse() as unknown as Cubic
  const ll = lower.map(mirror).reverse() as unknown as Cubic
  const c = (seg: Cubic) => `C${pt(seg[1])} ${pt(seg[2])} ${pt(seg[3])}`
  return `M${pt(lower[0])}${c(lower)}${c(upper)}${c(lu)}${c(ll)}Z`
}

function antenna(g: BodyGeometry, a: Antennae, side: -1 | 1, accent: string): string {
  const i = side < 0 ? 0 : 1
  const lean = a.lean[i] as number
  const len = (a.length[i] as number) * BW
  const root: Pt = [CX + side * 0.05 * BW, g.top + 0.07 * g.height]
  const dir: Pt = [side * sinDeg(lean), -cosDeg(lean)]
  const tip: Pt = [root[0] + dir[0] * len, root[1] + dir[1] * len]
  const bow = a.bend * len * 0.18
  const mid: Pt = [
    (root[0] + tip[0]) / 2 - dir[1] * bow * side,
    (root[1] + tip[1]) / 2 + dir[0] * bow * side,
  ]
  const s = a.tip * BW
  const stem =
    a.bend === 0
      ? `<path d="M${pt(root)}L${pt(tip)}"/>`
      : `<path d="M${pt(root)}Q${pt(mid)} ${pt(tip)}"/>`
  const square = `<rect x="${n(tip[0] - s / 2)}" y="${n(tip[1] - s / 2)}" width="${n(s)}" height="${n(s)}" transform="rotate(${n(side * lean)} ${pt(tip)})" fill="${accent}"/>`
  return `<g class="nb-a${side < 0 ? 'l' : 'r'}" stroke="${accent}" stroke-width="${n(0.034 * BW)}" fill="none">${stem}${square}</g>`
}

const OPEN: Record<Traits['mood'], number> = {
  neutral: 1,
  curious: 1,
  pleased: 0.82,
  thinking: 0.7,
  sleepy: 0.3,
}
const LIFT: Record<Traits['mood'], number> = {
  neutral: 0,
  curious: 0.02,
  pleased: 0.008,
  thinking: 0.01,
  sleepy: -0.006,
}
const RATIO: Record<Eyes['shape'], number> = { round: 1, tall: 1.1, wide: 0.86, almond: 0.78 }

function eyes(
  g: BodyGeometry,
  t: Traits,
  small: boolean,
): { svg: string; top: number; outer: number; y: number } {
  const e = t.eyes
  const y = g.top + e.depth * g.height
  const rx = (e.size * BW) / 2
  const ry = rx * RATIO[e.shape]
  const open = OPEN[t.mood]
  const oy = ry * open
  const cy = y + (ry - oy)
  const dx = (e.spacing * BW) / 2
  const p = t.palette
  let svg = ''
  for (const side of [-1, 1] as const) {
    const cx = CX + side * dx
    const rot = e.shape === 'almond' ? ` transform="rotate(${-side * 8} ${n(cx)} ${n(cy)})"` : ''
    svg += `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(oy)}" fill="${p.eye}"${rot}/>`
    if (!small && e.catchlight !== 'none' && open > 0.5) {
      const big = e.catchlight === 'asymmetric' && side < 0 ? 0.36 : 0.2
      const r = rx * (e.catchlight === 'pair' ? 0.26 : big)
      svg += `<circle cx="${n(cx - rx * 0.36)}" cy="${n(cy - oy * 0.38)}" r="${n(r)}" fill="${p.catchlight}"/>`
    }
  }
  return { svg, top: y - ry, outer: dx + rx, y }
}

function brow(t: Traits, top: number, outer: number, small: boolean): string {
  const lift = LIFT[t.mood] * BW
  const y = top - 0.045 * BW - lift
  const w = t.brow.shape === 'bold' || small ? 0.034 * BW : 0.02 * BW
  const tilt = Math.max(-6, Math.min(6, t.brow.tilt))
  const l = CX - outer
  const r = CX + outer
  let d: string
  if (t.brow.shape === 'wave') {
    const q = (r - l) / 4
    const a = 0.018 * BW
    d = `M${n(l)},${n(y)}Q${n(l + q)},${n(y - a)} ${n(CX)},${n(y)}T${n(r)},${n(y)}`
  } else if (t.brow.shape === 'split') {
    const gap = 0.05 * BW
    d = `M${n(l)},${n(y)}L${n(CX - gap)},${n(y)}M${n(CX + gap)},${n(y)}L${n(r)},${n(y)}`
  } else {
    d = `M${n(l)},${n(y)}L${n(r)},${n(y)}`
  }
  return `<path d="${d}" fill="none" stroke="${t.palette.accent}" stroke-width="${n(w)}" stroke-linecap="round" transform="rotate(${n(tilt)} ${n(CX)} ${n(y)})"/>`
}

function mouth(t: Traits, eyeY: number, g: BodyGeometry): string {
  const y = eyeY + 0.17 * g.height
  const c = t.palette.eye
  switch (t.mouth) {
    case 'dot':
      return `<circle cx="${CX}" cy="${n(y)}" r="${n(0.018 * BW)}" fill="${c}"/>`
    case 'line':
      return `<path d="M${n(CX - 0.04 * BW)},${n(y)}L${n(CX + 0.04 * BW)},${n(y)}" stroke="${c}" stroke-width="${n(0.016 * BW)}" stroke-linecap="round"/>`
    case 'smile':
      return `<path d="M${n(CX - 0.05 * BW)},${n(y)}Q${CX},${n(y + 0.035 * BW)} ${n(CX + 0.05 * BW)},${n(y)}" fill="none" stroke="${c}" stroke-width="${n(0.016 * BW)}" stroke-linecap="round"/>`
    default:
      return ''
  }
}

/** A band hugging the body between two heights (fractions of height from the base). */
function band(g: BodyGeometry, from: number, to: number, fill: string, inset = 0): string {
  const y0 = BASE_Y - from * g.height
  const y1 = BASE_Y - to * g.height
  const h0 = g.halfWidthAt(y0) - inset
  const h1 = g.halfWidthAt(y1) - inset
  const sag = 0.02 * BW
  return `<path d="M${n(CX - h1)},${n(y1)}Q${CX},${n(y1 + sag)} ${n(CX + h1)},${n(y1)}L${n(CX + h0)},${n(y0)}Q${CX},${n(y0 + sag)} ${n(CX - h0)},${n(y0)}Z" fill="${fill}"/>`
}

function extra(g: BodyGeometry, t: Traits): string {
  const p = t.palette
  switch (t.extra) {
    case 'scarf':
      return (
        band(g, 0.2, 0.3, p.wear) +
        `<rect x="${n(CX + 0.06 * BW)}" y="${n(BASE_Y - 0.25 * g.height)}" width="${n(0.08 * BW)}" height="${n(0.16 * BW)}" rx="${n(0.015 * BW)}" fill="${p.wear}"/>`
      )
    case 'collar':
      return band(g, 0.3, 0.34, p.wear)
    case 'hat':
      // open at the top and stopping below the antenna roots: antennae own the crown
      return band(g, 0.66, 0.84, p.wear) + band(g, 0.64, 0.68, p.accent, -0.01 * BW)
    case 'pin': {
      const y = BASE_Y - 0.26 * g.height
      return `<circle cx="${n(CX - 0.17 * BW)}" cy="${n(y)}" r="${n(0.045 * BW)}" fill="${p.accent}"/>`
    }
    default:
      return ''
  }
}

export function backdrop(kind: Background, fill: string): string {
  switch (kind) {
    case 'circle':
      return `<circle cx="50" cy="50" r="50" fill="${fill}"/>`
    case 'square':
      return `<rect width="100" height="100" fill="${fill}"/>`
    case 'squircle':
      return `<rect width="100" height="100" rx="30" fill="${fill}"/>`
    default:
      return ''
  }
}

export const esc = (s: string) =>
  s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string,
  )

const SWAY =
  '<style>@media (prefers-reduced-motion:no-preference){.nb:hover .nb-al,.nb:focus-visible .nb-al{animation:nb-l 2.4s ease-in-out infinite}.nb:hover .nb-ar,.nb:focus-visible .nb-ar{animation:nb-r 2.4s ease-in-out infinite}.nb-al,.nb-ar{transform-box:view-box;transform-origin:50% 40%}@keyframes nb-l{50%{transform:rotate(-4deg)}}@keyframes nb-r{50%{transform:rotate(3deg)}}}</style>'

export function render(t: Traits, opts: RenderOptions = {}): string {
  const size = opts.size ?? 128
  const small = size <= 32
  const g = body(t.silhouette)
  const face = eyes(g, t, small)
  const title = esc(opts.title ?? 'Nurbling')
  const parts = [
    opts.animate ? SWAY : '',
    `<title>${title}</title>`,
    backdrop(opts.background ?? 'none', t.palette.background),
    antenna(g, t.antennae, -1, t.palette.accent),
    antenna(g, t.antennae, 1, t.palette.accent),
    `<path d="${bodyPath(g)}" fill="${t.palette.shell}"/>`,
    small ? '' : extra(g, t),
    face.svg,
    brow(t, face.top, face.outer, small),
    small ? '' : mouth(t, face.y, g),
  ]
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}" width="${size}" height="${size}" role="img" aria-label="${title}" class="nb">${parts.join('')}</svg>`
}
