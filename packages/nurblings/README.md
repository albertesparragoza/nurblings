# nurblings

Deterministic SVG avatars: any string in, a small curious creature out. The
same string always hatches the same Nurbling, so every user, team or
repository gets an avatar without storing anything.

This is the core: zero dependencies, under 9 KB compressed, and it runs
anywhere JavaScript does (browsers, Node, Deno, Bun, edge runtimes and build
steps). For a component, use the package for your framework instead; each one
renders through this one.

| Framework | Package |
| --- | --- |
| Next.js, React | [`@nurblings/react`](https://www.npmjs.com/package/@nurblings/react) |
| Nuxt, Vue | [`@nurblings/vue`](https://www.npmjs.com/package/@nurblings/vue) |
| Astro | [`@nurblings/astro`](https://www.npmjs.com/package/@nurblings/astro) |
| Any HTML, Svelte, Angular | [`@nurblings/element`](https://www.npmjs.com/package/@nurblings/element) |

## Install

```sh
npm install nurblings
```

## Usage

```ts
import { nurbling, nurblingSrc } from 'nurblings'

// an SVG string, with the person's name as its accessible name
element.innerHTML = nurbling(user.id, { size: 48, title: user.name })

// a data URI for an <img>, a CSS url() or an email
image.src = nurblingSrc(user.id, { size: 64, background: 'circle' })
```

Seed with a stable id rather than an email: ids never change, and an email in
markup leaks personal data. When the name is already written next to the
avatar, pass `decorative: true` so screen readers do not read it twice.

Every Nurbling breathes, blinks and sways its antennae with CSS alone, and
stops under `prefers-reduced-motion`. Pass `animate: false` for a still one.

## Entry points

| Import | What it has |
| --- | --- |
| `nurblings` | `nurbling`, `nurblingSrc`, `traits`, `renderTraits`, `createNurblings` and the types |
| `nurblings/themes` | Ten named themes, `palette()` for your brand colours, and colour helpers |
| `nurblings/transition` | `morph()`, which glides an avatar between the places it appears |

## Documentation

- [Getting started](https://github.com/albertesparragoza/nurblings/blob/develop/docs/getting-started.md)
- [Motion and transitions](https://github.com/albertesparragoza/nurblings/blob/develop/docs/motion.md)
- [Customising](https://github.com/albertesparragoza/nurblings/blob/develop/docs/customising.md): palettes, body designs and drawn parts
- [API reference](https://github.com/albertesparragoza/nurblings/blob/develop/docs/api.md)

## License

The code is MIT. Every avatar it generates is public domain under CC0. The
names Nurbi and Nurblings and Nurbi's artwork are reserved; see
[TRADEMARKS.md](https://github.com/albertesparragoza/nurblings/blob/develop/TRADEMARKS.md).
