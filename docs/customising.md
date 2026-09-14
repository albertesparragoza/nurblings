---
title: Customising
description: Bring your brand palette, add or drop body designs, and replace any drawn part with createNurblings.
---

`createNurblings(config)` makes an instance with your palette, body designs,
drawn parts and defaults. Configure it once and use it everywhere:

```ts
import { createNurblings, SILHOUETTES } from 'nurblings'

export const avatars = createNurblings({
  // brand colours replace the built-in palette
  shells: { mist: '#e4ebf2', sand: '#f1e4cf' },
  accents: { ink: '#2c5fd9', coral: '#c94f38', forest: '#2e7d4f' },
  // designs are added to the built-in ones; false drops one
  silhouettes: {
    pear: false,
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
- **Slots and parts** change or add drawn parts: see
  [Extending parts](#extending-parts). Their markup goes into the SVG as it is,
  so build it from your own code, the anchors and the colours, never from user
  input, and put any text from `props` through `ctx.esc`. Keep it free of `id`
  attributes, so many avatars can share a page. Treat what `ctx` holds as
  read-only, and return a string.
- **Custom body designs** need finite numbers, a positive `hw` and `width`, a
  known `plates` zone, and at most 12 plate rows and 12 columns. Setup throws a
  `RangeError` naming the design and the field otherwise.
- The same config and seed always render the same avatar. Only the default
  `nurbling()` draws Nurbi for its reserved seeds.

## Extending parts

Every drawn part is a named layer, painted in this order: `backdrop`,
`antennae`, `body`, `plates`, `extra`, `eyes`, `brow`, `mouth`, and any part
a config adds. Three tools work on them, and they combine:

- **`slots`** change a part, built in or added: return markup to replace it,
  call `base()` to wrap it, or pass `false` to drop it.
- **`parts`** add a new part, painted right after the part it names
  (`after`, `mouth` by default). Added parts step aside at 32 px and below
  unless they set `small: true`.
- **`use`** stacks presets. A preset is an ordinary config, so a recipe, a
  brand kit and a plugin are all the same thing.

### What every part reads

Slots and parts all receive the same `ctx`. Built-in parts are drawn from the
same anchors and colours, so a part placed on them fits every body, follows
every theme and switches with the page.

| Field | Is |
| --- | --- |
| `anchors` | Named places, in drawing units: `centre`, `base`, `crown`, `eyes` (each with `x`, `y`, `rx`, `ry`), `brow`, `mouth`, `chest`, `box`, and `band(f)`, the body's `left` and `right` edges at a height from `0` (base) to `1` (crown) |
| `colours` | Each colour role as drawn for this avatar: `shell`, `eye`, `accent` (brow), `mark` (antennae), `wear` (extras), `ground` (container). A theme sets them all |
| `paint(role, 'fill' \| 'stroke')` | A role as an attribute. In `mode: 'auto'`, `ground` and `mark` switch with the page, as the built-in parts do |
| `random(name)` | A random stream of its own, the same for an avatar every time |
| `theme`, `options`, `props` | The theme in use, the call's options, and data from the config and the call (the call wins) |
| `small`, `size`, `mode` | 32 px and below, the pixel size, and the page mode |
| `n(value)`, `esc(text)` | A number as the renderer writes it, and text made safe for SVG |
| `traits`, `geometry` | The raw traits and body shape, for anything else |

### Recipes

Each recipe is a preset. The home page draws every one of them.

**Body.** Wrap it and add a belly patch in a lighter shade of its own shell:

```ts
import { createNurblings } from 'nurblings'
import { setFill, shade } from 'nurblings/themes'

const belly = {
  slots: {
    body: ({ anchors: a, colours, n }, base) => {
      const { left, right, y } = a.band(0.2)
      return `${base()}<ellipse cx="${n(a.centre)}" cy="${n(y)}"
        rx="${n((right - left) * 0.28)}" ry="${n((a.base - y) * 0.6)}"
        fill="${shade(colours.shell, 0.5)}"/>`
    },
  },
}
```

**Eyes.** Keep them and put round glasses over them:

```ts
const glasses = {
  slots: {
    eyes: ({ anchors: { eyes: [l, r] }, n }, base) => {
      const size = l.rx * 1.7
      return `${base()}<g fill="none" stroke="#1b1b1b" stroke-width="1.3">
        <circle cx="${n(l.x)}" cy="${n(l.y)}" r="${n(size)}"/>
        <circle cx="${n(r.x)}" cy="${n(r.y)}" r="${n(size)}"/>
        <path d="M${n(l.x + size)} ${n(l.y)}H${n(r.x - size)}"/></g>`
    },
  },
}
```

**Mouth.** Replace it with a smile in the eye colour, as wide as the eyes are
apart. The built-in mouth steps aside at 32 px; this one does too:

```ts
const smile = {
  slots: {
    mouth: ({ anchors: a, small, paint, n }) => {
      if (small) return ''
      const w = (a.eyes[1].x - a.eyes[0].x) * 0.35
      return `<path d="M${n(a.centre - w)} ${n(a.mouth)}
        Q${n(a.centre)} ${n(a.mouth + w)} ${n(a.centre + w)} ${n(a.mouth)}"
        fill="none"${paint('eye', 'stroke')}
        stroke-width="1.6" stroke-linecap="round"/>`
    },
  },
}
```

**Extras.** Swap the scarf, collar or hat for a heart pin on the chest:

```ts
const pin = {
  slots: {
    extra: ({ anchors: a, small, n }) => {
      if (small) return ''
      const x = a.chest.x + (a.band(0.2).right - a.chest.x) * 0.25
      const y = a.band(0.2).y
      return `<path d="M${n(x)} ${n(y + 2.6)}l-3-3a1.8 1.8 0 0 1 3-2.4
        a1.8 1.8 0 0 1 3 2.4z" fill="#e63972"/>`
    },
  },
}
```

**A new part.** A status dot that reads `props` on each call, ringed in the
container colour so it switches with the page:

```ts
const status = {
  parts: {
    status: {
      after: 'mouth',
      small: true,
      draw: ({ anchors: a, props, paint, n }) => {
        const { right, y } = a.band(0.14)
        const fill = props.status === 'online' ? '#2e9e5b' : '#9a9a9a'
        return `<circle cx="${n(right - 2)}" cy="${n(y)}" r="7"
          fill="${fill}"${paint('ground', 'stroke')} stroke-width="2.5"/>`
      },
    },
  },
}
```

**Backdrop.** Keep the container and give it your brand colour:

```ts
const brand = {
  slots: { backdrop: (ctx, base) => setFill(base(), '#ffd166') },
}
```

### Combining

Put presets in `use`, or combine them with `compose()`. They apply in order:

- Slots chain: each later slot's `base()` is what the earlier ones drew, so
  two presets can both wrap the eyes, and a preset can restyle a part another
  one added.
- A later slot that does not call `base()` replaces everything before it; a
  later `false` drops the part, and a slot after that starts from nothing.
- Parts, body designs, colours and props merge by name, later names winning.
  The last theme wins, and defaults merge.

```ts
export const avatars = createNurblings({
  use: [belly, glasses, smile, pin, status, brand],
  theme: lagoon,
})

avatars.nurbling(user.id, { props: { status: user.online ? 'online' : 'away' } })
```

A slot for a name that is no part, or a part placed after one that does not
exist, throws a `RangeError` at setup. Antennae and brows can be slotted too,
but they carry the family look, so wrap them rather than replace them.

### Collections: new eyes, mouths and extras

The seed picks each avatar's eye shape, mouth and extra from a list. `eyes`,
`mouths` and `extras` add to those lists, the same way `silhouettes` adds body
designs, so a season's accessories are one preset:

- A new name joins the list and draws itself with `draw(ctx)`. `weight` sets
  how often it comes up: 1 by default, where each built-in extra weighs 1 and
  `none` 6.
- `false` drops a built-in choice. Drop them all to wear only your own.
- A built-in name with `draw` gets a new look; with `weight`, a new share.
- New mouths and extras step aside at 32 px and below; eyes always show.
- Only that trait changes. Every other trait of a seed stays as it was.

```ts
const winter = {
  extras: {
    beanie: {
      draw: ({ anchors: a, colours, n }) => {
        const rows = [0.62, 0.68, 0.74, 0.8, 0.85].map((f) => a.band(f))
        const right = rows.map((r) => `${n(r.right)},${n(r.y)}`)
        const left = rows.map((r) => `${n(r.left)},${n(r.y)}`).reverse()
        return `<path d="M${[...right, ...left].join('L')}Z" fill="${colours.wear}"/>`
      },
    },
    bowtie: {
      weight: 2,
      draw: ({ anchors: { chest: c }, colours, n }) =>
        `<path d="M${n(c.x)},${n(c.y)}l-5,-3v6zM${n(c.x)},${n(c.y)}l5,-3v6z"
          fill="${colours.accent}"/>`,
    },
  },
}

// add them to the extras
createNurblings({ use: [winter] })
// or wear only the new season
createNurblings({ use: [winter], extras: { none: false, scarf: false, hat: false, collar: false } })

avatars.nurbling(user.id, { extra: 'beanie' }) // new names can be pinned, and are typed
```

Body designs follow the same rule: `silhouettes: { robot: {...}, pear: false }`
adds one and drops another.

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
