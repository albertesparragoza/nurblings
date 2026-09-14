// The public entry: seed in, SVG out.

import { checkDesign, checkTraits } from './check'
import { contrast, ensureContrast, shade } from './colour'
import { compose, extension, type Part, type Props, type Slots } from './extend'
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
import { normaliseSeed, type Rng, stream } from './seed'
import { render } from './svg'
import type { Extra, Mood, Mouth, Palette, RenderOptions, Silhouette, Traits } from './types'

export { contrast }

/** A colour as 6-digit hex. */
export type Hex = `#${string}`

/**
 * A named set of colours for the whole family. Pass one as `theme`, or use a
 * built-in one from `nurblings/themes`, or make one with `palette()` there.
 */
export interface Theme {
  readonly name: string
  /** body colours; eyes turn light on a dark body */
  readonly shells: Readonly<Record<string, Hex>>
  /** brow, antenna and extra colours; each is darkened or lightened until it reads on a body */
  readonly accents: Readonly<Record<string, Hex>>
  /** container colours on light pages; each seed takes one that stands apart from its body */
  readonly backdrops?: readonly Hex[]
  /** container colours on dark pages */
  readonly darkBackdrops?: readonly Hex[]
}

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

/** A body design: a silhouette without its per-seed grain, and how often it is drawn. */
export type SilhouetteShape = Omit<Silhouette, 'grain'> & { weight?: number }

/** App-wide overrides for `createNurblings`. Each table replaces the built-in one. */
export interface NurblingsConfig {
  /** a colour set for every avatar; `shells` and `accents` below still win */
  theme?: Theme
  /** body colours; each is paired only with accents that read on it */
  shells?: Readonly<Record<string, Hex>>
  /** brow and antenna colours; ones that do not read on light and dark pages are never used */
  accents?: Readonly<Record<string, Hex>>
  /** body designs; spread `SILHOUETTES` to extend the built-in set, leave names out to drop them */
  silhouettes?: Readonly<Record<string, SilhouetteShape>>
  /** replace, wrap or drop any drawn part, built in or added by `parts` */
  slots?: Slots
  /** new parts, each painted after the part it names */
  parts?: Readonly<Record<string, Part>>
  /** data every slot and part can read as `ctx.props`; a call's own props win */
  props?: Props
  /** presets applied before this config, in order: see `compose` */
  use?: readonly NurblingsConfig[]
  /** options applied to every call */
  defaults?: Omit<NurblingOptions, 'silhouette' | 'shell'>
}

type NamesOf<T, Fallback extends string> =
  T extends Readonly<Record<string, unknown>> ? Extract<keyof T, string> : Fallback

/** Body colour names: the config's own shells, else its theme's, else the built-in ones. */
type ShellNamesOf<C extends NurblingsConfig> =
  C['shells'] extends Readonly<Record<string, unknown>>
    ? Extract<keyof C['shells'], string>
    : C['theme'] extends Theme
      ? Extract<keyof C['theme']['shells'], string>
      : ShellName

/** Options for a configured instance: `silhouette` and `shell` name that instance's own tables. */
export type ConfiguredOptions<C extends NurblingsConfig> = Omit<
  NurblingOptions,
  'silhouette' | 'shell'
> & {
  /** colours for this call; the creature's shape and face stay the same */
  theme?: Theme
  silhouette?: NamesOf<C['silhouettes'], SilhouetteName>
  shell?: ShellNamesOf<C>
  /** data for this call's slots and parts, over the config's `props` */
  props?: Props
}

type Pins = Omit<NurblingOptions, 'silhouette' | 'shell'> & {
  silhouette?: string
  shell?: string
  theme?: Theme
  props?: Props
}

interface ShellEntry {
  shell: string
  eye: string
  /** accents that read on this shell, as hex */
  accents: readonly string[]
  /** container colours, light and dark pages; the seed's grain picks one */
  backdrops: readonly string[]
  darkBackdrops: readonly string[]
}

interface Tables {
  shells: Readonly<Record<string, ShellEntry>>
  silhouettes: Readonly<Record<string, SilhouetteShape>>
  weights: readonly (readonly [string, number])[]
  /** built from a theme: colours are drawn on top of the built-in shape and face */
  themed?: boolean
}

/** A deep tint of the body: its container on a dark page. */
const night = (shell: string) => shade(shell, -0.72)

const DEFAULT_TABLES: Tables = {
  shells: Object.fromEntries(
    Object.entries(SHELLS).map(([name, s]) => [
      name,
      {
        shell: s.shell,
        eye: EYE,
        accents: s.accents.map((a) => ACCENTS[a]),
        backdrops: [s.background],
        darkBackdrops: [night(s.shell)],
      },
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

  const palette = colours(key('colour'), opts, tables, silhouette.grain)

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
    palette,
  }
}

/** The colour draw alone, from its own stream: a theme can swap it and nothing else. */
function colours(c: Rng, opts: Pins, tables: Tables, grain: number): Palette {
  const drawnShell = c.pick(Object.keys(tables.shells))
  const entry = tables.shells[opts.shell ?? drawnShell] as ShellEntry
  const accent = c.pick(entry.accents)
  // a one-accent theme wears its accent; the built-in shells always have a second
  const others = entry.accents.filter((a) => a !== accent)
  const wear = others.length ? c.pick(others) : accent
  const ground = (list: readonly string[]) => list[grain % list.length] as string
  return {
    shell: entry.shell,
    accent,
    eye: entry.eye,
    catchlight: CATCHLIGHT,
    wear,
    background: ground(entry.backdrops),
    backgroundDark: ground(entry.darkBackdrops),
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
  // A theme changes colours only: shape and face are drawn with the built-in
  // colours, exactly as without a theme, and the theme's colours go on top.
  const { shell, ...unpinned } = opts
  const base = tables.themed
    ? { ...DEFAULT_TABLES, silhouettes: tables.silhouettes, weights: tables.weights }
    : tables
  const baseOpts = tables.themed ? unpinned : opts
  let t = draw(normal, 0, baseOpts, base)
  for (let attempt = 1; attempt <= MAX_REROLLS && inProtectedRegion(t); attempt++) {
    t = draw(normal, attempt, baseOpts, base)
  }
  if (tables.themed) {
    t = { ...t, palette: colours(stream(normal, 'colour'), opts, tables, t.silhouette.grain) }
  }
  // The region can only be reached through Nurbi's quiet face unless a palette
  // brings its own near-flagship accent; a wave brow always breaks the quiet face.
  if (inProtectedRegion(t)) t = { ...t, brow: { ...t.brow, shape: 'wave' } }
  return t
}

// built once per theme object, however many avatars use it
const themed = new WeakMap<Theme, Tables>()
function themeTables(theme: Theme, base: NurblingsConfig = {}): Tables {
  let tables = base.silhouettes ? undefined : themed.get(theme)
  if (!tables) {
    tables = buildTables({ silhouettes: base.silhouettes, theme } as NurblingsConfig)
    if (!base.silhouettes) themed.set(theme, tables)
  }
  return tables
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

/**
 * Draws a traits object you built or stored yourself, such as one read back
 * from a database. Every value is checked first, so traits from outside can
 * only fail with a RangeError, never inject markup.
 */
export function renderTraits(t: Traits, opts: RenderOptions = {}, slots?: Slots): string {
  checkTraits(t)
  return render(t, opts, slots && extension({ slots }))
}

/** An SVG string as a data URI, for an img src or a CSS background. */
export function toDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/** A Nurbling ready for an `<img src>` or a CSS `url()`: `nurbling()` as a data URI. */
export function nurblingSrc(seed: string, opts: NurblingOptions = {}): string {
  return toDataUri(nurbling(seed, opts))
}

const LIGHT_GROUND = '#f7f5f2'
const DARK_GROUND = '#16161a'
/** Eyes on a dark body. */
const LIGHT_EYE = '#f7f5f2'

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
 * and every shell needs readable eyes and at least two accents. A theme is
 * repaired instead of refused: its accents are moved until they read, its eyes
 * turn light on dark bodies, and antennae are kept readable at render time.
 */
function buildTables(config: NurblingsConfig): Tables {
  const silhouettes = config.silhouettes ?? SILHOUETTES
  if (Object.keys(silhouettes).length === 0) {
    throw new RangeError('nurblings: silhouettes needs at least one design')
  }
  const weights = config.silhouettes
    ? Object.entries(config.silhouettes).map(([name, s]) => [name, s.weight ?? 1] as const)
    : SILHOUETTE_WEIGHTS
  if (weights.some(([, w]) => !(w >= 0)) || !weights.some(([, w]) => w > 0)) {
    throw new RangeError('nurblings: silhouette weights must be 0 or more, at least one above 0')
  }
  if (config.silhouettes) {
    for (const [name, design] of Object.entries(config.silhouettes)) checkDesign(name, design)
  }
  const theme = config.theme
  if (!config.shells && !config.accents && !theme)
    return { ...DEFAULT_TABLES, silhouettes, weights }

  const all = hexes(config.accents ?? theme?.accents ?? ACCENTS)
  const accents = theme
    ? all
    : all.filter(
        ([, hex]) => contrast(hex, LIGHT_GROUND) >= 2.5 && contrast(hex, DARK_GROUND) >= 2.5,
      )
  const custom = config.shells ?? theme?.shells
  const shells = custom
    ? hexes(custom)
    : Object.entries(SHELLS).map(([name, s]): [string, string] => [name, s.shell])
  const pool = (list: readonly string[] | undefined, shell: string, fallback: string) => {
    const ok = hexes(Object.fromEntries((list ?? []).map((hex, i) => [`backdrop ${i}`, hex])))
      .map(([, hex]) => hex)
      // a container must stand apart from the body, or the creature melts into it
      .filter((hex) => contrast(hex, shell) >= 1.5)
    return ok.length ? ok : [fallback]
  }
  const table: Record<string, ShellEntry> = {}
  for (const [name, given] of shells) {
    let shell = given
    let eye = EYE
    if (contrast(EYE, shell) < 4.5) {
      if (!theme) {
        throw new RangeError(`nurblings: shell ${name} (${shell}) is too dark for the eyes (4.5:1)`)
      }
      // light eyes on a dark body; a mid-tone body moves just far enough for either
      if (contrast(LIGHT_EYE, shell) > contrast(EYE, shell)) eye = LIGHT_EYE
      shell = ensureContrast(shell, eye, 4.5)
    }
    // distinct colours only: two names for one colour cannot be accent and wear at once
    const paired = [
      ...new Set(
        theme
          ? accents.map(([, hex]) => ensureContrast(hex, shell, 3))
          : accents.filter(([, hex]) => contrast(hex, shell) >= 3).map(([, hex]) => hex),
      ),
    ]
    if (paired.length < (theme ? 1 : 2)) {
      throw new RangeError(
        `nurblings: shell ${name} (${shell}) needs two accents that read on it at 3:1, has ${paired.length}`,
      )
    }
    const builtIn = DEFAULT_TABLES.shells[name]
    const light = builtIn && !custom ? (builtIn.backdrops[0] as string) : shade(shell, 0.6)
    table[name] = {
      shell,
      eye,
      accents: paired,
      backdrops: theme?.backdrops ? pool(theme.backdrops, shell, light) : [light],
      darkBackdrops: pool(theme?.darkBackdrops, shell, night(shell)),
    }
  }
  return { shells: table, silhouettes, weights, themed: Boolean(theme) }
}

/**
 * An app-wide configured Nurblings: your palette, your body designs, your drawn
 * parts, your defaults. The same config and seed always give the same avatar.
 * Only the default `nurbling()` draws Nurbi for the reserved seeds.
 */
export function createNurblings<const C extends NurblingsConfig>(input: C) {
  // presets in `use` come first; slots chain, and everything else merges by name
  const config = compose(input)
  const tables = buildTables(config)
  const extend = extension(config)
  const merge = (opts: ConfiguredOptions<C>): Pins => ({ ...config.defaults, ...opts })
  // a theme on one call swaps the colours and keeps this instance's body designs
  const tablesFor = (o: Pins) =>
    o.theme && o.theme !== config.theme ? themeTables(o.theme, config) : tables
  const draw = (seed: string, opts: ConfiguredOptions<C> = {}): string => {
    const o = merge(opts)
    return render(resolve(seed, o, tablesFor(o)), o, extend)
  }
  return {
    traits: (seed: string, opts: ConfiguredOptions<C> = {}): Traits => {
      const o = merge(opts)
      return resolve(seed, o, tablesFor(o))
    },
    nurbling: draw,
    /** the same avatar as a data URI, for an `<img src>` or a CSS `url()` */
    src: (seed: string, opts: ConfiguredOptions<C> = {}): string => toDataUri(draw(seed, opts)),
  }
}

export type Nurblings<C extends NurblingsConfig = NurblingsConfig> = ReturnType<
  typeof createNurblings<C>
>
