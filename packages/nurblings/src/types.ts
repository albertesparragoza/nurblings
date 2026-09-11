// The fully resolved description of one Nurbling.
// The renderer turns a Traits object into SVG; generation tables pick
// Traits from a seed. Nothing here draws the flagship: that is a stored asset.

export type Generation = 1

/** Body outline, in body-width units. The flagship's values are never in a pool. */
export interface Silhouette {
  /** height / width */
  hw: number
  /** height of the widest point, as a fraction of height from the base */
  widest: number
  /** 0 = round dome, 1 = pointed ogive crown */
  crown: number
  /** 0 = rounded base, 1 = broad flat base */
  base: number
}

export interface Antennae {
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
export type Extra = 'none' | 'scarf' | 'pin' | 'hat' | 'collar'
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

export interface RenderOptions {
  /** rendered width and height in pixels; <= 32 switches to small-size mode */
  size?: number
  background?: Background
  /** accessible name; defaults to "Nurbling" */
  title?: string
  /** sway antennae on hover/focus (always off under prefers-reduced-motion) */
  animate?: boolean
}
