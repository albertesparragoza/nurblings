---
title: Getting started
description: Install Nurblings and render your first avatar in Next.js, Nuxt, Astro or plain JavaScript.
---

Nurblings turns any string into a small, curious creature. The same string
always hatches the same Nurbling, so you can give every user, team or
repository an avatar without storing anything.

## Install

```sh
npm install @nurblings/react    # Next.js, React
npm install @nurblings/vue      # Nuxt, Vue
npm install @nurblings/astro    # Astro
npm install @nurblings/element  # any HTML, Svelte, Angular
npm install nurblings           # plain JavaScript
```

Using a coding agent? `npx skills add albertesparragoza/nurblings` teaches
Claude Code, Cursor, Codex and others how to use the library.

## What each package supports

Every package draws the same avatar from the same seed. They differ in where
the drawing happens and how you pass options.

| Feature | React | Vue | Astro | HTML element | JavaScript |
| --- | --- | --- | --- | --- | --- |
| Server-side rendering | Yes | Yes | Yes | No | Yes |
| Client JavaScript for a still avatar | None | Your Vue app | None | Element and core | Optional |
| Built-in themes | Prop | Prop | Prop | Attribute | `themed()` |
| Your own colours | Prop | Prop | Prop | Property | `createNurblings()` |
| Light, dark and auto mode | Yes | Yes | Yes | Yes | Yes |
| Motion | Yes | Yes | Yes | Yes | Yes |
| Motion speed | Yes | Yes | Yes | No | Yes |
| Stops for reduced motion | Yes | Yes | Yes | Yes | Yes |
| Glides between views | Yes | Yes | Yes | Yes | Yes |
| App-wide configuration | Prop or provider | Prop or plugin | Prop | Property | `createNurblings()` |
| Pinned traits | Yes | Yes | Yes | Yes | Yes |

- **Server-side rendering:** React renders as a Server Component, Vue renders
  on the server and hydrates with your app (Nuxt included), and Astro ships
  static SVG. The HTML element draws in the browser.
- **Themes:** `theme="lagoon"` on React, Vue, Astro and the element;
  `themed('lagoon').nurbling(seed)` in plain JavaScript.
- **Your own colours:** `theme={palette([...])}` (Vue: `:theme`), or
  `el.nurblings = themed(palette([...]))` on the element. `palette()` and
  `themed()` come from `nurblings/themes`.
- **App-wide configuration:** a `nurblings` prop everywhere, plus
  `NurblingsProvider` in React client components and `NurblingsPlugin` in Vue.
- **Glides between views:** `morph()` from `nurblings/transition` runs in the
  browser: call it from client code in React and from a `<script>` in Astro.
- **Motion on the element:** `animate="blink hover"` picks layers; speed has no
  attribute, so set it through the JavaScript API.

Auto mode and motion are CSS inside the SVG, so they work without JavaScript
wherever the SVG is rendered. For an `<img>` source, a CSS background or an
email, `nurblingSrc(seed)` from `nurblings` works alongside any package.

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

Every Nurbling breathes, blinks and sways its antennae, with CSS only. Pass
`animate: false` for a still avatar; [Motion and transitions](motion.md) has
the rest.

## Plain HTML, or an image URL

Use a data URI anywhere an image goes:

```ts
import { nurbling, nurblingSrc } from 'nurblings'

img.src = nurblingSrc('ada@example.com', { size: 64 })
```

## Next steps

- Tune the motion, or glide avatars between places: [Motion and transitions](motion.md)
- Your palette, designs and parts: [Customising](customising.md)
- Every option, and how pinning works: [API reference](api.md)
- Why an avatar never changes: [Generations and stability](api.md#generations-and-stability)
