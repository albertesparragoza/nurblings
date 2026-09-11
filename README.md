# Nurblings

Any string in, a small curious creature out. The same string always hatches
the same Nurbling.

Every Nurbling is a relative of **Nurbi**, a pebble-shaped character whose two
antennae are bezier control handles: the tools that turn an intention into a
curve. Nurblings borrows the idea literally. Your handle becomes its handles.

> Status: pre-release. The API is settled; the first version is on its way to
> npm.

## Install

| You use | Install |
| --- | --- |
| Next.js or React | `pnpm add @nurblings/react` |
| Nuxt or Vue | `pnpm add @nurblings/vue` |
| Astro | `pnpm add @nurblings/astro` |
| Anything else | `pnpm add nurblings` |

## Use

```ts
import { nurbling } from 'nurblings'

nurbling('ada@example.com')                                  // SVG string
nurbling('ada@example.com', { size: 48, title: 'Ada Lovelace' })
```

```tsx
import { Nurbling } from '@nurblings/react'

<Nurbling seed={user.email} size={48} title={user.name} />
```

Vue, Nuxt, Astro and plain HTML are in the
[getting started guide](docs/getting-started.md). Every option is in the
[API reference](docs/api.md).

## What you get

- **Deterministic.** A username, email or ID hashes to a fixed set of traits.
  No storage, no uploads, no network, no randomness at render time.
- **Stable forever.** Traits ship in numbered generations. An avatar that
  exists today renders byte for byte the same in every future release.
- **A family, not a template.** Silhouette, antennae, eyes, brow, mouth,
  colour and extras vary, while a few rules keep every one recognisably a
  Nurbling, even at 24 pixels.
- **Server-first.** The React and Astro components render on the server and
  ship no JavaScript. Output is a plain SVG string with no ids, so any number
  of avatars can share a page.
- **Accessible.** Every avatar has an accessible name, colours are chosen for
  contrast on light and dark pages, and motion is opt-in and respects reduced
  motion.
- **Small.** The core has no dependencies and is about 7 KB brotli; each
  framework component adds well under 1 KB.

## Contributing

Issues and pull requests are welcome. Start with
[CONTRIBUTING.md](CONTRIBUTING.md); new traits begin as a trait proposal
issue.

## Credits

Inspired by [blobatar](https://github.com/Alain00/blobatar), which showed how
far a deterministic avatar can go.

## License

- Code: [MIT](LICENSE).
- Generated avatars: dedicated to the public domain under
  [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Use them
  anywhere, no attribution needed.
- The names Nurbi and Nurblings and the flagship artwork are reserved: see
  [TRADEMARKS.md](TRADEMARKS.md).
