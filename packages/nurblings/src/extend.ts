// Extensions for createNurblings. Every drawn part, built in or added by a
// config, is one named layer in paint order, and every extension is a config:
// presets combine with `use` or `compose`, slots chain so a later one wraps
// what an earlier one drew, added parts can be slotted like built-in ones, and
// new eyes, mouths and extras join the lists the seed picks from. Only
// createNurblings and renderTraits pull this in; the plain nurbling() never
// carries it.

import type { NurblingOptions, NurblingsConfig, Theme } from './nurbling'
import { type Rng, stream } from './seed'
import {
  autoCss,
  BASE_Y,
  type BodyGeometry,
  CX,
  type DeepReadonly,
  type Drawn,
  type Extension,
  edgesAt,
  esc,
  n,
  type Scene,
  SLOTS,
  type SlotName,
} from './svg'
import type { Mode, RenderOptions, Traits } from './types'

/** Data for parts, from the config and from each call; the call wins. */
export type Props = Readonly<Record<string, unknown>>

export interface Point {
  readonly x: number
  readonly y: number
}

/** An eye as drawn: centre and radii, with the mood's openness applied. */
export interface EyeAnchor extends Point {
  readonly rx: number
  readonly ry: number
}

/**
 * Named places on this avatar, in drawing units, derived from its seed. Built-in
 * parts are drawn from the same values, so a part placed on them fits every body.
 */
export interface Anchors {
  /** the x of the body's centre line */
  readonly centre: number
  /** the y of the base the body stands on */
  readonly base: number
  /** the apex of the crown */
  readonly crown: Point
  /** left eye, then right */
  readonly eyes: readonly [EyeAnchor, EyeAnchor]
  /** the y of the brow's centre */
  readonly brow: number
  /** the y of the mouth */
  readonly mouth: number
  /** the front of the body, where a pin or badge sits */
  readonly chest: Point
  /** the square the avatar is framed in */
  readonly box: { readonly x: number; readonly y: number; readonly size: number }
  /** the body's edges at a height: 0 is the base, 1 the crown */
  band(f: number): { readonly y: number; readonly left: number; readonly right: number }
}

/**
 * Colour roles, as this avatar is drawn: `shell` the body, `eye`, `accent` the
 * brow, `mark` the antennae (kept readable on the ground), `wear` extras, and
 * `ground` the container. A theme sets them all, so parts drawn with them
 * follow any theme.
 */
export type ColourRole = 'shell' | 'eye' | 'accent' | 'mark' | 'wear' | 'ground'

/** A call's options, after the config's defaults. The title stays with the renderer. */
export type CallOptions = Omit<
  NurblingOptions,
  'silhouette' | 'shell' | 'title' | 'mouth' | 'extra'
> & {
  silhouette?: string
  shell?: string
  mouth?: string
  extra?: string
  theme?: Theme
  props?: Props
}

/** What every slot and part receives. The same object for every part of one avatar. */
export interface SlotContext {
  readonly traits: DeepReadonly<Traits>
  readonly geometry: DeepReadonly<BodyGeometry>
  readonly size: number
  /** true at 32 px and below, where the built-in mouth and extras step aside */
  readonly small: boolean
  /** the page appearance this avatar is drawn for */
  readonly mode: Mode
  readonly anchors: Anchors
  /** each colour role for this avatar and mode; in `auto` mode, the light one */
  readonly colours: Readonly<Record<ColourRole, string>>
  /**
   * A role as an attribute, such as ` fill="#…"`. In `auto` mode `ground` and
   * `mark` also switch with the page, as the built-in parts do; the attribute
   * then carries a class, so do not add a class of your own to that element.
   */
  paint(role: ColourRole, as?: 'fill' | 'stroke'): string
  /** a random stream of its own for each name, fixed per avatar; never shifts built-in draws */
  random(name: string): Rng
  /** the theme this avatar is drawn in, if any */
  readonly theme: Theme | undefined
  readonly options: DeepReadonly<CallOptions>
  /** the config's props, then the call's; escape any text with `esc` */
  readonly props: Props
  /** a number as the renderer writes it: two decimals, no exponent */
  n(value: number): string
  /** text made safe for SVG content and attributes */
  esc(text: string): string
}

/**
 * Changes one part, built in or added: `false` drops it; a function replaces
 * it, or wraps it by calling `base()`.
 *
 * **The string you return is written into the SVG as it is.** It is never
 * escaped, because escaping it would print the markup instead of drawing it.
 * A slot is therefore trusted code, and this boundary is yours:
 *
 * - build markup from your own code, `ctx.anchors` and `ctx.colours`
 * - never build it from user input
 * - put text through `ctx.esc`, and a colour bound for a `style` attribute
 *   through `cssColour`
 * - keep it free of `id` attributes, so several avatars can share a page
 */
export type Slot = false | ((ctx: SlotContext, base: () => string) => string)

/** Slots by part name: the built-in parts, and any part a config adds. */
export type Slots = Partial<Record<SlotName, Slot>> & Readonly<Record<string, Slot | undefined>>

/** A new part, drawn in paint order among the built-in ones. */
export interface Part {
  /** paint right after this part, built in or added; defaults to `mouth`, on top */
  after?: string
  /** draw at 32 px and below too; off by default, like the built-in mouth and extras */
  small?: boolean
  /** returns raw markup, written into the SVG as it is: see the note on `Slot` */
  draw(ctx: SlotContext): string
}

/**
 * One choice in a list the seed picks from: an eye shape, a mouth or an extra.
 * A new name needs `draw`; a built-in one can take a new `weight`, a new look
 * through `draw`, or both. New mouths and extras step aside at 32 px, as the
 * built-in ones do.
 */
export interface Variant {
  /** how often the seed picks it, relative to the rest of the list; defaults to 1 */
  weight?: number
  /** returns raw markup, written into the SVG as it is: see the note on `Slot` */
  draw?: (ctx: SlotContext) => string
}

/** Choices merged over a built-in list: new names are added, `false` drops one. */
export type Variants = Readonly<Record<string, Variant | false>>

/** A later slot wraps an earlier one: its `base()` is what the earlier one drew. */
const chain = (prev: Slot | undefined, next: Slot): Slot =>
  next === false || prev === undefined
    ? next
    : (ctx, base) => next(ctx, () => (prev === false ? '' : prev(ctx, base)))

/**
 * Configs combined into one, in order. Slots chain, each later one wrapping
 * the earlier; parts, body designs, eyes, mouths, extras, colours and props
 * merge by name, later names winning (a later `false` drops, a later choice
 * brings back); the theme is the last one given; defaults merge. A config's
 * own `use` presets come before it.
 */
export function compose(...configs: readonly NurblingsConfig[]): NurblingsConfig {
  const flat: NurblingsConfig[] = []
  const expand = (c: NurblingsConfig) => {
    for (const preset of c.use ?? []) expand(preset)
    flat.push(c)
  }
  for (const c of configs) expand(c)
  const out: { -readonly [K in keyof NurblingsConfig]: NurblingsConfig[K] } = {}
  const slots: Record<string, Slot> = {}
  for (const c of flat) {
    if (c.theme) out.theme = c.theme
    if (c.shells) out.shells = { ...out.shells, ...c.shells }
    if (c.accents) out.accents = { ...out.accents, ...c.accents }
    if (c.silhouettes) out.silhouettes = { ...out.silhouettes, ...c.silhouettes }
    if (c.eyes) out.eyes = { ...out.eyes, ...c.eyes }
    if (c.mouths) out.mouths = { ...out.mouths, ...c.mouths }
    if (c.extras) out.extras = { ...out.extras, ...c.extras }
    if (c.parts) out.parts = { ...out.parts, ...c.parts }
    if (c.props) out.props = { ...out.props, ...c.props }
    if (c.defaults) out.defaults = { ...out.defaults, ...c.defaults }
    for (const [name, slot] of Object.entries(c.slots ?? {})) {
      if (slot !== undefined) slots[name] = chain(slots[name], slot)
    }
  }
  if (Object.keys(slots).length) out.slots = slots
  return out
}

/** Every part name in paint order: the built-in ones, with added parts placed after theirs. */
function paintOrder(parts: Readonly<Record<string, Part>>): string[] {
  const order: string[] = [...SLOTS]
  // parts after the same one keep the order they were given in
  const last = new Map<string, string>()
  let pending = Object.entries(parts)
  for (const [name] of pending) {
    if (order.includes(name)) {
      throw new RangeError(`nurblings: ${name} is a built-in part; change it with slots`)
    }
  }
  while (pending.length) {
    const left = pending.filter(([name, part]) => {
      const after = part.after ?? 'mouth'
      const at = order.indexOf(last.get(after) ?? after)
      if (at < 0) return true
      order.splice(at + 1, 0, name)
      last.set(after, name)
      return false
    })
    if (left.length === pending.length) {
      const [name, part] = left[0] as [string, Part]
      throw new RangeError(
        `nurblings: part ${name} paints after ${String(part.after)}, which is not a part`,
      )
    }
    pending = left
  }
  return order
}

// auto-mode rules the built-in parts never need, emitted only when a part does
const EXTRA_RULES: Record<string, string> = {
  'nb-gs': '.nb-auto .nb-gs{stroke:var(--nb-g)}',
  'nb-cf': '.nb-auto .nb-cf{fill:var(--nb-c)}',
}

function context(s: Scene, config: NurblingsConfig, used: Set<string>): SlotContext {
  const { traits: t, geometry: g, face, box, mode } = s
  const p = t.palette
  const dark = mode === 'dark'
  const colours: Record<ColourRole, string> = {
    shell: p.shell,
    eye: p.eye,
    accent: p.accent,
    mark: s.mark(dark),
    wear: p.wear,
    ground: dark ? p.backgroundDark : p.background,
  }
  // the title and transition key are the caller's text: parts never see them
  const { title: _title, transition: _key, ...options } = s.opts as CallOptions & RenderOptions
  const [x, y] = (g.outline[g.apex] as BodyGeometry['outline'][number]).p
  return {
    traits: t,
    geometry: g,
    size: s.size,
    small: s.small,
    mode,
    anchors: {
      centre: CX,
      base: BASE_Y,
      crown: { x, y },
      eyes: face.eyes,
      brow: face.brow,
      mouth: face.mouth,
      // below every mouth, which sits 0.26 to 0.33 of the height above the base
      chest: { x: CX, y: BASE_Y - 0.2 * g.height },
      box: { x: box.x, y: box.y, size: box.s },
      band(f) {
        const at = BASE_Y - f * g.height
        const [left, right] = edgesAt(g, at)
        return { y: at, left, right }
      },
    },
    colours,
    paint(role, as = 'fill') {
      const attr = ` ${as}="${colours[role]}"`
      if (mode !== 'auto' || (role !== 'ground' && role !== 'mark')) return attr
      const cls =
        role === 'ground' ? (as === 'fill' ? 'nb-g' : 'nb-gs') : as === 'fill' ? 'nb-cf' : 'nb-c'
      if (EXTRA_RULES[cls]) used.add(cls)
      return ` class="${cls}"${attr}`
    },
    random: (name) => stream(String(t.silhouette.grain), `part:${name}`),
    theme: options.theme ?? config.theme,
    options,
    props: { ...config.props, ...options.props },
    n,
    esc,
  }
}

/** The choice a trait resolved to, when the config gives it a look of its own. */
function lookOf(name: string, t: Traits, config: NurblingsConfig): Variant['draw'] {
  const choice =
    name === 'eyes'
      ? config.eyes?.[t.eyes.shape]
      : name === 'mouth'
        ? config.mouths?.[t.mouth]
        : name === 'extra'
          ? config.extras?.[t.extra]
          : undefined
  return choice ? choice.draw : undefined
}

const drawsAny = (list: Variants | undefined) =>
  Object.values(list ?? {}).some((choice) => choice !== false && choice.draw !== undefined)

/**
 * The extension for a composed config: its slots, parts and choice looks,
 * drawn in paint order with one shared context. Nothing when the config draws
 * nothing of its own, so such an instance draws exactly what `nurbling()` does.
 * Unknown slot names and part positions throw here, at setup.
 */
export function extension(config: NurblingsConfig): Extension | undefined {
  const slots: Slots = config.slots ?? {}
  const parts = config.parts ?? {}
  const looks = drawsAny(config.eyes) || drawsAny(config.mouths) || drawsAny(config.extras)
  if (!Object.keys(slots).length && !Object.keys(parts).length && !looks) return
  const order = paintOrder(parts)
  for (const name of Object.keys(slots)) {
    if (!order.includes(name)) throw new RangeError(`nurblings: no part named ${name} to slot into`)
  }
  const front = order.indexOf('antennae')
  return (scene): Drawn => {
    const used = new Set<string>()
    const ctx = context(scene, config, used)
    const draw = (name: string) => {
      const part = parts[name]
      if (part) return scene.small && !part.small ? '' : part.draw(ctx)
      const look = lookOf(name, scene.traits, config)
      // eyes always show; a mouth or extra of your own steps aside when small, like the built-in ones
      if (look) return scene.small && name !== 'eyes' ? '' : look(ctx)
      return scene.built[name as SlotName]()
    }
    const layers = order.map((name) => {
      const slot = slots[name]
      const svg = slot === false ? '' : slot ? slot(ctx, () => draw(name)) : draw(name)
      return [name, svg] as const
    })
    return {
      // the backdrop, and parts painted after it, stay still behind the figure
      back: layers
        .slice(0, front)
        .map(([, svg]) => svg)
        .join(''),
      figure: layers.slice(front),
      style:
        scene.mode === 'auto' && used.size
          ? autoCss([...used].map((cls) => EXTRA_RULES[cls]).join(''))
          : undefined,
    }
  }
}
