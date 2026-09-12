// Theme presets for the site: a working preview of the built-in themes planned
// for the library. Pastel themes are plain createNurblings configs and pass
// today's contrast rules; bold themes recolour the default family through
// slots until a real bold mode ships.
import {
  createNurblings,
  type NurblingRenderer,
  nurbling,
  SHELLS,
  type SlotContext,
} from 'nurblings'

export type RenderOptions = NonNullable<Parameters<NurblingRenderer['nurbling']>[1]>
export type ThemeKind = 'default' | 'pastel' | 'bold'

export interface Theme {
  id: string
  label: string
  kind: ThemeKind
  /** UI accent while the theme is active */
  accent: string
  colors: readonly string[]
  /** the palette to hand to createNurblings (pastel themes) */
  shells?: Record<string, string>
  accents?: Record<string, string>
  render(seed: string, opts?: RenderOptions): string
}

type Pastel = Omit<Theme, 'id' | 'kind' | 'render'> & {
  shells: Record<string, string>
  accents: Record<string, string>
}
type Bold = Omit<Theme, 'id' | 'kind' | 'render'> & { bodies: readonly string[]; ink: string }

const PASTEL: Record<string, Pastel> = {
  lagoon: {
    label: 'Lagoon pop',
    accent: '#00686c',
    colors: ['#00686c', '#32c2b9', '#edecb3', '#fad928', '#ff9915'],
    shells: { cream: '#edecb3', sun: '#fad928', tang: '#ffd392', aqua: '#a2e6e1' },
    accents: { deep: '#00686c', ember: '#d1495b', ink: '#1f4e79' },
  },
  punch: {
    label: 'Punch',
    accent: '#d62839',
    colors: ['#1d3557', '#457b9d', '#a8dadc', '#f1faee', '#e63946'],
    shells: { foam: '#f1faee', ice: '#a8dadc', blush: '#ffd6da', sand: '#f4e3b1' },
    accents: { red: '#e63946', steel: '#457b9d', sea: '#2f5d8a' },
  },
  candy: {
    label: 'Candy riot',
    accent: '#b5179e',
    colors: ['#3a0ca3', '#7209b7', '#f72585', '#4cc9f0', '#ffd166'],
    shells: { butter: '#ffd166', sky: '#9be3f7', bubble: '#ffb3da', lilac: '#d9c2ff' },
    accents: { plum: '#b5179e', blue: '#3f51d8', rose: '#d6246e' },
  },
  picnic: {
    label: 'Picnic',
    accent: '#1f7a6d',
    colors: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
    shells: { mustard: '#e9c46a', apricot: '#f7bb8c', oat: '#f6e7cb', sage: '#bfd8c2' },
    accents: { rust: '#c44536', pine: '#1f7a6d', slate: '#3d5a80' },
  },
  sorbet: {
    label: 'Sorbet',
    accent: '#2f6fd6',
    colors: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#f7f7f7'],
    shells: { lemon: '#ffe57a', mint: '#b1e9b8', peachy: '#ffcec5', cloud: '#eef3ff' },
    accents: { coral: '#e05252', blue: '#2f6fd6', green: '#2e8b57' },
  },
  terracotta: {
    label: 'Terracotta duo',
    accent: '#b8492f',
    colors: ['#3d405b', '#e07a5f', '#81b29a', '#f2cc8f', '#f4f1de'],
    shells: { bone: '#f4f1de', clay: '#f6d0c2', moss: '#cbdfd4', honey: '#f4d6a4' },
    accents: { terra: '#c8553d', indigo: '#4a5080', sage: '#4f7f67' },
  },
}

const BOLD: Record<string, Bold> = {
  marble: {
    label: 'Marble night',
    accent: '#d10050',
    colors: ['#0a0310', '#49007e', '#ff005b', '#ff7d10', '#ffb238'],
    bodies: ['#ffb238', '#ff7d10', '#ff5c8a', '#ffd37a'],
    ink: '#1b0630',
  },
  riso: {
    label: 'Riso print',
    accent: '#0070b3',
    colors: ['#0078bf', '#ff48b0', '#ffe800', '#00a95c', '#f8f2e8'],
    bodies: ['#ffe800', '#ff7ac6', '#3dbe7a', '#4da3df', '#ffb0d9'],
    ink: '#1a1a2e',
  },
  lime: {
    label: 'Electric lime',
    accent: '#6a4bff',
    colors: ['#1b1b1b', '#c6f432', '#7b61ff', '#ff5da2', '#f5f5f5'],
    bodies: ['#c6f432', '#ff8cc3', '#a895ff', '#f5f5f5'],
    ink: '#1b1b1b',
  },
  bauhaus: {
    label: 'Bauhaus',
    accent: '#b4436c',
    colors: ['#1e1e24', '#b4436c', '#f2c14e', '#f78154', '#4d9078'],
    bodies: ['#f2c14e', '#f78154', '#e07ba0', '#7fb89d'],
    ink: '#1e1e24',
  },
}

const rgb = (h: string) => [1, 3, 5].map((i) => Number.parseInt(h.slice(i, i + 2), 16))
const hex = (c: number[]) =>
  `#${c
    .map((v) =>
      Math.max(0, Math.min(255, Math.round(v)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
const lum = (h: string) => {
  const [r = 0, g = 0, b = 0] = rgb(h).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a: string, b: string) => {
  const [x = 0, y = 0] = [lum(a), lum(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}
const pick = <T>(list: readonly T[], i: number) => list[i % list.length] as T
const recolor = (markup: string, from: string, to: string) =>
  markup.replace(new RegExp(from, 'gi'), to)
// move every fill by the offset that takes the pastel shell to the strong body,
// so the plates keep their tone steps
const shift = (markup: string, from: string, to: string) => {
  const f = rgb(from)
  const t = rgb(to)
  return markup.replace(
    /fill="(#[0-9a-fA-F]{6})"/g,
    (_, c: string) => `fill="${hex(rgb(c).map((v, i) => (t[i] ?? 0) + v - (f[i] ?? 0)))}"`,
  )
}
const withBackdrop = (markup: string, fill: string) =>
  markup.replace(/fill="#[0-9a-fA-F]{6}"/, `fill="${fill}"`)

type Ctx = SlotContext

function pastel(id: string, t: Pastel): Theme {
  const inst = createNurblings({
    shells: t.shells,
    accents: t.accents,
    slots: {
      // the backdrop takes a strong palette colour, chosen by the seed's grain
      backdrop: (ctx: Ctx, base: () => string) => {
        const shell = ctx.traits.palette.shell.toLowerCase()
        return withBackdrop(
          base(),
          pick(
            t.colors.filter((c) => c !== shell),
            ctx.traits.silhouette.grain,
          ),
        )
      },
    },
  })
  return { ...t, id, kind: 'pastel', render: (seed, opts) => inst.nurbling(seed, opts as never) }
}

const BASE = Object.values(SHELLS).map((s) => s.shell.toLowerCase())

function bold(id: string, t: Bold): Theme {
  const bodyOf = (ctx: Ctx) =>
    pick(t.bodies, Math.max(0, BASE.indexOf(ctx.traits.palette.shell.toLowerCase())))
  const backOf = (ctx: Ctx) => {
    const body = bodyOf(ctx)
    return pick(
      t.colors.filter((c) => c !== body && ratio(c, body) > 1.6),
      ctx.traits.silhouette.grain,
    )
  }
  const inkOn = (ground: string) =>
    ratio(t.ink, ground) >= ratio('#ffffff', ground) ? t.ink : '#ffffff'
  const inst = createNurblings({
    slots: {
      backdrop: (ctx: Ctx, base: () => string) => withBackdrop(base(), backOf(ctx)),
      body: (ctx: Ctx, base: () => string) =>
        recolor(base(), ctx.traits.palette.shell, bodyOf(ctx)),
      plates: (ctx: Ctx, base: () => string) =>
        shift(base(), ctx.traits.palette.shell, bodyOf(ctx)),
      antennae: (ctx: Ctx, base: () => string) =>
        recolor(base(), ctx.traits.palette.accent, inkOn(backOf(ctx))),
      brow: (ctx: Ctx, base: () => string) => recolor(base(), ctx.traits.palette.accent, t.ink),
      extra: (ctx: Ctx, base: () => string) => recolor(base(), ctx.traits.palette.accent, t.ink),
    },
  })
  return { ...t, id, kind: 'bold', render: (seed, opts) => inst.nurbling(seed, opts as never) }
}

export const THEMES: Record<string, Theme> = {
  default: {
    id: 'default',
    label: 'Nurblings',
    kind: 'default',
    accent: '#6a4bd6',
    colors: Object.values(SHELLS)
      .slice(0, 5)
      .map((s) => s.shell),
    render: (seed, opts) => nurbling(seed, opts as never),
  },
  ...Object.fromEntries(Object.entries(PASTEL).map(([id, t]) => [id, pastel(id, t)])),
  ...Object.fromEntries(Object.entries(BOLD).map(([id, t]) => [id, bold(id, t)])),
}

export const themeIds = (kind: ThemeKind) =>
  Object.values(THEMES)
    .filter((t) => t.kind === kind)
    .map((t) => t.id)
