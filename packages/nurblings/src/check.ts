// Traits handed to renderTraits() can come from anywhere: a database, a form,
// a JSON file. Every value is checked before it reaches the SVG, so a crafted
// object can only fail loudly, never inject markup or break out of an attribute.

import { BROWS, CATCHLIGHTS, EXTRAS, EYE_SHAPES, MOODS, MOUTHS } from './gen1'
import type { Traits } from './types'

const HEX = /^#[0-9a-fA-F]{6}$/
const ZONES: readonly string[] = ['crown', 'base', 'side', 'none']
/** Most plate rows or columns a body may have. The built-in designs use at most 5; a grid far past this only costs time. */
export const MAX_GRID = 12

const names = (list: readonly (string | readonly [string, number])[]) =>
  new Set(list.map((x) => (typeof x === 'string' ? x : x[0])))
const ALLOWED = {
  shape: names(EYE_SHAPES),
  catchlight: names(CATCHLIGHTS),
  brow: names(BROWS),
  mouth: names(MOUTHS),
  extra: names(EXTRAS),
  mood: names(MOODS),
}

function fail(field: string, value: unknown): never {
  throw new RangeError(`nurblings: traits.${field} is not valid: ${String(value).slice(0, 40)}`)
}

function num(field: string, value: unknown): void {
  if (typeof value !== 'number' || !Number.isFinite(value)) fail(field, value)
}

function choice(field: string, value: unknown, allowed: Set<string>): void {
  if (typeof value !== 'string' || !allowed.has(value)) fail(field, value)
}

/** Throws a RangeError naming the first value that could not have come from traits(). */
export function checkTraits(t: Traits): void {
  if (!t || typeof t !== 'object') fail('', t)
  if (t.gen !== 1) fail('gen', t.gen)

  const s = t.silhouette
  if (!s || typeof s !== 'object') fail('silhouette', s)
  for (const key of ['hw', 'belly', 'tip', 'rows', 'cols', 'grain'] as const)
    num(`silhouette.${key}`, s[key])
  if (s.width !== undefined) num('silhouette.width', s.width)
  for (const key of ['rows', 'cols'] as const) {
    const value = s[key]
    if (!Number.isInteger(value) || value < 1 || value > MAX_GRID) fail(`silhouette.${key}`, value)
  }
  if (s.plates !== undefined && !ZONES.includes(s.plates)) fail('silhouette.plates', s.plates)

  const a = t.antennae
  if (!a || typeof a !== 'object') fail('antennae', a)
  if (a.count !== undefined && a.count !== 0 && a.count !== 1 && a.count !== 2)
    fail('antennae.count', a.count)
  num('antennae.bend', a.bend)
  num('antennae.tip', a.tip)
  for (const key of ['lean', 'length'] as const) {
    const pair = a[key]
    if (!Array.isArray(pair) || pair.length !== 2) fail(`antennae.${key}`, pair)
    for (const [i, value] of pair.entries()) num(`antennae.${key}[${i}]`, value)
  }

  const e = t.eyes
  if (!e || typeof e !== 'object') fail('eyes', e)
  choice('eyes.shape', e.shape, ALLOWED.shape)
  choice('eyes.catchlight', e.catchlight, ALLOWED.catchlight)
  for (const key of ['size', 'spacing', 'depth'] as const) num(`eyes.${key}`, e[key])

  if (!t.brow || typeof t.brow !== 'object') fail('brow', t.brow)
  choice('brow.shape', t.brow.shape, ALLOWED.brow)
  num('brow.tilt', t.brow.tilt)

  choice('mouth', t.mouth, ALLOWED.mouth)
  choice('extra', t.extra, ALLOWED.extra)
  choice('mood', t.mood, ALLOWED.mood)

  const p = t.palette
  if (!p || typeof p !== 'object') fail('palette', p)
  for (const key of [
    'shell',
    'accent',
    'eye',
    'catchlight',
    'wear',
    'background',
    'backgroundDark',
  ] as const) {
    const value = p[key]
    if (typeof value !== 'string' || !HEX.test(value)) fail(`palette.${key}`, value)
  }
}

/**
 * A custom body design from createNurblings({ silhouettes }): finite numbers,
 * a positive height and width, a known plate zone and a plate grid of at most
 * MAX_GRID by MAX_GRID. Checked once, when the instance is created.
 */
export function checkDesign(name: string, design: unknown): void {
  const bad = (field: string, value: unknown): never => {
    throw new RangeError(
      `nurblings: silhouettes.${name}.${field} is not valid: ${String(value).slice(0, 40)}`,
    )
  }
  if (!design || typeof design !== 'object') bad('', design)
  const d = design as Record<string, unknown>
  for (const key of ['hw', 'belly', 'tip'] as const) {
    if (typeof d[key] !== 'number' || !Number.isFinite(d[key])) bad(key, d[key])
  }
  if (d.width !== undefined && (typeof d.width !== 'number' || !Number.isFinite(d.width)))
    bad('width', d.width)
  if ((d.hw as number) <= 0) bad('hw', d.hw)
  if (d.width !== undefined && (d.width as number) <= 0) bad('width', d.width)
  for (const key of ['rows', 'cols'] as const) {
    const value = d[key]
    if (!Number.isInteger(value) || (value as number) < 1 || (value as number) > MAX_GRID)
      bad(key, value)
  }
  if (d.plates !== undefined && !ZONES.includes(d.plates as string)) bad('plates', d.plates)
}
