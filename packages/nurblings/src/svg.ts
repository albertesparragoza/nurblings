// Traits to SVG string.
//
// Stability rules for everything in this file:
// - only + - * / and Math.sqrt/floor/round/abs/min/max on geometry: those are
//   exact or correctly rounded in every engine. Math.sin, cos and pow are not
//   specified bit for bit, so trigonometry comes from `sinDeg`/`cosDeg` below.
// - every emitted number goes through `n()`, two decimals, no exponent form.
// - no ids: several avatars on one page must not collide, so nothing here
//   uses clipPath, mask, gradients or url(#...) references.

import { NURBI_BELLY, NURBI_PROFILE } from './profile'
import type {
  Antennae,
  Background,
  Eyes,
  Frame,
  PlateZone,
  RenderOptions,
  Silhouette,
  Traits,
} from './types'

const CX = 50
const BASE_Y = 93
/** The standard body width in drawing units; a silhouette's `width` scales it. */
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

/** A hex colour moved toward black (k < 0) or white (k > 0), integer channels only. */
export function shade(hex: string, k: number): string {
  const v = Number.parseInt(hex.slice(1), 16)
  const target = k < 0 ? 0 : 255
  const f = Math.min(1, Math.abs(k))
  const ch = (c: number) =>
    Math.round(c + (target - c) * f)
      .toString(16)
      .padStart(2, '0')
  return `#${ch(v >> 16)}${ch((v >> 8) & 255)}${ch(v & 255)}`
}

/** Resolution of the smooth outline, matching the measured profile. */
const STEPS = 32

/**
 * The half-width of a silhouette at height `f` (0 base, 1 apex), as a share of
 * its widest half-width: Nurbi's profile with the belly moved and the crown made
 * fuller or firmer. The apex is always a soft point, never pinched.
 */
export function profileAt(s: Silhouette, f: number): number {
  const b = NURBI_BELLY
  const belly = Math.max(0.2, Math.min(0.45, s.belly))
  const g = f <= belly ? (f / belly) * b : b + ((f - belly) / (1 - belly)) * (1 - b)
  const last = NURBI_PROFILE.length - 1
  const x = Math.max(0, Math.min(last, g * last))
  const i = Math.min(last - 1, Math.floor(x))
  const h0 = NURBI_PROFILE[i] as number
  const h1 = NURBI_PROFILE[i + 1] as number
  let h = h0 + (h1 - h0) * (x - i)
  if (f > 0.7) h *= 1 + (Math.max(0.8, Math.min(1.2, s.tip)) - 1) * ((f - 0.7) / 0.3)
  return Math.min(1, h)
}

interface Zone {
  /** height range, fractions from the base */
  f0: number
  f1: number
  /** horizontal range, as a share of the half-width (-1 left edge, 1 right edge) */
  u0: number
  u1: number
  /** which sides of the outline turn into straight plate edges */
  sides: readonly (-1 | 1)[]
}

/**
 * Where each plate zone lies. Every zone keeps clear of the eyes and brow. Base
 * plates never straighten the outline: every Nurbling keeps Nurbi's own bottom line.
 */
const ZONES: Record<Exclude<PlateZone, 'none'>, Zone> = {
  crown: { f0: 0.6, f1: 1, u0: -1, u1: 1, sides: [-1, 1] },
  base: { f0: 0.03, f1: 0.25, u0: -1, u1: 1, sides: [] },
  side: { f0: 0.2, f1: 0.86, u0: 0.62, u1: 1, sides: [1] },
}

interface Vertex {
  p: Pt
  /** the segment arriving at this vertex is a straight plate edge */
  straight: boolean
}

export interface BodyGeometry {
  top: number
  height: number
  radius: number
  /** body width in drawing units */
  bw: number
  /** closed outline: from the base centre up the right side to the apex and down the left */
  outline: readonly Vertex[]
  /** index of the apex in `outline` */
  apex: number
  /** plate band edges, as fractions of height from the base */
  edges: readonly number[]
  /** half-width of the body at a given y, on the right side */
  halfWidthAt(y: number): number
}

export function body(s: Silhouette): BodyGeometry {
  const bw = BW * (s.width ?? 1)
  const height = s.hw * bw
  const top = BASE_Y - height
  const radius = bw / 2
  const zone = s.plates ?? 'crown'
  const z = zone === 'none' ? null : ZONES[zone]
  const count = Math.max(1, Math.round(s.rows))
  const edges: number[] = []
  if (z) for (let k = 0; k <= count; k++) edges.push(z.f0 + ((z.f1 - z.f0) * k) / count)

  const inZone = (f: number, side: -1 | 1) => {
    if (!z?.sides.includes(side)) return false
    return f >= z.f0 - 1e-9 && f <= z.f1 + 1e-9
  }
  const heights = (side: -1 | 1): number[] => {
    const fs: number[] = []
    for (let i = 0; i <= STEPS; i++) {
      const f = i / STEPS
      if (!inZone(f, side)) fs.push(f)
    }
    if (z?.sides.includes(side)) fs.push(...edges)
    fs.sort((a, b) => a - b)
    return fs.filter((f, i) => i === 0 || f - (fs[i - 1] as number) > 1e-6)
  }
  const at = (f: number, side: -1 | 1): Pt => [
    CX + side * profileAt(s, f) * radius,
    BASE_Y - f * height,
  ]
  const vertex = (f: number, prev: number, side: -1 | 1): Vertex => ({
    p: at(f, side),
    straight: inZone(f, side) && inZone(prev, side),
  })

  const right = heights(1)
  const left = heights(-1)
  const outline: Vertex[] = [{ p: at(0, 1), straight: inZone(0, 1) && inZone(left[1] ?? 0, -1) }]
  for (let i = 1; i < right.length; i++) {
    outline.push(vertex(right[i] as number, right[i - 1] as number, 1))
  }
  const apex = outline.length - 1
  for (let i = left.length - 2; i >= 1; i--) {
    outline.push(vertex(left[i] as number, left[i + 1] as number, -1))
  }
  // the segment closing the loop, back to the base centre
  outline[0] = {
    p: (outline[0] as Vertex).p,
    straight: inZone(0, -1) && inZone(left[1] ?? 0, -1),
  }

  return {
    top,
    height,
    radius,
    bw,
    outline,
    apex,
    edges,
    halfWidthAt(y) {
      for (let i = 1; i <= apex; i++) {
        const [x0, y0] = (outline[i - 1] as Vertex).p
        const [x1, y1] = (outline[i] as Vertex).p
        if ((y0 - y) * (y1 - y) <= 0 && y0 !== y1) {
          return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0) - CX
        }
      }
      return 0
    },
  }
}

const pt = ([x, y]: Pt) => `${n(x)},${n(y)}`

/**
 * The outline as one path: straight lines along plate edges, smooth Catmull-Rom
 * curves everywhere else. The apex and every plate corner are kept as corners,
 * so the point stays soft but present and the plate edges read clearly.
 */
function outlinePath(g: BodyGeometry): string {
  const v = g.outline
  const count = v.length
  const at = (i: number) => v[(i + count) % count] as Vertex
  const corner = (i: number) => {
    const j = (i + count) % count
    return j === g.apex || at(j).straight || at(j + 1).straight
  }
  let d = `M${pt(at(0).p)}`
  for (let i = 1; i <= count; i++) {
    const cur = at(i)
    if (cur.straight) {
      d += `L${pt(cur.p)}`
      continue
    }
    const p1 = at(i - 1).p
    const p2 = cur.p
    const p0 = corner(i - 1) ? p1 : at(i - 2).p
    const p3 = corner(i) ? p2 : at(i + 1).p
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${pt(c1)} ${pt(c2)} ${pt(p2)}`
  }
  return `${d}Z`
}

/** A small deterministic sequence from an integer: plate tone jitter. */
function jitterSeq(seed: number): () => number {
  let s = Math.floor(Math.abs(seed)) % 2147483647 || 1
  return () => {
    s = (s * 48271) % 2147483647
    return s / 2147483647 - 0.5
  }
}

/**
 * The plates: flat panels staggered like bricks, following the body's curve,
 * lit from the upper left and fading toward the smooth part of the body. They
 * separate by tone alone, like the facets on the 3D head. At small sizes they
 * merge into a few large ones so they never read as noise.
 */
function plates(g: BodyGeometry, s: Silhouette, shell: string, small: boolean): string {
  const zone = s.plates ?? 'crown'
  if (zone === 'none') return ''
  const z = ZONES[zone]
  const wanted = Math.max(2, Math.round(s.cols))
  const cols = small ? 2 : zone === 'side' ? Math.min(2, wanted) : wanted
  const bands = g.edges.length - 1
  const jitter = jitterSeq(s.grain)
  const half = (f: number) => profileAt(s, f) * g.radius
  const y = (f: number) => BASE_Y - f * g.height
  const byTone = new Map<string, string>()
  for (let r = 0; r < bands; r++) {
    const fa = g.edges[r] as number
    const fb = g.edges[r + 1] as number
    const ha = half(fa)
    const hb = half(fb)
    const rowPos = bands === 1 ? 1 : r / (bands - 1)
    // fade toward the smooth part: down for a crown, up for a base
    const rowFade = zone === 'crown' ? 0.5 + 0.5 * rowPos : zone === 'base' ? 1 - 0.5 * rowPos : 1
    const offset = !small && r % 2 === 1 ? 0.5 : 0
    for (let j = -1; j <= cols; j++) {
      const w = z.u1 - z.u0
      const u0 = Math.max(z.u0, z.u0 + (w * (j + offset)) / cols)
      const u1 = Math.min(z.u1, z.u0 + (w * (j + 1 + offset)) / cols)
      const noise = jitter()
      if (u1 - u0 < 1e-6) continue
      const uc = (u0 + u1) / 2
      // a side panel fades toward the face
      const colFade = zone === 'side' ? 0.45 + (0.55 * (uc - z.u0)) / w : 1
      const k =
        (-0.08 * uc + 0.05 * rowPos + (small ? 0 : 0.2 * noise) - (zone === 'side' ? 0.06 : 0)) *
        rowFade *
        colFade
      const tone = shade(shell, Math.round(k * 100) / 100)
      const quad = `M${n(CX + u0 * ha)},${n(y(fa))}L${n(CX + u1 * ha)},${n(y(fa))}L${n(CX + u1 * hb)},${n(y(fb))}L${n(CX + u0 * hb)},${n(y(fb))}Z`
      byTone.set(tone, (byTone.get(tone) ?? '') + quad)
    }
  }
  let svg = ''
  for (const [tone, d] of byTone) if (tone !== shell) svg += `<path d="${d}" fill="${tone}"/>`
  return svg
}

/** The body and its plates alone, in drawing units: the renderer's core, and the flagship's. */
export function bodySvg(s: Silhouette, shell: string, small = false): string {
  const g = body(s)
  return `<path d="${outlinePath(g)}" fill="${shell}"/>${plates(g, s, shell, small)}`
}

interface Stem {
  root: Pt
  tip: Pt
  mid: Pt
  lean: number
  side: -1 | 1
}

/** The drawn antennae: none, one on the centre line (the longer stem), or the classic pair. */
function stems(g: BodyGeometry, a: Antennae): Stem[] {
  const count = a.count ?? 2
  if (count === 0) return []
  const one = (side: -1 | 1, single: boolean): Stem => {
    const i = side < 0 ? 0 : 1
    const lean = (a.lean[i] as number) * (single ? 0.5 : 1)
    const len = (a.length[i] as number) * g.bw
    const root: Pt = [single ? CX : CX + side * 0.05 * g.bw, g.top + 0.07 * g.height]
    const dir: Pt = [side * sinDeg(lean), -cosDeg(lean)]
    const tip: Pt = [root[0] + dir[0] * len, root[1] + dir[1] * len]
    const bow = a.bend * len * 0.18
    const mid: Pt = [
      (root[0] + tip[0]) / 2 - dir[1] * bow * side,
      (root[1] + tip[1]) / 2 + dir[0] * bow * side,
    ]
    return { root, tip, mid, lean, side }
  }
  if (count === 1) return [one((a.length[1] as number) >= (a.length[0] as number) ? 1 : -1, true)]
  return [one(-1, false), one(1, false)]
}

function antennaSvg(g: BodyGeometry, a: Antennae, s: Stem, accent: string): string {
  const side = a.tip * g.bw
  const stem =
    a.bend === 0
      ? `<path d="M${pt(s.root)}L${pt(s.tip)}"/>`
      : `<path d="M${pt(s.root)}Q${pt(s.mid)} ${pt(s.tip)}"/>`
  const square = `<rect x="${n(s.tip[0] - side / 2)}" y="${n(s.tip[1] - side / 2)}" width="${n(side)}" height="${n(side)}" transform="rotate(${n(s.side * s.lean)} ${pt(s.tip)})" fill="${accent}"/>`
  return `<g class="nb-a${s.side < 0 ? 'l' : 'r'}" stroke="${accent}" stroke-width="${n(0.034 * g.bw)}" fill="none">${stem}${square}</g>`
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
  const rx = (e.size * g.bw) / 2
  const ry = rx * RATIO[e.shape]
  const open = OPEN[t.mood] ?? 1
  const oy = ry * open
  const cy = y + (ry - oy)
  const dx = (e.spacing * g.bw) / 2
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

function brow(g: BodyGeometry, t: Traits, top: number, outer: number, small: boolean): string {
  const lift = (LIFT[t.mood] ?? 0) * g.bw
  const y = top - 0.045 * g.bw - lift
  const w = t.brow.shape === 'bold' || small ? 0.034 * g.bw : 0.02 * g.bw
  const tilt = Math.max(-6, Math.min(6, t.brow.tilt))
  const l = CX - outer
  const r = CX + outer
  let d: string
  if (t.brow.shape === 'wave') {
    const q = (r - l) / 4
    const a = 0.018 * g.bw
    d = `M${n(l)},${n(y)}Q${n(l + q)},${n(y - a)} ${n(CX)},${n(y)}T${n(r)},${n(y)}`
  } else if (t.brow.shape === 'split') {
    const gap = 0.05 * g.bw
    d = `M${n(l)},${n(y)}L${n(CX - gap)},${n(y)}M${n(CX + gap)},${n(y)}L${n(r)},${n(y)}`
  } else {
    d = `M${n(l)},${n(y)}L${n(r)},${n(y)}`
  }
  return `<path d="${d}" fill="none" stroke="${t.palette.accent}" stroke-width="${n(w)}" stroke-linecap="round" transform="rotate(${n(tilt)} ${n(CX)} ${n(y)})"/>`
}

function mouth(t: Traits, eyeY: number, g: BodyGeometry): string {
  const y = eyeY + 0.17 * g.height
  const c = t.palette.eye
  const u = g.bw
  switch (t.mouth) {
    case 'dot':
      return `<circle cx="${CX}" cy="${n(y)}" r="${n(0.018 * u)}" fill="${c}"/>`
    case 'line':
      return `<path d="M${n(CX - 0.04 * u)},${n(y)}L${n(CX + 0.04 * u)},${n(y)}" stroke="${c}" stroke-width="${n(0.016 * u)}" stroke-linecap="round"/>`
    case 'smile':
      return `<path d="M${n(CX - 0.05 * u)},${n(y)}Q${CX},${n(y + 0.035 * u)} ${n(CX + 0.05 * u)},${n(y)}" fill="none" stroke="${c}" stroke-width="${n(0.016 * u)}" stroke-linecap="round"/>`
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
  const sag = 0.02 * g.bw
  return `<path d="M${n(CX - h1)},${n(y1)}Q${CX},${n(y1 + sag)} ${n(CX + h1)},${n(y1)}L${n(CX + h0)},${n(y0)}Q${CX},${n(y0 + sag)} ${n(CX - h0)},${n(y0)}Z" fill="${fill}"/>`
}

function extra(g: BodyGeometry, t: Traits): string {
  const p = t.palette
  const u = g.bw
  switch (t.extra) {
    case 'scarf':
      return (
        band(g, 0.2, 0.3, p.wear) +
        `<rect x="${n(CX + 0.06 * u)}" y="${n(BASE_Y - 0.25 * g.height)}" width="${n(0.08 * u)}" height="${n(0.16 * u)}" rx="${n(0.015 * u)}" fill="${p.wear}"/>`
      )
    case 'collar':
      return band(g, 0.3, 0.34, p.wear)
    case 'hat':
      // open at the top and stopping below the antenna roots: antennae own the crown
      return band(g, 0.66, 0.84, p.wear) + band(g, 0.64, 0.68, p.accent, -0.01 * u)
    case 'pin': {
      const y = BASE_Y - 0.26 * g.height
      return `<circle cx="${n(CX - 0.17 * u)}" cy="${n(y)}" r="${n(0.045 * u)}" fill="${p.accent}"/>`
    }
    default:
      return ''
  }
}

/** A square view box in drawing units. */
export interface Box {
  x: number
  y: number
  s: number
}

/**
 * The square the creature is framed in. `full` fits the body and every antenna
 * tip with a margin; `portrait` centres on the face and body and lets antenna
 * tips run off the edge, which reads better in small round avatars.
 */
function frameBox(g: BodyGeometry, t: Traits, frame: 'full' | 'portrait'): Box {
  if (frame === 'portrait') {
    const s = Math.max(g.bw * 1.36, g.height * 1.18)
    const cy = g.top + g.height * 0.52
    return { x: CX - s / 2, y: cy - s / 2, s }
  }
  let minX = CX - g.radius
  let maxX = CX + g.radius
  let minY = g.top
  const maxY = BASE_Y
  const half = (t.antennae.tip * g.bw) / 1.4
  for (const s of stems(g, t.antennae)) {
    minX = Math.min(minX, s.tip[0] - half)
    maxX = Math.max(maxX, s.tip[0] + half)
    minY = Math.min(minY, s.tip[1] - half)
  }
  const s = Math.max(maxX - minX, maxY - minY) * 1.12
  return { x: (minX + maxX) / 2 - s / 2, y: (minY + maxY) / 2 - s / 2, s }
}

export function backdrop(kind: Background, fill: string, box: Box): string {
  const { x, y, s } = box
  switch (kind) {
    case 'circle':
      return `<circle cx="${n(x + s / 2)}" cy="${n(y + s / 2)}" r="${n(s / 2)}" fill="${fill}"/>`
    case 'square':
      return `<rect x="${n(x)}" y="${n(y)}" width="${n(s)}" height="${n(s)}" fill="${fill}"/>`
    case 'squircle':
      return `<rect x="${n(x)}" y="${n(y)}" width="${n(s)}" height="${n(s)}" rx="${n(s * 0.3)}" fill="${fill}"/>`
    default:
      return ''
  }
}

export const esc = (s: string) =>
  s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string,
  )

// Inline SVG styles apply to the whole page, so every rule is scoped by a layer
// class on the avatar's own root: animated and still avatars can share a page,
// and this text is identical in every avatar. Timing comes from per-avatar
// custom properties on the root.
export const MOTION =
  '<style>@media (prefers-reduced-motion:no-preference){.nb-f,.nb-e,.nb-al,.nb-ar{transform-box:fill-box;transform-origin:50% 100%}.nb-e{transform-origin:50% 50%}.nb-mb .nb-f{animation:nb-b var(--nb-b) ease-in-out var(--nb-o) infinite}.nb-ma .nb-al{animation:nb-l var(--nb-l) ease-in-out var(--nb-o) infinite}.nb-ma .nb-ar{animation:nb-r var(--nb-r) ease-in-out var(--nb-o) infinite}.nb-mk .nb-e{animation:nb-k var(--nb-k) linear var(--nb-o) infinite}.nb-mh:hover .nb-al{animation:nb-l .9s ease-in-out infinite}.nb-mh:hover .nb-ar{animation:nb-r .9s ease-in-out infinite}@keyframes nb-b{50%{transform:scale(.98,1.03)}}@keyframes nb-l{50%{transform:rotate(-4deg)}}@keyframes nb-r{50%{transform:rotate(4deg)}}@keyframes nb-k{0%,95%,100%{transform:none}97.5%{transform:scaleY(.1)}}}</style>'

const LAYERS = { mb: 'breath', mk: 'blink', ma: 'antennae', mh: 'hover' } as const

/** The root attribute `morph` looks for; nothing when no key is set. */
export const tagFor = (opts: RenderOptions) =>
  opts.transition ? ` data-nurbling-transition="${esc(opts.transition)}"` : ''

/**
 * The root classes and timing for an animated avatar, or nothing for a still
 * one. Periods come from the seed's grain, so a grid never breathes in unison
 * and a seed always moves the same way.
 */
export function motion(
  grain: number,
  sleepy: boolean,
  animate: RenderOptions['animate'],
  small: boolean,
): { cls: string; style: string } | undefined {
  // ponytail: nothing moves at 32 px and below; blink alone could come back if asked.
  if (animate === false || small) return
  const m = typeof animate === 'object' ? animate : {}
  const speed = m.speed ?? 1
  if (!Number.isFinite(speed) || speed <= 0) {
    throw new RangeError(`nurblings: animate.speed must be a positive number, got ${String(speed)}`)
  }
  let cls = ''
  for (const [k, layer] of Object.entries(LAYERS)) if (m[layer] !== false) cls += ` nb-${k}`
  if (!cls) return
  const r = jitterSeq(grain + 7)
  r() // the first value barely depends on a small seed; skip it
  const slow = (sleepy ? 1.4 : 1) / speed
  const sec = (base: number, spread: number) => `${n((base + r() * spread) * slow)}s`
  const style = `--nb-b:${sec(3.8, 1.2)};--nb-l:${sec(5.5, 3)};--nb-r:${sec(5.5, 3)};--nb-k:${sec(4.75, 2.5)};--nb-o:${sec(-1.5, 3)}`
  return { cls, style }
}

/** Largest size, in pixels, that `auto` framing draws as a portrait. */
export const PORTRAIT_UP_TO = 48

/** The framing actually used: `auto` is portrait at small sizes and full above. */
export function resolveFrame(frame: Frame | undefined, size: number): 'full' | 'portrait' {
  if (frame === 'full' || frame === 'portrait') return frame
  return size <= PORTRAIT_UP_TO ? 'portrait' : 'full'
}

/** The rendered size in pixels. Must be a positive, finite number; defaults to 128. */
export function pixelSize(size: number | undefined): number {
  const s = size ?? 128
  if (!Number.isFinite(s) || s <= 0) {
    throw new RangeError(`nurblings: size must be a positive number, got ${String(s)}`)
  }
  return s
}

/** The drawn parts, in paint order. Each can be replaced, wrapped or dropped. */
export const SLOTS = [
  'backdrop',
  'antennae',
  'body',
  'plates',
  'extra',
  'eyes',
  'brow',
  'mouth',
] as const

export type SlotName = (typeof SLOTS)[number]

/** Read-only all the way down; functions stay callable. */
export type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T

export interface SlotContext {
  readonly traits: DeepReadonly<Traits>
  readonly geometry: DeepReadonly<BodyGeometry>
  readonly size: number
  /** true at 32 px and below, where the built-in mouth and extras are dropped */
  readonly small: boolean
}

/**
 * A slot override: `false` drops the part; a function replaces it, or wraps it
 * by calling `base()` for the built-in markup. Output must stay id-free.
 */
export type Slot = false | ((ctx: SlotContext, base: () => string) => string)

export type Slots = Partial<Record<SlotName, Slot>>

export function render(t: Traits, opts: RenderOptions = {}, slots: Slots = {}): string {
  const size = pixelSize(opts.size)
  const small = size <= 32
  const g = body(t.silhouette)
  const box = frameBox(g, t, resolveFrame(opts.frame, size))
  const face = eyes(g, t, small)
  const title = esc(opts.title ?? 'Nurbling')
  const built: Record<SlotName, () => string> = {
    backdrop: () => backdrop(opts.background ?? 'none', t.palette.background, box),
    antennae: () =>
      stems(g, t.antennae)
        .map((s) => antennaSvg(g, t.antennae, s, t.palette.accent))
        .join(''),
    body: () => `<path d="${outlinePath(g)}" fill="${t.palette.shell}"/>`,
    plates: () => plates(g, t.silhouette, t.palette.shell, small),
    extra: () => (small ? '' : extra(g, t)),
    eyes: () => face.svg,
    brow: () => brow(g, t, face.top, face.outer, small),
    mouth: () => (small ? '' : mouth(t, face.y, g)),
  }
  const ctx: SlotContext = { traits: t, geometry: g, size, small }
  const live = motion(t.silhouette.grain, t.mood === 'sleepy', opts.animate, small)
  const [backdropSvg, ...figure] = SLOTS.map((name) => {
    const slot = slots[name]
    if (slot === false) return ''
    const out = slot ? slot(ctx, built[name]) : built[name]()
    return live && name === 'eyes' && out ? `<g class="nb-e">${out}</g>` : out
  })
  const drawn = live ? `<g class="nb-f">${figure.join('')}</g>` : figure.join('')
  const vb = `${n(box.x)} ${n(box.y)} ${n(box.s)} ${n(box.s)}`
  const root = (live ? `class="nb${live.cls}" style="${live.style}"` : 'class="nb"') + tagFor(opts)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${n(size)}" height="${n(size)}" role="img" aria-label="${title}" ${root}>${live ? MOTION : ''}<title>${title}</title>${backdropSvg}${drawn}</svg>`
}
