// The public entry: seed in, SVG out.

import {
  ACCENTS,
  ANTENNA_COUNTS,
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
  SHAPE_JITTER,
  SHELLS,
  type ShellName,
  SILHOUETTE_WEIGHTS,
  SILHOUETTES,
  type SilhouetteName,
} from './gen1'
import { isFlagshipSeed, renderFlagship } from './protect'
import { normaliseSeed, stream } from './seed'
import { render, type Slots, shade } from './svg'
import type { Extra, Mood, Mouth, RenderOptions, Silhouette, Traits } from './types'

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

/** A colour as 6-digit hex. */
export type Hex = `#${string}`

/** A body design: a silhouette without its per-seed grain, and how often it is drawn. */
export type SilhouetteShape = Omit<Silhouette, 'grain'> & { weight?: number }

/** App-wide overrides for `createNurblings`. Each table replaces the built-in one. */
export interface NurblingsConfig {
  /** body colours; each is paired only with accents that read on it */
  shells?: Readonly<Record<string, Hex>>
  /** brow and antenna colours; ones that do not read on light and dark pages are never used */
  accents?: Readonly<Record<string, Hex>>
  /** body designs; spread `SILHOUETTES` to extend the built-in set, leave names out to drop them */
  silhouettes?: Readonly<Record<string, SilhouetteShape>>
  /** replace, wrap or drop any drawn part */
  slots?: Slots
  /** options applied to every call */
  defaults?: Omit<NurblingOptions, 'silhouette' | 'shell'>
}

type NamesOf<T, Fallback extends string> =
  T extends Readonly<Record<string, unknown>> ? Extract<keyof T, string> : Fallback

/** Options for a configured instance: `silhouette` and `shell` name that instance's own tables. */
export type ConfiguredOptions<C extends NurblingsConfig> = Omit<
  NurblingOptions,
  'silhouette' | 'shell'
> & {
  silhouette?: NamesOf<C['silhouettes'], SilhouetteName>
  shell?: NamesOf<C['shells'], ShellName>
}

type Pins = Omit<NurblingOptions, 'silhouette' | 'shell'> & { silhouette?: string; shell?: string }

interface ShellEntry {
  shell: string
  background: string
  /** accents that read on this shell, as hex */
  accents: readonly string[]
}

interface Tables {
  shells: Readonly<Record<string, ShellEntry>>
  silhouettes: Readonly<Record<string, SilhouetteShape>>
  weights: readonly (readonly [string, number])[]
}

const DEFAULT_TABLES: Tables = {
  shells: Object.fromEntries(
    Object.entries(SHELLS).map(([name, s]) => [
      name,
      { shell: s.shell, background: s.background, accents: s.accents.map((a) => ACCENTS[a]) },
    ]),
  ),
  silhouettes: SILHOUETTES,
  weights: SILHOUETTE_WEIGHTS,
}

const round = (x: number) => Math.round(x * 100) / 100

/** Most rerolls before a seed stops trying to leave the protected region. */
const MAX_REROLLS = 8

const CHOICES: readonly (readonly [keyof Pins, readonly string[]])[] = [
  ['mood', MOODS.map(([m]) => m)],
  ['mouth', MOUTHS.map(([m]) => m)],
  ['extra', EXTRAS.map(([e]) => e)],
]

// Every trait is always drawn, then overridden by a pinned option, so pinning
// one trait never shifts any other random draw. The one deliberate exception:
// a pinned shell re-pairs its accent and wear colour from the accents that
// read on that shell, because the contrast rules come first.
function draw(seed: string, attempt: number, opts: Pins, tables: Tables): Traits {
  const key = (group: string) => stream(seed, attempt === 0 ? group : `${group}#${attempt}`)

  // a design, then this seed's own small variation of it and its own plate pattern
  const b = key('body')
  const drawnShape = b.weighted(tables.weights)
  const shape = tables.silhouettes[opts.silhouette ?? drawnShape] as SilhouetteShape
  const wobble = (x: number, j: number) => round(x + b.range(-j, j))
  const silhouette: Silhouette = {
    ...shape,
    hw: wobble(shape.hw, SHAPE_JITTER.hw),
    width: wobble(shape.width ?? 1, SHAPE_JITTER.width),
    belly: wobble(shape.belly, SHAPE_JITTER.belly),
    tip: wobble(shape.tip, SHAPE_JITTER.tip),
    grain: 1 + b.int(999_999),
  }

  const c = key('colour')
  const drawnShell = c.pick(Object.keys(tables.shells))
  const entry = tables.shells[opts.shell ?? drawnShell] as ShellEntry
  const accent = c.pick(entry.accents)
  const wear = c.pick(entry.accents.filter((a) => a !== accent))

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
  const count = a.weighted(ANTENNA_COUNTS)

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
    // a fresh object: callers may mutate what traits() returns without touching the tables
    silhouette,
    antennae: { count, lean, length: [l0, l1], bend, tip },
    eyes,
    brow,
    mouth: opts.mouth ?? mouth,
    extra: opts.extra ?? extra,
    mood: opts.mood ?? mood,
    palette: {
      shell: entry.shell,
      accent,
      eye: EYE,
      catchlight: CATCHLIGHT,
      wear,
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

function resolve(seed: string, opts: Pins, tables: Tables): Traits {
  if (opts.gen !== undefined && opts.gen !== 1) {
    throw new RangeError(`nurblings: unknown generation ${String(opts.gen)}`)
  }
  const pins: readonly (readonly [keyof Pins, readonly string[]])[] = [
    ...CHOICES,
    ['silhouette', Object.keys(tables.silhouettes)],
    ['shell', Object.keys(tables.shells)],
  ]
  for (const [name, allowed] of pins) {
    const value = opts[name]
    if (value !== undefined && !allowed.includes(value as string)) {
      throw new RangeError(`nurblings: unknown ${name} ${String(value)}`)
    }
  }
  const normal = normaliseSeed(seed)
  let t = draw(normal, 0, opts, tables)
  for (let attempt = 1; attempt <= MAX_REROLLS && inProtectedRegion(t); attempt++) {
    t = draw(normal, attempt, opts, tables)
  }
  // The region can only be reached through Nurbi's quiet face unless a palette
  // brings its own near-flagship accent; a wave brow always breaks the quiet face.
  if (inProtectedRegion(t)) t = { ...t, brow: { ...t.brow, shape: 'wave' } }
  return t
}

/** The traits a seed resolves to, before rendering. */
export function traits(seed: string, opts: NurblingOptions = {}): Traits {
  return resolve(seed, opts, DEFAULT_TABLES)
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

const LIGHT_GROUND = '#f7f5f2'
const DARK_GROUND = '#16161a'

/** WCAG contrast ratio between two hex colours. */
export function contrast(a: string, b: string): number {
  // ponytail: Math.pow, but only at setup, never per avatar; engines could only
  // disagree on an exact threshold tie. A fixed sRGB table removes even that.
  const lum = (hex: string) => {
    const v = Number.parseInt(hex.slice(1), 16)
    const lin = (c: number) => {
      const s = c / 255
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * lin(v >> 16) + 0.7152 * lin((v >> 8) & 255) + 0.0722 * lin(v & 255)
  }
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

function hexes(record: Readonly<Record<string, string>>): [string, string][] {
  return Object.entries(record).map(([name, hex]) => {
    const h = hex.toLowerCase()
    if (!/^#[0-9a-f]{6}$/.test(h)) {
      throw new RangeError(`nurblings: ${name} must be a 6-digit hex colour, got ${hex}`)
    }
    return [name, h]
  })
}

/**
 * The tables a config draws from. Colours are paired by contrast: an accent
 * must read on light and dark pages and at 3:1 on a shell to be paired with it,
 * and every shell needs readable eyes and at least two accents.
 */
function buildTables(config: NurblingsConfig): Tables {
  const silhouettes = config.silhouettes ?? SILHOUETTES
  if (Object.keys(silhouettes).length === 0) {
    throw new RangeError('nurblings: silhouettes needs at least one design')
  }
  const weights = config.silhouettes
    ? Object.entries(config.silhouettes).map(([name, s]) => [name, s.weight ?? 1] as const)
    : SILHOUETTE_WEIGHTS
  if (!config.shells && !config.accents) return { ...DEFAULT_TABLES, silhouettes, weights }

  const accents = hexes(config.accents ?? ACCENTS).filter(
    ([, hex]) => contrast(hex, LIGHT_GROUND) >= 2.5 && contrast(hex, DARK_GROUND) >= 2.5,
  )
  const shells = config.shells
    ? hexes(config.shells)
    : Object.entries(SHELLS).map(([name, s]): [string, string] => [name, s.shell])
  const table: Record<string, ShellEntry> = {}
  for (const [name, shell] of shells) {
    if (contrast(EYE, shell) < 4.5) {
      throw new RangeError(`nurblings: shell ${name} (${shell}) is too dark for the eyes (4.5:1)`)
    }
    const paired = accents.filter(([, hex]) => contrast(hex, shell) >= 3).map(([, hex]) => hex)
    if (paired.length < 2) {
      throw new RangeError(
        `nurblings: shell ${name} (${shell}) needs two accents that read on it at 3:1, has ${paired.length}`,
      )
    }
    const builtIn = DEFAULT_TABLES.shells[name]
    table[name] = {
      shell,
      background: builtIn && !config.shells ? builtIn.background : shade(shell, 0.6),
      accents: paired,
    }
  }
  return { shells: table, silhouettes, weights }
}

/**
 * An app-wide configured Nurblings: your palette, your body designs, your drawn
 * parts, your defaults. The same config and seed always give the same avatar.
 * Only the default `nurbling()` draws Nurbi for the reserved seeds.
 */
export function createNurblings<const C extends NurblingsConfig>(config: C) {
  const tables = buildTables(config)
  const merge = (opts: ConfiguredOptions<C>): Pins => ({ ...config.defaults, ...opts })
  return {
    traits: (seed: string, opts: ConfiguredOptions<C> = {}): Traits =>
      resolve(seed, merge(opts), tables),
    nurbling: (seed: string, opts: ConfiguredOptions<C> = {}): string => {
      const o = merge(opts)
      return render(resolve(seed, o, tables), o, config.slots)
    },
  }
}

export type Nurblings<C extends NurblingsConfig = NurblingsConfig> = ReturnType<
  typeof createNurblings<C>
>
