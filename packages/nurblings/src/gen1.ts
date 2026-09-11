// Generation 1: the frozen trait tables. A seed renders identically forever
// within a generation, so nothing in this file is ever edited once released.
// New traits ship as generation 2, in a file of their own.

import type { Brow, Catchlight, Extra, EyeShape, Mood, Mouth, Silhouette } from './types'

/** Approved at the trait-sheet gate: soft curved bodies under faceted, soft-point crowns. */
export const SILHOUETTES = {
  pebble: { hw: 0.94, widest: 0.42, crown: 0.6, base: 0.45, facets: 3 },
  drop: { hw: 1.14, widest: 0.3, crown: 0.9, base: 0.55, facets: 4 },
  bean: { hw: 0.86, widest: 0.42, crown: 0.6, base: 0.9, facets: 2 },
  bell: { hw: 0.98, widest: 0.2, crown: 0.6, base: 1, facets: 3 },
  acorn: { hw: 1.08, widest: 0.44, crown: 0.75, base: 0.6, facets: 4 },
  loaf: { hw: 0.82, widest: 0.46, crown: 0.55, base: 1, facets: 3 },
} as const satisfies Record<string, Silhouette>

export type SilhouetteName = keyof typeof SILHOUETTES

/** Mid-luminance accents: every one clears 2.5:1 on both the dark and the light ground. */
export const ACCENTS = {
  tomato: '#d9502a',
  teal: '#16857d',
  violet: '#7a52c7',
  cobalt: '#2f6fd6',
  amber: '#b7700a',
  green: '#2e8b4f',
  rust: '#b5532f',
  ocean: '#1f7fa8',
  olive: '#6f7f1f',
} as const

export type AccentName = keyof typeof ACCENTS

interface ShellEntry {
  shell: string
  background: string
  /** accents that clear 3:1 on this shell, where the brow sits */
  accents: readonly AccentName[]
}

/** Light pastel shells. None sits near the flagship's ivory. */
export const SHELLS = {
  mint: {
    shell: '#a8e0d1',
    background: '#eef6f3',
    accents: ['teal', 'violet', 'cobalt', 'rust', 'ocean', 'olive'],
  },
  sky: {
    shell: '#b8d8f7',
    background: '#eef4fb',
    accents: ['teal', 'violet', 'cobalt', 'rust', 'ocean', 'olive'],
  },
  butter: {
    shell: '#f6dd99',
    background: '#fbf6e6',
    accents: ['tomato', 'teal', 'violet', 'cobalt', 'green', 'rust', 'ocean', 'olive'],
  },
  peach: { shell: '#f9c3ae', background: '#fcf1ec', accents: ['violet', 'cobalt', 'rust'] },
  lilac: { shell: '#d6c8f4', background: '#f4f0fb', accents: ['violet', 'cobalt', 'rust'] },
  sage: { shell: '#c8d8b0', background: '#f2f5ec', accents: ['violet', 'cobalt', 'rust'] },
  cloud: {
    shell: '#dfe3ea',
    background: '#f1f3f6',
    accents: ['tomato', 'teal', 'violet', 'cobalt', 'amber', 'green', 'rust', 'ocean', 'olive'],
  },
  blush: {
    shell: '#f3cfc6',
    background: '#fcf1ee',
    accents: ['teal', 'violet', 'cobalt', 'rust', 'ocean', 'olive'],
  },
  lemon: {
    shell: '#f2ec9d',
    background: '#fbf9e4',
    accents: ['tomato', 'teal', 'violet', 'cobalt', 'amber', 'green', 'rust', 'ocean', 'olive'],
  },
} as const satisfies Record<string, ShellEntry>

export type ShellName = keyof typeof SHELLS

export const EYE = '#141414'
/** Grey, never white: a white catchlight reads as a reflection filling the eye. */
export const CATCHLIGHT = '#9a9a9a'

export const RANGES = {
  lean: [14, 36],
  length: [0.24, 0.52],
  /** the two stems always differ by at least this much, so they are never equal */
  lengthGap: 0.06,
  tip: [0.07, 0.1],
  eyeSize: [0.1, 0.13],
  eyeSpacing: [0.35, 0.44],
  eyeDepth: [0.5, 0.57],
  browTilt: 6,
} as const

export const BENDS: readonly (readonly [number, number])[] = [
  [0, 4],
  [0.15, 1],
  [-0.15, 1],
  [0.3, 1],
  [-0.3, 1],
]

export const EYE_SHAPES: readonly EyeShape[] = ['round', 'tall', 'wide', 'almond']
export const CATCHLIGHTS: readonly (readonly [Catchlight, number])[] = [
  ['asymmetric', 3],
  ['dot', 3],
  ['pair', 2],
  ['none', 1],
]
export const BROWS: readonly Brow['shape'][] = ['level', 'wave', 'split', 'bold']
export const MOUTHS: readonly (readonly [Mouth, number])[] = [
  ['none', 3],
  ['dot', 2],
  ['line', 2],
  ['smile', 2],
]
export const EXTRAS: readonly (readonly [Extra, number])[] = [
  ['none', 5],
  ['scarf', 1],
  ['pin', 1],
  ['hat', 1],
  ['collar', 1],
]
/** The calm set: moods safe to show unprompted. */
export const MOODS: readonly (readonly [Mood, number])[] = [
  ['neutral', 3],
  ['curious', 2],
  ['pleased', 2],
  ['thinking', 1],
  ['sleepy', 1],
]
