# @nurblings/astro

An Astro component for [nurblings](https://github.com/albertesparragoza/nurblings#readme):
deterministic avatars, any string in, a small curious creature out. The same
string always hatches the same Nurbling.

## Install

```sh
pnpm add @nurblings/astro
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
| `animate` | `boolean` | `false` | Antenna sway on hover, only without reduced motion. |
| `frame` | `'auto' \| 'full' \| 'portrait'` | `'auto'` | Portrait crops closer on the face for small round avatars; full shows the whole figure. Auto picks portrait at 48 px and below. |
| `gen` | `1` | `1` | Trait generation; pins the ruleset an avatar is drawn from. |
| `mood` | `'neutral' \| 'curious' \| 'pleased' \| 'thinking' \| 'sleepy'` | (from seed) | Locks the mood trait. |
| `mouth` | `'none' \| 'dot' \| 'line' \| 'smile'` | (from seed) | Locks the mouth trait. |
| `extra` | `'none' \| 'scarf' \| 'pin' \| 'hat' \| 'collar'` | (from seed) | Locks the extra trait. |
| `silhouette` | `'classic' \| 'basketball' \| 'squat' \| 'firm' \| 'round' \| 'bell' \| 'wide' \| 'smooth' \| 'pear' \| 'tall'` | (from seed) | Locks the body design; each seed still varies it slightly. |
| `shell` | `'mint' \| 'sky' \| 'butter' \| 'peach' \| 'lilac' \| 'sage' \| 'cloud' \| 'blush' \| 'lemon'` | (from seed) | Locks the shell colour trait. |
| `class` | `string` | | Forwarded to the wrapper `<span>`. |
| `style` | `string` | | Forwarded to the wrapper `<span>`, merged after its own inline layout styles. |

Pinning a trait only fixes that one trait; every other trait is still drawn
from the seed. See the [root docs](https://github.com/albertesparragoza/nurblings#readme)
for the full `nurblings` API.

## License

MIT. See the [repository license](https://github.com/albertesparragoza/nurblings/blob/main/LICENSE).
