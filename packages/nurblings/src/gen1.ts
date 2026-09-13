// Generation 1: the frozen trait tables. A seed renders identically forever
// within a generation, so nothing in this file is ever edited once released.
// New traits ship as generation 2, in a file of their own.

import type { Brow, Catchlight, Extra, EyeShape, Mood, Mouth, Silhouette } from './types'

/**
 * The locked family designs: exaggerated variations of Nurbi's own outline,
 * each with its plates in one place. A seed picks one, adds a small variation
 * of its own (`SHAPE_JITTER`), and always gets its own plate pattern (`grain`).
 */
export const SILHOUETTES = {
  classic: { hw: 1.02, width: 1, belly: 0.31, tip: 1, rows: 3, cols: 4, plates: 'crown' },
  basketball: { hw: 1.6, width: 0.7, belly: 0.3, tip: 0.95, rows: 4, cols: 3, plates: 'crown' },
  squat: { hw: 0.78, width: 1.2, belly: 0.36, tip: 1.1, rows: 3, cols: 5, plates: 'crown' },
  firm: { hw: 1.2, width: 0.85, belly: 0.28, tip: 0.8, rows: 4, cols: 4, plates: 'crown' },
  round: { hw: 0.9, width: 1.08, belly: 0.38, tip: 1.2, rows: 3, cols: 5, plates: 'crown' },
  bell: { hw: 1.32, width: 0.9, belly: 0.44, tip: 1.2, rows: 4, cols: 2, plates: 'side' },
  wide: { hw: 0.9, width: 1.12, belly: 0.3, tip: 1, rows: 4, cols: 2, plates: 'side' },
  smooth: { hw: 1.12, width: 0.92, belly: 0.33, tip: 0.9, rows: 3, cols: 4, plates: 'none' },
  pear: { hw: 1.08, width: 1.04, belly: 0.2, tip: 1.15, rows: 2, cols: 5, plates: 'base' },
  tall: { hw: 1.42, width: 0.8, belly: 0.3, tip: 1, rows: 2, cols: 4, plates: 'base' },
} as const satisfies Record<string, Omit<Silhouette, 'grain'>>

export type SilhouetteName = keyof typeof SILHOUETTES

/**
 * How often each silhouette is drawn: crown plates for half the family, side
 * plates and smooth bodies a fifth each, base plates a tenth.
 */
export const SILHOUETTE_WEIGHTS: readonly (readonly [SilhouetteName, number])[] = [
  ['classic', 2],
  ['basketball', 2],
  ['squat', 2],
  ['firm', 2],
  ['round', 2],
  ['bell', 2],
  ['wide', 2],
  ['smooth', 4],
  ['pear', 1],
  ['tall', 1],
]

/** How far a seed may move its silhouette away from the preset, in each direction. */
export const SHAPE_JITTER = { hw: 0.04, width: 0.03, belly: 0.02, tip: 0.03 } as const

/** Two antennae for most seeds, one on the centre line for about 1 in 8. */
export const ANTENNA_COUNTS: readonly (readonly [1 | 2, number])[] = [
  [2, 7],
  [1, 1],
]

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
  ['badge', 1],
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
