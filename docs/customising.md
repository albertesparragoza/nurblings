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
  `id` attributes, so many avatars can share a page.
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

Named theme presets are planned for the library. Until they ship, a theme is a
palette you hand to `createNurblings`. This is the Lagoon pop theme from the
website:

```ts
export const lagoon = createNurblings({
  shells: { cream: '#edecb3', sun: '#fad928', tang: '#ffd392', aqua: '#a2e6e1' },
  accents: { deep: '#00686c', ember: '#d1495b', ink: '#1f4e79' },
})
```

To paint the backdrop in a strong palette colour, as the website does, replace
the `backdrop` slot and swap its fill:

```ts
const colours = ['#00686c', '#32c2b9', '#fad928', '#ff9915']

createNurblings({
  // ...shells and accents as above
  slots: {
    backdrop: (ctx, base) =>
      base().replace(/fill="#[0-9a-f]{6}"/i, `fill="${colours[ctx.traits.silhouette.grain % colours.length]}"`),
  },
})
```
