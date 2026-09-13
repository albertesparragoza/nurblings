---
title: Customising
description: Bring your brand palette, add or drop body designs, and replace any drawn part with createNurblings.
---

`createNurblings(config)` makes an instance with your palette, body designs,
drawn parts and defaults. Configure it once and use it everywhere:

```ts
import { createNurblings, SILHOUETTES } from 'nurblings'

const { pear, ...designs } = SILHOUETTES

export const avatars = createNurblings({
  // brand colours replace the built-in palette
  shells: { mist: '#e4ebf2', sand: '#f1e4cf' },
  accents: { ink: '#2c5fd9', coral: '#c94f38', forest: '#2e7d4f' },
  // spread the built-in designs to extend them; leave names out to drop them
  silhouettes: {
    ...designs,
    robot: { hw: 1.1, width: 0.9, belly: 0.3, tip: 0.9, rows: 4, cols: 2, plates: 'side', weight: 2 },
  },
  slots: {
    mouth: false,                                                  // drop a part
    extra: () => '<circle cx="50" cy="80" r="3" fill="#2c5fd9"/>', // replace it
    brow: (ctx, base) => `<g opacity="0.9">${base()}</g>`,          // wrap it
  },
  defaults: { size: 48, background: 'circle' },
})

avatars.nurbling('user-42')
avatars.traits('user-42', { silhouette: 'robot' }) // custom names are typed
```

## The rules

- **Colours are paired by contrast.** An accent is used only if it reads on
  light and dark pages (2.5:1) and on a shell (3:1); every shell needs
  readable eyes and at least two such accents. Setup throws a `RangeError`
  naming the colour when that is not possible, so a palette that would give
  unreadable faces fails before a single avatar renders.
- **Slots** are `backdrop`, `antennae`, `body`, `plates`, `extra`, `eyes`,
  `brow` and `mouth`, painted in that order. Each receives the traits, the body
  geometry and the size. Return your own markup to replace a part, call
  `base()` to wrap it, or pass `false` to drop it. Keep your markup free of
  `id` attributes, so many avatars can share a page. Slot markup goes into the SVG as it
  is, so build it from your own code and the traits, never from user input.
  Slots read a frozen copy of the traits and the geometry and must return a
  string: changing what they read throws instead of reaching the parts drawn
  after them.
- **Custom body designs** need finite numbers, a positive `hw` and `width`, a
  known `plates` zone, and at most 12 plate rows and 12 columns. Setup throws a
  `RangeError` naming the design and the field otherwise.
- The same config and seed always render the same avatar. Only the default
  `nurbling()` draws Nurbi for its reserved seeds.

## Use it everywhere

```tsx
// React server components: pass it as a prop (wrap once in your own component)
<Nurbling nurblings={avatars} seed={user.id} />

// React client components: a provider
import { NurblingsProvider } from '@nurblings/react/client'
<NurblingsProvider value={avatars}>{children}</NurblingsProvider>
```

```ts
// Vue and Nuxt: install once
import { NurblingsPlugin } from '@nurblings/vue'
app.use(NurblingsPlugin(avatars))
```

```ts
// Astro: <Nurbling nurblings={avatars} seed={user.id} />
// Custom element: el.nurblings = avatars
```

## Themes

Ten themes ship in `nurblings/themes`. Pass one by name to any component, or
hand it to `createNurblings`:

```tsx
<Nurbling seed={user.id} theme="lagoon" />
```

```ts
import { createNurblings } from 'nurblings'
import { lagoon } from 'nurblings/themes'

export const avatars = createNurblings({ theme: lagoon })
```

| Theme | Feel |
| --- | --- |
| `lagoon`, `punch`, `candy`, `picnic`, `sorbet`, `terracotta` | Soft bodies on a strong container colour |
| `marble`, `riso`, `lime`, `bauhaus` | Vivid bodies with one dark ink for every mark |

Importing a theme by name keeps only that one in your bundle. The `theme="..."`
prop on the components looks names up in `THEMES`, which adds about 1 KB.

### Your own colours

`palette()` turns 2 to 5 colours into a theme, in any order. The lightest
become bodies, the darkest the brows and antennae, and the rest the containers.

```ts
import { palette } from 'nurblings/themes'

const brand = palette(['#264653', '#e9c46a', '#f4a261'])
createNurblings({ theme: brand })
```

| Colours | Bodies | Brows and antennae | Containers |
| --- | --- | --- | --- |
| 2 | 1 | 1 | a tint of the body |
| 3 | 1 | 1 | 1 |
| 4 | 2 | 1 | 1 |
| 5 | 2 | 2 | 1 |

Two colours give a two-tone family. Themes are repaired, never refused: brows
and antennae are darkened or lightened until they read on every body, and eyes
turn light on a dark body.

For full control, write the theme object yourself:

```ts
const night = {
  name: 'night',
  shells: { moon: '#e8e4f7', dusk: '#b9b3e6' },
  accents: { ink: '#2b2350' },
  backdrops: ['#2b2350', '#6a5acd'],   // containers on light pages
  darkBackdrops: ['#15122b'],          // containers on dark pages
} satisfies Theme
```

## Light and dark pages

`mode` tells an avatar what page it sits on. The creature never changes; its
container colour does, and so do the antennae where they would disappear into it.

```tsx
<Nurbling seed={user.id} background="circle" mode="dark" />
<Nurbling seed={user.id} background="circle" mode="auto" />
```

`auto` needs no JavaScript. The nearest `data-theme="dark"` or `.dark` ancestor
turns it dark, the nearest `data-theme="light"` or `.light` one keeps it light,
at any depth, and with neither the OS setting decides.

## Colour helpers for slots

Most slot code is no longer needed once a theme exists. When a slot still
recolours, `nurblings/themes` has the pieces:

```ts
import { contrast, ensureContrast, pickBy, readableOn, recolour, setFill, shade } from 'nurblings/themes'

createNurblings({
  theme: brand,
  slots: {
    backdrop: (ctx, base) => setFill(base(), pickBy(['#264653', '#2a9d8f'], ctx.traits.silhouette.grain)),
    brow: (ctx, base) => recolour(base(), ctx.traits.palette.accent, '#1b1b1b'),
  },
})
```

| Helper | Does |
| --- | --- |
| `contrast(a, b)` | The WCAG contrast ratio of two colours |
| `ensureContrast(fg, bg, min)` | `fg`, moved until it reads on `bg` at `min`:1 |
| `readableOn(ground, candidates, min?)` | The first candidate that reads on `ground` |
| `shade(hex, k)` | Toward white for `k > 0`, toward black for `k < 0` |
| `pickBy(list, n)` | One item per whole number, such as the seed's grain |
| `recolour(markup, from, to)` | Swaps one colour in a slot's markup |
| `setFill(markup, fill)` | Sets the first fill, such as the container's |
