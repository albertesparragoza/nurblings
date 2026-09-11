# @nurblings/react

A React Server Component for [nurblings](https://github.com/albertesparragoza/nurblings):
any string in, a small curious creature out. The same string always hatches
the same Nurbling.

`Nurbling` renders zero client JavaScript: it is a plain server component
with no `'use client'` directive, no hooks, no state and no effects. It
renders one `<span>` wrapper with the SVG inlined through
`dangerouslySetInnerHTML`, so the markup is identical on the server and the
client.

## Install

```sh
pnpm add @nurblings/react
```

React 18 or 19 is required as a peer dependency.

## Usage

```tsx
import { Nurbling } from '@nurblings/react'

export default function Avatar() {
  return <Nurbling seed="ada@example.com" size={48} mood="curious" />
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `seed` | `string` | required | Any string. The same seed always renders the same avatar. |
| `className` | `string` | - | Forwarded to the wrapper `<span>`. |
| `style` | `React.CSSProperties` | - | Merged onto the wrapper `<span>`'s inline style. |
| `size` | `number` | `128` | Pixel size. At 32 or below the mouth and extras are dropped. |
| `background` | `'none' \| 'circle' \| 'squircle' \| 'square'` | `'none'` | Background shape. |
| `title` | `string` | `'Nurbling'` | Accessible name for the SVG. |
| `animate` | `boolean` | `false` | Antenna sway on hover, only without reduced motion. |
| `gen` | `1` | `1` | Trait generation. |
| `mood` | `'neutral' \| 'curious' \| 'pleased' \| 'thinking' \| 'sleepy'` | derived from seed | Pins the mood trait. |
| `mouth` | `'none' \| 'dot' \| 'line' \| 'smile'` | derived from seed | Pins the mouth trait. |
| `extra` | `'none' \| 'scarf' \| 'pin' \| 'hat' \| 'collar'` | derived from seed | Pins the extra trait. |
| `silhouette` | `'pebble' \| 'drop' \| 'bean' \| 'bell' \| 'acorn' \| 'loaf'` | derived from seed | Pins the silhouette trait. |
| `shell` | `'mint' \| 'sky' \| 'butter' \| 'peach' \| 'lilac' \| 'sage' \| 'cloud' \| 'blush' \| 'lemon'` | derived from seed | Pins the shell colour trait. |

See the [root README](https://github.com/albertesparragoza/nurblings#readme)
for the full `nurblings` API and the ideas behind it.
