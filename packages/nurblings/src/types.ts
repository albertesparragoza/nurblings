// The fully resolved description of one Nurbling.
// The renderer turns a Traits object into SVG; generation tables pick
// Traits from a seed. Nothing here draws the flagship: that is a stored asset.

export type Generation = 1

/**
 * Body outline: a mild variation of Nurbi's own measured profile, smooth on the
 * lower body and plated on the upper head. The flagship's exact values are never
 * in a pool.
 */
export interface Silhouette {
  /** height / width (Nurbi: 1.024) */
  hw: number
  /** body width as a share of the standard width; below 1 is thinner, above 1 wider */
  width?: number
  /** height of the widest point, as a fraction of height from the base (Nurbi: 0.313) */
  belly: number
  /** crown fullness near the apex: below 1 a firmer point, above 1 fuller; never pinched */
  tip: number
  /** bands of flat plates on the upper head, each ending in a visible outline corner */
  rows: number
  /** plates across the head in each band */
  cols: number
  /** any whole number; varies the plate tones so no two heads are tiled alike */
  grain: number
  /** where the flat plates sit; the rest of the body stays smooth. Defaults to `crown`. */
  plates?: PlateZone
}

/**
 * Where a Nurbling's low-poly plates sit: on the crown (like Nurbi), around the
 * base with a smooth head, down one flank, or nowhere (fully smooth).
 */
export type PlateZone = 'crown' | 'base' | 'side' | 'none'

export interface Antennae {
  /** how many handles the crown carries; two is the classic Nurbling, one stands on the centre line */
  count?: 0 | 1 | 2
  /** lean from vertical in degrees, left stem then right stem (both positive = splayed) */
  lean: readonly [number, number]
  /** stem length in body widths, left then right; never equal */
  length: readonly [number, number]
  /** stem bow, -1..1; 0 is perfectly straight */
  bend: number
  /** square tip side, in body widths */
  tip: number
}

export type EyeShape = 'round' | 'tall' | 'wide' | 'almond'
export type Catchlight = 'none' | 'dot' | 'pair' | 'asymmetric'

export interface Eyes {
  shape: EyeShape
  /** eye width in body widths */
  size: number
  /** centre-to-centre distance in body widths (fixed face zone: 0.34..0.44) */
  spacing: number
  /** eye centre depth from the crown, fraction of height (fixed band: 0.50..0.57) */
  depth: number
  catchlight: Catchlight
}

export type BrowShape = 'level' | 'wave' | 'split' | 'bold'

export interface Brow {
  shape: BrowShape
  /** degrees, clamped to +-6 */
  tilt: number
}

export type Mouth = 'none' | 'dot' | 'line' | 'smile'
export type Extra = 'none' | 'scarf' | 'badge' | 'hat' | 'collar'
export type Mood = 'neutral' | 'curious' | 'pleased' | 'thinking' | 'sleepy'

export interface Palette {
  shell: string
  accent: string
  eye: string
  catchlight: string
  /** extra fabric colour (scarf, hat, collar) */
  wear: string
  background: string
}

export interface Traits {
  gen: Generation
  silhouette: Silhouette
  antennae: Antennae
  eyes: Eyes
  brow: Brow
  mouth: Mouth
  extra: Extra
  mood: Mood
  palette: Palette
}

export type Background = 'none' | 'circle' | 'squircle' | 'square'

/**
 * How the creature sits in its square. `full` fits the whole figure, antenna
 * tips included. `portrait` crops closer on the face and body for avatar
 * containers, letting antenna tips run off the edge. `auto` picks portrait at
 * 48 px and below, where a bigger face reads better, and full above.
 */
export type Frame = 'auto' | 'full' | 'portrait'

/**
 * Anything that turns a seed into an SVG string: the default package, or an
 * instance from `createNurblings`. Framework components accept one to render
 * with an app-wide configuration. `silhouette` and `shell` are plain strings
 * here so an instance with its own names fits; the instance itself still types
 * them.
 */
export interface NurblingRenderer {
  nurbling(
    seed: string,
    opts?: Omit<import('./nurbling').NurblingOptions, 'silhouette' | 'shell'> & {
      silhouette?: string
      shell?: string
    },
  ): string
}

/** Motion layers, each on unless set to `false`. CSS only: no script, no ids. */
export interface Motion {
  /** the body slowly squashes and stretches from its base */
  breath?: boolean
  /** the eyes blink now and then */
  blink?: boolean
  /** the antennae drift, each on its own clock */
  antennae?: boolean
  /** the antennae wiggle faster while the pointer is over the avatar */
  hover?: boolean
  /** timing multiplier, a positive number; 2 is twice as fast. Defaults to 1. */
  speed?: number
}

export interface RenderOptions {
  /** rendered width and height in pixels; <= 32 switches to small-size mode */
  size?: number
  background?: Background
  /** accessible name; defaults to "Nurbling" */
  title?: string
  /**
   * Ambient life, on by default: `false` for a still drawing, or pick layers.
   * Never moves under prefers-reduced-motion, nor at 32 px and below.
   */
  animate?: boolean | Motion
  /** framing inside the square; defaults to `auto` */
  frame?: Frame
  /**
   * A key for `morph` from `nurblings/transition`: when the same key appears
   * in two places, the avatar moves between them instead of jumping.
   */
  transition?: string
}
