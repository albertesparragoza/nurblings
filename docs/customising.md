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
  Slots share the traits and geometry the built-in parts draw from, so treat
  them as read-only, and return a string.
- **Custom body designs** need finite numbers, a positive `hw` and `width`, a
  known `plates` zone, and at most 12 plate rows and 12 columns. Setup throws a
  `RangeError` naming the design and the field otherwise.
- The same config and seed always render the same avatar. Only the default
  `nurbling()` draws Nurbi for its reserved seeds.

## Extending parts

Slots draw in a 100-unit square. The body is centred on `x = 50` and stands on
its base, and `ctx.geometry` says where it is:

| Field | Is |
| --- | --- |
| `top` | the y of the crown |
| `height` | body height, so the base is at `top + height` |
| `bw` | body width |
| `halfWidthAt(y)` | half the body's width at a given y |

The eyes sit at `y = top + traits.eyes.depth * height`, `traits.eyes.spacing *
bw / 2` either side of the centre, `traits.eyes.size * bw` wide. Everything is derived from the seed, so each recipe below fits every body.

**Body.** Wrap it and add a belly patch in a lighter shade of its own shell:

```ts
import { createNurblings } from 'nurblings'
import { shade } from 'nurblings/themes'

createNurblings({
  slots: {
    body: ({ traits, geometry: g }, base) =>
      `${base()}<ellipse cx="50" cy="${g.top + g.height * 0.8}"
        rx="${g.bw * 0.26}" ry="${g.height * 0.12}"
        fill="${shade(traits.palette.shell, 0.5)}"/>`,
  },
})
```

**Eyes.** Keep them and put round glasses over them:

```ts
createNurblings({
  slots: {
    eyes: ({ traits: { eyes: e }, geometry: g }, base) => {
      const y = g.top + e.depth * g.height
      const dx = (e.spacing * g.bw) / 2
      const r = e.size * g.bw * 0.85
      return `${base()}<g fill="none" stroke="#1b1b1b" stroke-width="1.3">
        <circle cx="${50 - dx}" cy="${y}" r="${r}"/>
        <circle cx="${50 + dx}" cy="${y}" r="${r}"/>
        <path d="M${50 - dx + r} ${y}H${50 + dx - r}"/></g>`
    },
  },
})
```

**Mouth.** Replace it with a wide smile. `ctx.small` is true at 32 px and
below, where the built-in mouth and extras step aside; custom ones should too:

```ts
createNurblings({
  slots: {
    mouth: ({ traits: t, geometry: g, small }) => {
      if (small) return ''
      const y = g.top + (t.eyes.depth + 0.17) * g.height
      const w = g.bw * 0.13
      return `<path d="M${50 - w} ${y}Q50 ${y + w} ${50 + w} ${y}"
        fill="none" stroke="${t.palette.eye}"
        stroke-width="1.6" stroke-linecap="round"/>`
    },
  },
})
```

**Extras.** Swap the scarf, pin or hat for your own badge:

```ts
createNurblings({
  slots: {
    extra: ({ geometry: g, small }) => {
      if (small) return ''
      const x = 50 + g.bw * 0.2
      const y = g.top + g.height * 0.8
      return `<path d="M${x} ${y + 2.6}l-3-3a1.8 1.8 0 0 1 3-2.4
        a1.8 1.8 0 0 1 3 2.4z" fill="#e63972"/>`
    },
  },
})
```

**Backdrop.** Keep the container and give it your brand colour:

```ts
import { setFill } from 'nurblings/themes'

createNurblings({
  slots: { backdrop: (ctx, base) => setFill(base(), '#ffd166') },
})
```

Slots combine: pass several in one config, and use `false` for any part you
want gone. Antennae and brows are slots too, but they carry the family look,
so wrap them rather than replace them.

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
