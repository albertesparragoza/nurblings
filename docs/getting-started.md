---
title: Getting started
description: Install Nurblings and render your first avatar in Next.js, Nuxt, Astro or plain JavaScript.
---

Nurblings turns any string into a small, curious creature. The same string
always hatches the same Nurbling, so you can give every user, team or
repository an avatar without storing anything.

## Install

Pick the package for your framework. Each one pulls in the core for you.

| You use | Install |
| --- | --- |
| Next.js or React | `pnpm add @nurblings/react` |
| Nuxt or Vue | `pnpm add @nurblings/vue` |
| Astro | `pnpm add @nurblings/astro` |
| Anything else, or no framework | `pnpm add nurblings` |

npm, yarn and bun work the same way (`npm install @nurblings/react`, and so
on).

## Your first Nurbling

The core returns an SVG string:

```ts
import { nurbling } from 'nurblings'

const svg = nurbling('ada@example.com', { size: 64, title: 'Ada Lovelace' })
```

Use the person's name as `title`: it becomes the avatar's accessible name.

## Next.js

`<Nurbling>` is a React Server Component: it renders on the server and ships
no JavaScript to the browser.

```tsx
import { Nurbling } from '@nurblings/react'

export default function Profile({ user }: { user: { email: string; name: string } }) {
  return <Nurbling seed={user.email} size={48} title={user.name} />
}
```

It works the same in client components and in any other React app.

## Nuxt and Vue

```vue
<script setup lang="ts">
import { Nurbling } from '@nurblings/vue'

defineProps<{ email: string; name: string }>()
</script>

<template>
  <Nurbling :seed="email" :size="48" :title="name" />
</template>
```

Server rendering works out of the box in Nuxt.

## Astro

```astro
---
import { Nurbling } from '@nurblings/astro'
---

<Nurbling seed="ada@example.com" size={48} title="Ada Lovelace" />
```

The component renders static SVG and adds no client JavaScript.

## Any other framework: a custom element

`@nurblings/element` works in plain HTML, Svelte, Solid, Angular, Lit or a
CMS template:

```ts
import '@nurblings/element/define'
```

```html
<nurbling-avatar seed="ada@example.com" size="48" title="Ada Lovelace"></nurbling-avatar>
```

Attributes mirror the options; see the
[package README](https://github.com/albertesparragoza/nurblings/tree/develop/packages/element).

## Alive by default

Every Nurbling breathes, blinks and sways its antennae. It is CSS only, so
server components still ship no JavaScript, and it stops for reduced motion
and at 32 px and below. `animate: false` (or `:animate="false"`, or
`animate="false"` on the element) draws a still avatar;
[Motion and transitions](motion.md) covers the layers, speed, and moving
avatars between places.

## Plain HTML, or an image URL

Use a data URI anywhere an image goes:

```ts
import { nurbling, toDataUri } from 'nurblings'

img.src = toDataUri(nurbling('ada@example.com', { size: 64 }))
```

## Next steps

- Tune the motion, or glide avatars between places: [Motion and transitions](motion.md)
- Your palette, designs and parts: [Customising](customising.md)
- Every option, and how pinning works: [API reference](api.md)
- Why an avatar never changes: [Generations and stability](api.md#generations-and-stability)
