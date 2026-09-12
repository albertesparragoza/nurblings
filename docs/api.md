---
title: API reference
description: Every function, option and type the nurblings package exports.
---

Everything below is exported from the `nurblings` package. It has no runtime
dependencies and runs anywhere JavaScript does: browsers, Node, Deno, Bun,
edge runtimes and build-time rendering.

```ts
import { nurbling, traits, toDataUri } from 'nurblings'
```

## `nurbling(seed, options?)`

Returns one Nurbling as an SVG string.

```ts
nurbling('ada@example.com')
nurbling('ada@example.com', { size: 48, background: 'circle' })
```

The same seed always returns the same SVG, byte for byte, on every engine and
platform. Seeds are normalised first (see [`normaliseSeed`](#normaliseseedseed)),
so `Ada Lovelace`, `ada.lovelace` and `ADA_LOVELACE` hatch the same Nurbling.

### Options

| Option | Type | Default | What it does |
| --- | --- | --- | --- |
| `size` | `number` | `128` | Width and height in pixels, a positive number. At 32 and below, small-size mode drops the mouth and extras so the face still reads. |
| `background` | `'none' \| 'circle' \| 'squircle' \| 'square'` | `'none'` | A backdrop in a tint of the Nurbling's own shell colour. |
| `title` | `string` | `'Nurbling'` | The accessible name, used for `aria-label` and `<title>`. Escaped for you. |
| `animate` | `boolean \| Motion` | `true` | Ambient life: the body breathes, the eyes blink, the antennae drift, and wiggle faster on hover. `false` draws a still avatar; an object picks layers, see [Motion](#motion). Never moves when the viewer prefers reduced motion, nor at 32 px and below. |
| `frame` | `'auto' \| 'full' \| 'portrait'` | `'auto'` | How the Nurbling sits in its square. `portrait` crops closer on the face, which reads better in small round avatars; `full` shows the whole figure, antennae included. `auto` uses a portrait at 48 px and below and the full figure above. |
| `gen` | `1` | `1` | The trait generation. Pin it to keep an avatar identical across future releases. |
| `mood` | `'neutral' \| 'curious' \| 'pleased' \| 'thinking' \| 'sleepy'` | from the seed | Pins the resting mood. |
| `mouth` | `'none' \| 'dot' \| 'line' \| 'smile'` | from the seed | Pins the mouth. |
| `extra` | `'none' \| 'scarf' \| 'pin' \| 'hat' \| 'collar'` | from the seed | Pins the extra. |
| `silhouette` | `'classic' \| 'basketball' \| 'squat' \| 'firm' \| 'round' \| 'bell' \| 'wide' \| 'smooth' \| 'pear' \| 'tall'` | from the seed | Pins the body design. Each seed still varies it slightly and gets its own plate pattern. |
| `shell` | `'mint' \| 'sky' \| 'butter' \| 'peach' \| 'lilac' \| 'sage' \| 'cloud' \| 'blush' \| 'lemon'` | from the seed | Pins the body colour. The accent is still chosen from the colours that read well on it. |

Pinning one trait never changes any other: every trait is drawn from its own
random stream. The one exception is `shell`: pinning it re-picks the accent
from the colours that read well on that shell, so the brow and antennae keep
their contrast.

An unknown value for `gen`, `mood`, `mouth`, `extra`, `silhouette` or `shell`
throws a `RangeError`, and so does a `size` that is not a positive number.

`traits()` returns a fresh object every time: changing it never affects any
other avatar.

### Motion

Every Nurbling is alive by default. The motion is CSS inside the SVG: no
script, no ids, so it works in server components, in an `<img>` and in a
`data:` URI. Each seed gets its own timing, so a grid never breathes in unison.

```ts
nurbling(seed)                                       // all layers
nurbling(seed, { animate: false })                   // a still drawing
nurbling(seed, { animate: { blink: false } })        // everything but blinking
nurbling(seed, { animate: { hover: false, speed: 0.5 } }) // calmer, no hover
```

| Layer | What moves |
| --- | --- |
| `breath` | The body squashes and stretches slowly from its base. |
| `blink` | The eyes blink every few seconds. |
| `antennae` | Each antenna drifts on its own clock. |
| `hover` | The antennae wiggle faster while the pointer is over the avatar. |

`speed` multiplies every clock (2 is twice as fast) and must be a positive
number. Sleepy Nurblings move a little slower. Nothing moves when the viewer
asks for reduced motion, or at 32 px and below, where motion reads as noise.
For long lists, `animate: { breath: false, antennae: false }` keeps just the
blink and the hover.

## Moving between places: `morph(update, options?)`

A Nurbling can glide from a dialog into a list, or from a hero into a header,
instead of jumping. Give the avatar the same `transition` key in both places,
then make the change inside `morph`:

```ts
import { morph } from 'nurblings/transition'

// the same key in the list and in the dialog links the two
nurbling(user.id, { size: 48, transition: user.id })
nurbling(user.id, { size: 320, transition: user.id })

await morph(() => dialog.close())
```

`update` must change the page before it returns, or return a promise that
resolves once it has:

```tsx
// React
morph(() => flushSync(() => setOpen(false)))
```

```ts
// Vue
morph(async () => {
  open.value = false
  await nextTick()
})
```

- Browsers with View Transitions use them when each key is on screen once.
  Otherwise, and in every other browser, the avatar is animated from its old
  box to its new one with a transform, which keeps the vector sharp.
- `duration` (milliseconds, default 450) and `easing` (any CSS easing) tune the
  move. Under reduced motion the change simply happens.
- The helper is its own entry, about 1 KB: pages that never import it pay
  nothing.
- For moves across page navigations, use your framework's view transitions
  with `transitionName(key)` as the `view-transition-name`.

## `traits(seed, options?)`

Returns the resolved traits a seed hatches, without rendering: silhouette,
antennae, eyes, brow, mouth, extra, mood and palette. Useful for tests, for
theming around an avatar (the palette's `shell` and `accent` are good UI
colours), or for rendering with `renderTraits`.

## `toDataUri(svg)`

Wraps an SVG string as a `data:` URI for an `<img src>` or a CSS
`background-image`.

```ts
const src = toDataUri(nurbling('ada@example.com', { size: 64 }))
```

## `renderTraits(traits, options?)`

Renders a traits object you built or edited yourself. Takes the rendering
options (`size`, `background`, `title`, `animate`).

## `normaliseSeed(seed)`

The normalisation every seed goes through before hashing: Unicode NFKC, lower
case, accents and other combining marks stripped, whitespace and punctuation
removed. Emoji are kept, so an emoji seed still hatches its own Nurbling.

## `isFlagshipSeed(seed)`

`true` for the few reserved seeds that render Nurbi, the family's flagship
character. Every other seed is kept away from Nurbi's look.

## Your own palette, designs and parts: `createNurblings(config)`

Configure once, use everywhere:

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
    mouth: false,                                               // drop a part
    extra: () => '<circle cx="50" cy="80" r="3" fill="#2c5fd9"/>', // replace it
    brow: (ctx, base) => `<g opacity="0.9">${base()}</g>`,         // wrap it
  },
  defaults: { size: 48, background: 'circle' },
})

avatars.nurbling('ada@example.com')
avatars.traits('ada@example.com', { silhouette: 'robot' }) // custom names are typed
```

- **Colours are paired by contrast.** An accent is used only if it reads on
  light and dark pages (2.5:1) and on a shell (3:1); every shell needs
  readable eyes and at least two such accents. Setup throws a `RangeError`
  naming the colour when that is not possible.
- **Slots** are `backdrop`, `antennae`, `body`, `plates`, `extra`, `eyes`,
  `brow` and `mouth`, painted in that order. Each receives the traits, the body
  geometry and the size. Keep your markup free of `id` attributes, so many
  avatars can share a page.
- The same config and seed always render the same avatar. Only the default
  `nurbling()` draws Nurbi for its reserved seeds.

## Generations and stability

Traits ship in numbered generations. Within a generation, a seed renders the
same SVG forever: releases never change existing avatars. New shapes, colours
or extras arrive as a new generation, and you opt in by passing `gen`.

## Accessibility

- Every SVG has `role="img"`, an `aria-label` and a `<title>`. Pass `title`
  with the person's name, for example `title: 'Ada Lovelace'`.
- Colours are chosen for contrast: the accent clears 3:1 on the body, and the
  antennae read on both light and dark pages.
- Motion is opt-in and respects `prefers-reduced-motion`.

## Licence of generated avatars

The code is MIT. The avatars it generates are dedicated to the public domain
under CC0: use them anywhere, commercially or not, without attribution. The
names Nurbi and Nurblings and the flagship artwork are reserved, see
[TRADEMARKS.md](../TRADEMARKS.md).
