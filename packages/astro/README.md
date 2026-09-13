# @nurblings/astro

An Astro component for [nurblings](https://github.com/albertesparragoza/nurblings#readme):
deterministic avatars, any string in, a small curious creature out. The same
string always hatches the same Nurbling.

## Install

```sh
npm install @nurblings/astro
```

Astro 4 or newer is a peer dependency; the core `nurblings` package comes with
this one.

## Usage

```astro
---
import { Nurbling } from '@nurblings/astro'
---

<Nurbling seed="ada@example.com" size={48} mood="curious" />
```

The component is also available at its own subpath:

```astro
---
import Nurbling from '@nurblings/astro/Nurbling.astro'
---
```

It renders one `<span>` with the avatar's SVG markup inlined via `set:html`,
and ships zero client JavaScript: no hydration, no script tag, identical
markup on the server and the client.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `seed` | `string` | (required) | Any string. The same seed always renders the same Nurbling. |
| `size` | `number` | `128` | Size in pixels. `32` or smaller drops the mouth and extras. |
| `background` | `'none' \| 'circle' \| 'squircle' \| 'square'` | `'none'` | Background shape behind the silhouette. |
| `title` | `string` | `"Nurbling"` | Accessible name for the SVG. |
| `animate` | `boolean \| Motion` | `true` | Ambient life (breath, blink, antenna drift, hover wiggle). `false` for a still avatar, or an object such as `{ blink: false, speed: 0.5 }`. CSS only, so the page still ships no JavaScript. |
| `frame` | `'auto' \| 'full' \| 'portrait'` | `'auto'` | Portrait crops closer on the face for small round avatars; full shows the whole figure. Auto picks portrait at 48 px and below. |
| `gen` | `1` | `1` | Trait generation; pins the ruleset an avatar is drawn from. |
| `mood` | `'neutral' \| 'curious' \| 'pleased' \| 'thinking' \| 'sleepy'` | (from seed) | Locks the mood trait. |
| `mouth` | `'none' \| 'line' \| 'smile'` | (from seed) | Locks the mouth trait. |
| `extra` | `'none' \| 'scarf' \| 'hat' \| 'collar'` | (from seed) | Locks the extra trait. |
| `silhouette` | `'classic' \| 'basketball' \| 'squat' \| 'firm' \| 'round' \| 'bell' \| 'wide' \| 'smooth' \| 'pear' \| 'tall'` | (from seed) | Locks the body design; each seed still varies it slightly. |
| `shell` | `'mint' \| 'sky' \| 'butter' \| 'peach' \| 'lilac' \| 'sage' \| 'cloud' \| 'blush' \| 'lemon'` | (from seed) | Locks the shell colour trait. |
| `class` | `string` | | Forwarded to the wrapper `<span>`. |
| `style` | `string` | | Forwarded to the wrapper `<span>`, merged after its own inline layout styles. |

For an app-wide configuration, make an instance with `createNurblings` and
pass it as `nurblings`, or wrap the component once in your own `Avatar.astro`:

```ts
// src/avatars.ts
import { createNurblings } from 'nurblings'

export const avatars = createNurblings({
  shells: { mist: '#e4ebf2', sand: '#f1e4cf' },
  accents: { ink: '#2c5fd9', coral: '#c94f38', forest: '#2e7d4f' },
})
```

`src/components/Avatar.astro`:

```astro
---
import { Nurbling } from '@nurblings/astro'
import { avatars } from '../avatars'
const props = Astro.props
---
<Nurbling nurblings={avatars} {...props} />
```

Pinning a trait only fixes that one trait; every other trait is still drawn
from the seed. See the [root docs](https://github.com/albertesparragoza/nurblings#readme)
for the full `nurblings` API.

## License

MIT. See the [repository license](https://github.com/albertesparragoza/nurblings/blob/main/LICENSE).
