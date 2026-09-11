# @nurblings/vue

A Vue 3 component for [nurblings](https://github.com/albertesparragoza/nurblings):
deterministic avatars, any string in, a small curious creature out. Renders
with a plain `h()` call, no SFC and no Vue compiler in the build, so it works
in Nuxt (including server components) without extra configuration.

## Install

```sh
pnpm add @nurblings/vue vue
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
| `animate` | `boolean` | Sway the antennae on hover, only when reduced motion is not requested. |
| `gen` | `1` | Trait generation. Pin it so an avatar never changes under a future release. |
| `mood` | `'neutral' \| 'curious' \| 'pleased' \| 'thinking' \| 'sleepy'` | Lock the mood instead of deriving it from the seed. |
| `mouth` | `'none' \| 'dot' \| 'line' \| 'smile'` | Lock the mouth. |
| `extra` | `'none' \| 'scarf' \| 'pin' \| 'hat' \| 'collar'` | Lock the extra. |
| `silhouette` | `'pebble' \| 'drop' \| 'bean' \| 'bell' \| 'acorn' \| 'loaf'` | Lock the silhouette. |
| `shell` | `'mint' \| 'sky' \| 'butter' \| 'peach' \| 'lilac' \| 'sage' \| 'cloud' \| 'blush' \| 'lemon'` | Lock the shell colour. |
| `class` / `style` | | Forwarded to the wrapper `<span>`. |

See the [root documentation](https://github.com/albertesparragoza/nurblings#readme)
for the full trait model and the `nurbling`, `traits` and `toDataUri` core
functions.
