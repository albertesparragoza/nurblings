# API reference

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
| `animate` | `boolean` | `false` | Antennae sway on hover and keyboard focus. Never moves when the viewer prefers reduced motion. |
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
