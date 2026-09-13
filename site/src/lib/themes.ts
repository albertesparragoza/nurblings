// The themes the site shows: the library's own, from `nurblings/themes`, with
// the label and page accent the site uses for each.
import { type NurblingRenderer, nurbling, SHELLS } from 'nurblings'
import { THEMES as LIBRARY, type ThemeName, themed } from 'nurblings/themes'

export type RenderOptions = NonNullable<Parameters<NurblingRenderer['nurbling']>[1]>
export type ThemeKind = 'default' | 'pastel' | 'bold'

export interface Theme {
  id: string
  label: string
  kind: ThemeKind
  /** UI accent while the theme is active */
  accent: string
  colors: readonly string[]
  render(seed: string, opts?: RenderOptions): string
}

const META: Record<ThemeName, readonly [label: string, kind: ThemeKind, accent: string]> = {
  lagoon: ['Lagoon pop', 'pastel', '#00686c'],
  punch: ['Punch', 'pastel', '#d62839'],
  candy: ['Candy riot', 'pastel', '#b5179e'],
  picnic: ['Picnic', 'pastel', '#1f7a6d'],
  sorbet: ['Sorbet', 'pastel', '#2f6fd6'],
  terracotta: ['Terracotta duo', 'pastel', '#b8492f'],
  marble: ['Marble night', 'bold', '#d10050'],
  riso: ['Riso print', 'bold', '#0070b3'],
  lime: ['Electric lime', 'bold', '#6a4bff'],
  bauhaus: ['Bauhaus', 'bold', '#b4436c'],
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
  ...Object.fromEntries(
    (Object.keys(META) as ThemeName[]).map((id) => {
      const [label, kind, accent] = META[id]
      const instance = themed(id)
      const theme: Theme = {
        id,
        label,
        kind,
        accent,
        colors: LIBRARY[id].backdrops ?? [],
        render: (seed, opts) => instance.nurbling(seed, opts),
      }
      return [id, theme]
    }),
  ),
}

export const themeIds = (kind: ThemeKind) =>
  Object.values(THEMES)
    .filter((t) => t.kind === kind)
    .map((t) => t.id)
