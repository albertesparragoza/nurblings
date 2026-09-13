// nurblings/themes: named colour sets for the whole family, `palette()` for
// your own, and the colour helpers behind them. A separate entry, so the core
// `nurbling()` carries none of it.

import { contrast, ensureContrast, shade } from './colour'
import type { NurblingOptions, NurblingRenderer } from './index'
import { createNurblings, type Hex, nurbling, type Theme } from './nurbling'

export type { Hex, Theme }
export { contrast, ensureContrast, shade }

const named = (prefix: string, list: readonly Hex[]) =>
  Object.fromEntries(list.map((hex, i) => [`${prefix}${i + 1}`, hex])) as Record<string, Hex>

// Soft themes: pastel bodies and a pop of strong colour behind them.
export const lagoon: Theme = {
  name: 'lagoon',
  shells: { cream: '#edecb3', sun: '#fad928', tang: '#ffd392', aqua: '#a2e6e1' },
  accents: { deep: '#00686c', ember: '#d1495b', ink: '#1f4e79' },
  backdrops: ['#00686c', '#32c2b9', '#edecb3', '#fad928', '#ff9915'],
}
export const punch: Theme = {
  name: 'punch',
  shells: { foam: '#f1faee', ice: '#a8dadc', blush: '#ffd6da', sand: '#f4e3b1' },
  accents: { red: '#e63946', steel: '#457b9d', sea: '#2f5d8a' },
  backdrops: ['#1d3557', '#457b9d', '#a8dadc', '#f1faee', '#e63946'],
}
export const candy: Theme = {
  name: 'candy',
  shells: { butter: '#ffd166', sky: '#9be3f7', bubble: '#ffb3da', lilac: '#d9c2ff' },
  accents: { plum: '#b5179e', blue: '#3f51d8', rose: '#d6246e' },
  backdrops: ['#3a0ca3', '#7209b7', '#f72585', '#4cc9f0', '#ffd166'],
}
export const picnic: Theme = {
  name: 'picnic',
  shells: { mustard: '#e9c46a', apricot: '#f7bb8c', oat: '#f6e7cb', sage: '#bfd8c2' },
  accents: { rust: '#c44536', pine: '#1f7a6d', slate: '#3d5a80' },
  backdrops: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
}
export const sorbet: Theme = {
  name: 'sorbet',
  shells: { lemon: '#ffe57a', mint: '#b1e9b8', peachy: '#ffcec5', cloud: '#eef3ff' },
  accents: { coral: '#e05252', blue: '#2f6fd6', green: '#2e8b57' },
  backdrops: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#f7f7f7'],
}
export const terracotta: Theme = {
  name: 'terracotta',
  shells: { bone: '#f4f1de', clay: '#f6d0c2', moss: '#cbdfd4', honey: '#f4d6a4' },
  accents: { terra: '#c8553d', indigo: '#4a5080', sage: '#4f7f67' },
  backdrops: ['#3d405b', '#e07a5f', '#81b29a', '#f2cc8f', '#f4f1de'],
}

// Vivid themes: saturated bodies, one ink for every mark.
export const marble: Theme = {
  name: 'marble',
  shells: named('b', ['#ffb238', '#ff7d10', '#ff5c8a', '#ffd37a']),
  accents: { ink: '#1b0630' },
  backdrops: ['#0a0310', '#49007e', '#ff005b', '#ff7d10', '#ffb238'],
  darkBackdrops: ['#0a0310', '#49007e'],
}
export const riso: Theme = {
  name: 'riso',
  shells: named('b', ['#ffe800', '#ff7ac6', '#3dbe7a', '#4da3df', '#ffb0d9']),
  accents: { ink: '#1a1a2e' },
  backdrops: ['#0078bf', '#ff48b0', '#ffe800', '#00a95c', '#f8f2e8'],
}
export const lime: Theme = {
  name: 'lime',
  shells: named('b', ['#c6f432', '#ff8cc3', '#a895ff', '#f5f5f5']),
  accents: { ink: '#1b1b1b' },
  backdrops: ['#1b1b1b', '#c6f432', '#7b61ff', '#ff5da2', '#f5f5f5'],
  darkBackdrops: ['#1b1b1b'],
}
export const bauhaus: Theme = {
  name: 'bauhaus',
  shells: named('b', ['#f2c14e', '#f78154', '#e07ba0', '#7fb89d']),
  accents: { ink: '#1e1e24' },
  backdrops: ['#1e1e24', '#b4436c', '#f2c14e', '#f78154', '#4d9078'],
  darkBackdrops: ['#1e1e24'],
}

/** Every built-in theme, by name. Importing this pulls them all in; import one by name to keep only it. */
export const THEMES = {
  lagoon,
  punch,
  candy,
  picnic,
  sorbet,
  terracotta,
  marble,
  riso,
  lime,
  bauhaus,
}

export type ThemeName = keyof typeof THEMES

/** A theme from its name, or the theme itself. Unknown names throw. */
export function themeOf(theme: ThemeName | Theme): Theme
export function themeOf(theme: ThemeName | Theme | undefined): Theme | undefined
export function themeOf(theme: ThemeName | Theme | undefined): Theme | undefined {
  if (typeof theme !== 'string') return theme
  const found = (THEMES as Record<string, Theme>)[theme]
  if (!found) throw new RangeError(`nurblings: unknown theme ${theme}`)
  return found
}

const lightness = (hex: string) => contrast(hex, '#000000')

/**
 * A theme from 2 to 5 colours, in any order. The lightest become bodies, the
 * darkest the brows and antennae, and the rest the containers:
 *
 * | colours | bodies | marks | containers |
 * | 2 | 1 | 1 | a tint of the body |
 * | 3 | 1 | 1 | 1 |
 * | 4 | 2 | 1 | 1 |
 * | 5 | 2 | 2 | 1 |
 *
 * Two colours make a two-tone family. Marks are moved until they read on every body.
 */
export function palette(colours: readonly string[], name = 'custom'): Theme {
  if (colours.length < 2 || colours.length > 5) {
    throw new RangeError(`nurblings: palette takes 2 to 5 colours, got ${colours.length}`)
  }
  const list = colours.map((c) => {
    const hex = c.toLowerCase()
    if (!/^#[0-9a-f]{6}$/.test(hex)) {
      throw new RangeError(`nurblings: palette colours must be 6-digit hex, got ${c}`)
    }
    return hex as Hex
  })
  const sorted = [...list].sort((a, b) => lightness(b) - lightness(a))
  const count = sorted.length
  const bodies = sorted.slice(0, count >= 4 ? 2 : 1)
  const marks = sorted.slice(count - (count === 5 ? 2 : 1))
  const middle = sorted.slice(bodies.length, count - marks.length)
  return {
    name,
    shells: named('s', bodies),
    accents: named('a', marks),
    backdrops: [...middle, ...bodies.map((b) => shade(b, 0.6) as Hex)],
    darkBackdrops: [...marks, ...middle].map((c) => shade(c, -0.55) as Hex),
  }
}

/** One item of a list, chosen by a whole number such as `ctx.traits.silhouette.grain`: deterministic. */
export const pickBy = <T>(list: readonly T[], n: number): T => list[Math.abs(n) % list.length] as T

/** Every use of one colour in a slot's markup, swapped for another. */
export const recolour = (markup: string, from: string, to: string) =>
  markup.replace(new RegExp(from, 'gi'), to)

/** The first fill in a slot's markup, such as the container's, set to `fill`. */
export const setFill = (markup: string, fill: string) =>
  markup.replace(/fill="#[0-9a-fA-F]{6}"/, `fill="${fill}"`)

/** A colour that reads on `ground` at `min`:1: the first candidate that does, or one moved until it does. */
export function readableOn(ground: string, candidates: readonly string[], min = 4.5): string {
  const hit = candidates.find((c) => contrast(c, ground) >= min)
  return hit ?? ensureContrast(candidates[0] ?? '#141414', ground, min)
}

// one instance per theme object, however many avatars use it
const instances = new WeakMap<Theme, NurblingRenderer>()

/** The whole family in one theme, ready to render: `themed('lagoon').nurbling(seed)`. */
export function themed(theme: ThemeName | Theme): NurblingRenderer {
  const t = themeOf(theme)
  const cached = instances.get(t)
  if (cached) return cached
  const instance = createNurblings({ theme: t })
  instances.set(t, instance)
  return instance
}

/**
 * What the framework components call: `seed` rendered by an app-wide instance
 * when there is one, in a theme when one is named, or by the default family.
 */
export function renderNurbling(
  renderer: NurblingRenderer | undefined,
  seed: string,
  opts: NurblingOptions,
  theme?: ThemeName | Theme,
): string {
  if (!theme) return (renderer ?? { nurbling }).nurbling(seed, opts)
  return renderer
    ? renderer.nurbling(seed, { ...opts, theme: themeOf(theme) })
    : themed(theme).nurbling(seed, opts)
}
