# @nurblings/element

A `<nurbling-avatar>` custom element for
[nurblings](https://github.com/albertesparragoza/nurblings): any string in, a
small curious creature out. Works anywhere HTML does: plain pages, a CMS,
Svelte, Solid, Angular, Lit, or a React or Vue app that prefers one element
everywhere.

## Install

```sh
npm install @nurblings/element
```

```ts
import '@nurblings/element/define' // registers <nurbling-avatar>
```

Or pick the tag yourself:

```ts
import { define } from '@nurblings/element'

define('team-avatar')
```

Without a bundler, load it from a CDN that resolves dependencies:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@nurblings/element/dist/define.js/+esm"></script>
```

## Usage

```html
<nurbling-avatar seed="ada@example.com" size="48" background="circle" title="Ada Lovelace"></nurbling-avatar>
```

Every attribute matches an option of the core `nurbling()` function: `seed`,
`size`, `background`, `title`, `frame`, `gen`, `mood`, `mouth`, `extra`,
`silhouette`, `shell` and `transition`. Changing an attribute re-renders.
Each also has a matching property (`el.seed = 'grace'`), for frameworks that
bind properties, except `title` and `animate`: those are built-in element
members, so use the attributes.

Motion is on by default. `animate="false"` draws a still avatar, and a list
keeps only some layers: `animate="blink hover"`.

## App-wide configuration

Set the `nurblings` property to a `createNurblings` instance:

```ts
import { createNurblings } from 'nurblings'

const avatars = createNurblings({
  shells: { mist: '#e4ebf2', sand: '#f1e4cf' },
  accents: { ink: '#2c5fd9', coral: '#c94f38', forest: '#2e7d4f' },
})

for (const el of document.querySelectorAll('nurbling-avatar')) el.nurblings = avatars
```

## Notes

- The avatar renders into the element's light DOM, so `morph` transitions
  from `nurblings/transition` and your page styles reach it.
- When nothing styles the element, it becomes inline-block with no line
  height, so the avatar has no baseline gap. Any `display` you set, in a
  stylesheet, a layer or a shadow root, is left alone.
- Importing it on the server is safe; `define()` does nothing there. The
  avatar renders when the browser upgrades the element. For server-rendered
  avatars, use the React, Vue or Astro component or the core `nurbling()`.
