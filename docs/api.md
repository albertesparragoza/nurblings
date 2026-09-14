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
nurbling('user-42')
nurbling('user-42', { size: 48, background: 'circle', title: 'Ada Lovelace' })
```

Seeds are normalised first (see [`normaliseSeed`](#normaliseseedseed)), so
`Ada Lovelace`, `ada.lovelace` and `ADA_LOVELACE` hatch the same Nurbling.
Prefer a stable user id over an email: ids never change, and normalisation
means two different strings can hatch the same creature.

### Options

| Option | Type | Default | What it does |
| --- | --- | --- | --- |
| `size` | `number` | `128` | Width and height in pixels, a positive number. At 32 and below, small-size mode drops the mouth and extras so the face still reads, and motion stops. |
| `background` | `'none' \| 'circle' \| 'squircle' \| 'square'` | `'none'` | The container behind the Nurbling, in a tint of its own shell colour. |
| `title` | `string` | `'Nurbling'` | The accessible name, used for `aria-label` and `<title>`. Escaped for you. |
| `animate` | `boolean \| Motion` | `true` | Ambient life: breath, blink, antenna drift and a hover wiggle. `false` draws a still avatar; an object picks layers. See [Motion and transitions](motion.md). |
| `frame` | `'auto' \| 'full' \| 'portrait'` | `'auto'` | How the Nurbling sits in its square. `portrait` crops closer on the face, which reads better in small round avatars; `full` shows the whole figure. `auto` uses a portrait at 48 px and below. |
| `mode` | `'light' \| 'dark' \| 'auto'` | `'light'` | The page the avatar sits on. The container colour and, where needed, the antennae change; the creature does not. `auto` follows the OS or a `data-theme="dark"` or `.dark` ancestor with CSS only. |
| `transition` | `string` | none | A key for `morph()`: the same key in two places links them, so the avatar glides between them. Adds a `data-nurbling-transition` attribute. |
| `gen` | `1` | `1` | The trait generation. Pin it to keep an avatar identical across future releases. |
| `mood` | `'neutral' \| 'curious' \| 'pleased' \| 'thinking' \| 'sleepy'` | from the seed | Pins the resting mood. |
| `mouth` | `'none' \| 'line' \| 'smile'` | from the seed | Pins the mouth. |
| `extra` | `'none' \| 'scarf' \| 'hat' \| 'collar'` | from the seed | Pins the extra. |
| `silhouette` | `'classic' \| 'basketball' \| 'squat' \| 'firm' \| 'round' \| 'bell' \| 'wide' \| 'smooth' \| 'pear' \| 'tall'` | from the seed | Pins the body design. Each seed still varies it slightly and gets its own plate pattern. |
| `shell` | `'mint' \| 'sky' \| 'butter' \| 'peach' \| 'lilac' \| 'sage' \| 'cloud' \| 'blush' \| 'lemon'` | from the seed | Pins the body colour. The accent is still chosen from the colours that read well on it. |

Pinning one trait never changes any other: every trait is drawn from its own
random stream. The one exception is `shell`: pinning it re-picks the accent
from the colours that read well on that shell, so the brow and antennae keep
their contrast.

An unknown value for `gen`, `mood`, `mouth`, `extra`, `silhouette` or `shell`
throws a `RangeError`, and so do a `size` or an `animate.speed` that is not a
positive number.

## `traits(seed, options?)`

Returns the resolved traits a seed hatches, without rendering: silhouette,
antennae, eyes, brow, mouth, extra, mood and palette. Useful for tests, for
theming around an avatar (the palette's `shell` and `accent` are good UI
colours), or for rendering with `renderTraits`. It returns a fresh object every
time: changing it never affects any other avatar.

## `nurblingSrc(seed, options?)`

The avatar as a data URI in one call, for an `<img src>`, a CSS `url()` or an
email. Takes the same options as `nurbling()`. A `createNurblings` instance has
the same thing as `.src(seed, options?)`.

```ts
img.src = nurblingSrc(user.id, { size: 64, background: 'circle' })
```

## `toDataUri(svg)`

Wraps an SVG string as a `data:` URI for an `<img src>` or a CSS
`background-image`.

```ts
const src = toDataUri(nurbling('user-42', { size: 64 }))
```

## `renderTraits(traits, options?)`

Renders a traits object you built or edited yourself. Takes the rendering
options: `size`, `background`, `title`, `animate`, `frame`, `mode` and
`transition`. Every value in the traits is checked first: a colour that is not
6-digit hex, a name outside the known traits or a number that is not finite
throws a `RangeError`, so traits from a database or a form can never inject
markup.

## `normaliseSeed(seed)`

The normalisation every seed goes through before hashing: Unicode NFKC, lower
case, accents and other combining marks stripped, whitespace and punctuation
removed. Emoji are kept, so an emoji seed still hatches its own Nurbling.

## `isFlagshipSeed(seed)`

`true` for the reserved seed `nurbi` (in any case or spacing), which renders
Nurbi, the family's flagship character, in every renderer and configuration.
Every other seed is kept away from Nurbi's look.

## `createNurblings(config)`

Makes an instance with your palette, body designs, drawn parts and defaults,
returning `{ nurbling, traits, src }` with the same signatures as above. Its
calls also take `theme` and `props`. Colours are checked for contrast, and
part positions and slot names are checked, at setup. See
[Customising](customising.md).

| Config | What it does |
| --- | --- |
| `theme` | A colour set for every avatar |
| `shells`, `accents` | Body and mark colours, replacing the built-in ones |
| `silhouettes`, `eyes`, `mouths`, `extras` | Lists the seed picks from. New names are added to the built-in ones, `false` drops one, and `weight` sets how often each comes up. New eyes, mouths and extras draw themselves with `draw(ctx)` |
| `slots` | Replace, wrap or drop any part by name, built in or added |
| `parts` | New parts, each `{ after?, small?, draw(ctx) }` |
| `props` | Data every slot and part reads as `ctx.props`; a call's `props` win |
| `use` | Presets applied first, in order: each is a config like this one |
| `defaults` | Options for every call |

Every slot and part receives the same context: `anchors`, `colours`,
`paint()`, `random()`, `theme`, `options`, `props`, `n()`, `esc()`, `small`,
`size`, `mode`, `traits` and `geometry`. See
[Extending parts](customising.md#extending-parts).

## `compose(...configs)`

Combines configs into one, the same way `use` does: slots chain, each later
one wrapping what the earlier ones drew; parts, designs, colours and props
merge by name, later names winning; the last theme wins; defaults merge.

```ts
const avatars = createNurblings(compose(brand, glasses, status))
```

## `nurblings/themes`

Named themes, `palette()` and colour helpers, in their own entry. Components
take `theme="lagoon"`; `createNurblings({ theme })` takes a theme object. See
[Customising](customising.md#themes).

| Export | Does |
| --- | --- |
| `lagoon`, `punch`, `candy`, `picnic`, `sorbet`, `terracotta`, `marble`, `riso`, `lime`, `bauhaus` | The built-in themes |
| `THEMES`, `ThemeName` | All of them by name |
| `palette(colours, name?)` | A theme from 2 to 5 hex colours |
| `themed(theme)` | A ready instance: `themed('lagoon').nurbling(seed)` |
| `contrast`, `ensureContrast`, `readableOn`, `shade`, `pickBy`, `recolour`, `setFill` | Colour helpers for slots |

## `morph(update, options?)` and `transitionName(key)`

From `nurblings/transition`, a separate entry of under 1 KB. `morph` applies a
page change and moves every avatar tagged with a `transition` key from where it
was to where it lands. See [Motion and transitions](motion.md).

## Generations and stability

Traits ship in numbered generations. Within a generation, a seed always hatches
the same Nurbling: releases never change existing avatars. The exact SVG for a
seed is stable for the same options and configuration; motion markup is a
layer on top of the drawing and can be turned off with `animate: false`. New
shapes, colours or extras arrive as a new generation, and you opt in by
passing `gen`.

## Accessibility

- Every SVG has `role="img"`, an `aria-label` and a `<title>`. Pass `title`
  with the person's name, for example `title: 'Ada Lovelace'`.
- Colours are chosen for contrast: the accent clears 3:1 on the body, and the
  antennae read on both light and dark pages.
- Motion is on by default, stops completely under `prefers-reduced-motion`,
  and turns off with `animate: false`.

## Licence of generated avatars

The code is MIT. Every avatar it generates is dedicated to the public domain
under CC0: use them anywhere, commercially or not, without attribution. The
generator never produces Nurbi's look, so no generated avatar can resemble the
flagship. The one exception is Nurbi itself, the stored drawing the seed
`nurbi` returns: the names Nurbi and Nurblings and that artwork are reserved,
see [TRADEMARKS.md](../TRADEMARKS.md).
