# @nurblings/vue

A Vue 3 component for [nurblings](https://github.com/albertesparragoza/nurblings):
deterministic avatars, any string in, a small curious creature out. Renders
with a plain `h()` call, no SFC and no Vue compiler in the build, so it works
in Nuxt (including server components) without extra configuration.

## Install

```sh
npm install @nurblings/vue
```

## Usage

```vue
<script setup>
import { Nurbling } from '@nurblings/vue'
</script>

<template>
  <Nurbling seed="ada@example.com" :size="48" mood="curious" class="avatar" />
</template>
```

The component has no reactive state, no lifecycle hooks and no event
listeners: it renders identical markup on the server and the client, so it is
safe to use in a Nuxt page, layout or server component.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `seed` | `string` (required) | Any string. The same seed always renders the same Nurbling. |
| `size` | `number` | Rendered width and height in pixels, default 128. 32 or below drops the mouth and extras. |
| `background` | `'none' \| 'circle' \| 'squircle' \| 'square'` | Background shape behind the creature. |
| `title` | `string` | Accessible name, default `"Nurbling"`. |
| `animate` | `boolean \| Motion` | Ambient life, on by default (breath, blink, antenna drift, hover wiggle). `:animate="false"` for a still avatar, or an object such as `{ blink: false, speed: 0.5 }`. |
| `frame` | `'auto' \| 'full' \| 'portrait'` | Portrait crops closer on the face for small round avatars; full shows the whole figure. Auto (the default) picks portrait at 48 px and below. |
| `gen` | `1` | Trait generation. Pin it so an avatar never changes under a future release. |
| `mood` | `'neutral' \| 'curious' \| 'pleased' \| 'thinking' \| 'sleepy'` | Lock the mood instead of deriving it from the seed. |
| `mouth` | `'none' \| 'dot' \| 'line' \| 'smile'` | Lock the mouth. |
| `extra` | `'none' \| 'scarf' \| 'pin' \| 'hat' \| 'collar'` | Lock the extra. |
| `silhouette` | `'classic' \| 'basketball' \| 'squat' \| 'firm' \| 'round' \| 'bell' \| 'wide' \| 'smooth' \| 'pear' \| 'tall'` | Lock the body design; each seed still varies it slightly. |
| `shell` | `'mint' \| 'sky' \| 'butter' \| 'peach' \| 'lilac' \| 'sage' \| 'cloud' \| 'blush' \| 'lemon'` | Lock the shell colour. |
| `class` / `style` | | Forwarded to the wrapper `<span>`. |

## App-wide configuration

Make an instance with `createNurblings` (your palette, designs, drawn parts,
defaults) and install it once; a `nurblings` prop overrides it per component.

```ts
// avatars.ts
import { createNurblings } from 'nurblings'

export const avatars = createNurblings({
  shells: { mist: '#e4ebf2', sand: '#f1e4cf' },
  accents: { ink: '#2c5fd9', coral: '#c94f38', forest: '#2e7d4f' },
})
```

```ts
// main.ts
import { NurblingsPlugin } from '@nurblings/vue'
import { createApp } from 'vue'
import App from './App.vue'
import { avatars } from './avatars'

createApp(App).use(NurblingsPlugin(avatars)).mount('#app')
```

In Nuxt, do the same from a plugin file with `nuxtApp.vueApp.use(...)`.

See the [root documentation](https://github.com/albertesparragoza/nurblings#readme)
for the full trait model and the `nurbling`, `traits` and `toDataUri` core
functions.
