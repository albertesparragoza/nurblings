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
npm install @nurblings/react
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
| `decorative` | `boolean` | `false` | Hides the SVG from assistive technology, for an avatar beside a written name. |
| `animate` | `boolean \| Motion` | `true` | Ambient life (breath, blink, antenna drift, hover wiggle). `false` for a still avatar, or an object such as `{ blink: false, speed: 0.5 }`. CSS only, so it still ships no JavaScript. |
| `frame` | `'auto' \| 'full' \| 'portrait'` | `'auto'` | Portrait crops closer on the face for small round avatars; full shows the whole figure. Auto picks portrait at 48 px and below. |
| `gen` | `1` | `1` | Trait generation. |
| `mood` | `'neutral' \| 'curious' \| 'pleased' \| 'thinking' \| 'sleepy'` | derived from seed | Pins the mood trait. |
| `mouth` | `'none' \| 'line' \| 'smile'` | derived from seed | Pins the mouth trait. |
| `extra` | `'none' \| 'scarf' \| 'hat' \| 'collar'` | derived from seed | Pins the extra trait. |
| `silhouette` | `'classic' \| 'basketball' \| 'squat' \| 'firm' \| 'round' \| 'bell' \| 'wide' \| 'smooth' \| 'pear' \| 'tall'` | derived from seed | Pins the body design; each seed still varies it slightly. |
| `shell` | `'mint' \| 'sky' \| 'butter' \| 'peach' \| 'lilac' \| 'sage' \| 'cloud' \| 'blush' \| 'lemon'` | derived from seed | Pins the shell colour trait. |

## App-wide configuration

Make an instance with `createNurblings` (your palette, designs, drawn parts,
defaults), then use it everywhere:

```ts
// avatars.ts
import { createNurblings } from 'nurblings'

export const avatars = createNurblings({
  shells: { mist: '#e4ebf2', sand: '#f1e4cf' },
  accents: { ink: '#2c5fd9', coral: '#c94f38', forest: '#2e7d4f' },
})
```

```tsx
// server components (Next.js default): wrap once
import { Nurbling, type NurblingProps } from '@nurblings/react'
import { avatars } from './avatars'

export const Avatar = (props: NurblingProps) => <Nurbling nurblings={avatars} {...props} />
```

```tsx
// client components: a provider
'use client'
import { Nurbling, NurblingsProvider } from '@nurblings/react/client'
import { avatars } from './avatars'

export function Team() {
  return (
    <NurblingsProvider value={avatars}>
      <Nurbling seed="ada@example.com" />
    </NurblingsProvider>
  )
}
```

Server components cannot read React context, which is why the provider lives
in the client entry.

See the [root README](https://github.com/albertesparragoza/nurblings#readme)
for the full `nurblings` API and the ideas behind it.
