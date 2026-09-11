// The public entry: seed in, SVG out.

import {
  ACCENTS,
  type AccentName,
  BENDS,
  BROWS,
  CATCHLIGHT,
  CATCHLIGHTS,
  EXTRAS,
  EYE,
  EYE_SHAPES,
  MOODS,
  MOUTHS,
  RANGES,
  SHELLS,
  type ShellName,
  SILHOUETTES,
  type SilhouetteName,
} from './gen1'
import { isFlagshipSeed, renderFlagship } from './protect'
import { normaliseSeed, stream } from './seed'
import { render } from './svg'
import type { Extra, Mood, Mouth, RenderOptions, Traits } from './types'

export interface NurblingOptions extends RenderOptions {
  /** trait generation; pin it so an avatar never changes under a future release */
  gen?: 1
  /** lock these traits and derive the rest from the seed */
  mood?: Mood
  mouth?: Mouth
  extra?: Extra
  silhouette?: SilhouetteName
  shell?: ShellName
}

const round = (x: number) => Math.round(x * 100) / 100

/** Most rerolls before a seed stops trying to leave the protected region. */
const MAX_REROLLS = 8

const SILHOUETTE_NAMES = Object.keys(SILHOUETTES) as SilhouetteName[]
const SHELL_NAMES = Object.keys(SHELLS) as ShellName[]
const PINNABLE: readonly (readonly [keyof NurblingOptions, readonly string[]])[] = [
  ['mood', MOODS.map(([m]) => m)],
  ['mouth', MOUTHS.map(([m]) => m)],
  ['extra', EXTRAS.map(([e]) => e)],
  ['silhouette', SILHOUETTE_NAMES],
  ['shell', SHELL_NAMES],
]

// Every trait is always drawn, then overridden by a pinned option, so pinning
// one trait never shifts what the seed gives any other.
function draw(seed: string, attempt: number, opts: NurblingOptions): Traits {
  const key = (group: string) => stream(seed, attempt === 0 ? group : `${group}#${attempt}`)

  const silhouetteName = opts.silhouette ?? key('body').pick(SILHOUETTE_NAMES)

  const c = key('colour')
  const drawnShell = c.pick(SHELL_NAMES)
  const shellName = opts.shell ?? drawnShell
  const entry = SHELLS[shellName]
  const accent: AccentName = c.pick(entry.accents)
  const wear: AccentName = c.pick(entry.accents.filter((a) => a !== accent))

  const a = key('antennae')
  const [lo, hi] = RANGES.length
  const l0 = round(a.range(lo, hi))
  let l1 = round(a.range(lo, hi))
  if (Math.abs(l1 - l0) < RANGES.lengthGap) {
    l1 = round(l0 + (l0 < (lo + hi) / 2 ? 2 : -2) * RANGES.lengthGap)
  }
  const lean: [number, number] = [round(a.range(...RANGES.lean)), round(a.range(...RANGES.lean))]
  const bend = a.weighted(BENDS)
  const tip = round(a.range(...RANGES.tip))

  const e = key('eyes')
  const eyes = {
    shape: e.pick(EYE_SHAPES),
    size: round(e.range(...RANGES.eyeSize)),
    spacing: round(e.range(...RANGES.eyeSpacing)),
    depth: round(e.range(...RANGES.eyeDepth)),
    catchlight: e.weighted(CATCHLIGHTS),
  }

  const f = key('face')
  const brow = { shape: f.pick(BROWS), tilt: f.int(2 * RANGES.browTilt + 1) - RANGES.browTilt }
  const mouth = f.weighted(MOUTHS)
  const extra = f.weighted(EXTRAS)
  const mood = f.weighted(MOODS)

  return {
    gen: 1,
    // a copy: callers may mutate what traits() returns without touching the tables
    silhouette: { ...SILHOUETTES[silhouetteName] },
    antennae: { lean, length: [l0, l1], bend, tip },
    eyes,
    brow,
    mouth: opts.mouth ?? mouth,
    extra: opts.extra ?? extra,
    mood: opts.mood ?? mood,
    palette: {
      shell: entry.shell,
      accent: ACCENTS[accent],
      eye: EYE,
      catchlight: CATCHLIGHT,
      wear: ACCENTS[wear],
      background: entry.background,
    },
  }
}

const FLAGSHIP_SHELL = '#efe9df'
const FLAGSHIP_ACCENT = '#ff2f6e'

/** Squared RGB distance, integer multiplication only: the same answer in every engine. */
export function colourDistance(a: string, b: string): number {
  const x = Number.parseInt(a.slice(1), 16)
  const y = Number.parseInt(b.slice(1), 16)
  const dr = (x >> 16) - (y >> 16)
  const dg = ((x >> 8) & 255) - ((y >> 8) & 255)
  const db = (x & 255) - (y & 255)
  return dr * dr + dg * dg + db * db
}

/**
 * The protected region around Nurbi: a near-ivory shell together with either a
 * near-hot-pink accent or Nurbi's quiet face (mouthless, level brow). A pale
 * shell alone is not a near copy, so it stays in the pool.
 */
export function inProtectedRegion(t: Traits): boolean {
  const shellNear = colourDistance(t.palette.shell, FLAGSHIP_SHELL) < 45 * 45
  const accentNear = colourDistance(t.palette.accent, FLAGSHIP_ACCENT) < 80 * 80
  const quietFace = t.mouth === 'none' && t.brow.shape === 'level' && Math.abs(t.brow.tilt) <= 1
  return shellNear && (accentNear || quietFace)
}

/** The traits a seed resolves to, before rendering. */
export function traits(seed: string, opts: NurblingOptions = {}): Traits {
  if (opts.gen !== undefined && opts.gen !== 1) {
    throw new RangeError(`nurblings: unknown generation ${String(opts.gen)}`)
  }
  for (const [name, allowed] of PINNABLE) {
    const value = opts[name]
    if (value !== undefined && !allowed.includes(value as string)) {
      throw new RangeError(`nurblings: unknown ${name} ${String(value)}`)
    }
  }
  const normal = normaliseSeed(seed)
  let t = draw(normal, 0, opts)
  for (let attempt = 1; attempt <= MAX_REROLLS && inProtectedRegion(t); attempt++) {
    t = draw(normal, attempt, opts)
  }
  // No generation 1 accent is near the flagship's, so the region can only be
  // reached through Nurbi's quiet face. A pinned pale shell could keep landing
  // on it; a wave brow always breaks it, whatever the rerolls drew.
  if (inProtectedRegion(t)) t = { ...t, brow: { ...t.brow, shape: 'wave' } }
  return t
}

/** Any string in, a Nurbling out, as an SVG string. The same string always hatches the same one. */
export function nurbling(seed: string, opts: NurblingOptions = {}): string {
  if (isFlagshipSeed(seed)) return renderFlagship(opts)
  return render(traits(seed, opts), opts)
}

/** An SVG string as a data URI, for an img src or a CSS background. */
export function toDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
