# Nurblings

Any string in, a small curious creature out. The same string always hatches
the same Nurbling.

Every Nurbling is a relative of **Nurbi**, a pebble-shaped character whose two
antennae are bezier control handles: the tools that turn an intention into a
curve. Nurblings borrows the idea literally. Your handle becomes its handles.

> Status: design phase. Nothing is published yet.

## The idea

- **Deterministic.** A username, email or ID hashes to a fixed set of traits.
  No storage, no uploads, no randomness at render time.
- **A family, not a template.** Silhouette, antennae, eyes, brow, mouth, colour
  and extras vary; a few invariants keep every one recognisably a Nurbling at
  24 pixels.
- **Stable forever.** Traits ship in versioned generations, so an avatar that
  exists today never changes under someone.
- **One of a kind.** Only one seed hatches Nurbi. Every other seed is kept away
  from it.

## Planned API

```ts
import { nurbling } from 'nurblings'

nurbling('ada@example.com')            // SVG string
nurbling('ada@example.com', { size: 48, mood: 'curious' })
```

Framework components and an HTTP endpoint are planned after the core renderer.

## Credits

Inspired by [blobatar](https://github.com/Alain00/blobatar), which showed how
far a deterministic avatar can go.

## License

Code: [MIT](LICENSE). The names Nurbi, Nurblings and Tangent Node, and the
flagship artwork, are reserved: see [TRADEMARKS.md](TRADEMARKS.md).
