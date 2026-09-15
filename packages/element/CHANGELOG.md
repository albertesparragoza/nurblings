# @nurblings/element

## 1.0.0

### Major Changes

- First stable release. Any string in, a small curious creature out: deterministic SVG avatars that stay the same for every seed within a generation.
  
  - **Core (`nurblings`).** `nurbling(seed, options)` returns one SVG with no ids, `nurblingSrc()` the same as a data URI, `traits()` the traits a seed resolves to, and `renderTraits()` draws traits you stored, checking every value first. Options pin any trait (`mood`, `mouth`, `extra`, `silhouette`, `shell`, `gen`) and set `size`, `background`, `frame`, `mode`, `title`, `decorative` and `transition`. At 32 px and below the face keeps only what still reads.
  - **Alive by default.** Every Nurbling breathes, blinks and sways its antennae with CSS alone. `animate` picks layers or turns motion off, and nothing moves under reduced motion.
  - **Themes and page modes (`nurblings/themes`).** Ten named themes, `palette()` for 2 to 5 brand colours with contrast repaired, `mode: 'auto'` for light and dark pages with CSS only, and colour helpers for your own parts.
  - **Transitions (`nurblings/transition`).** `morph()` glides an avatar between the places it appears, such as a list and a dialog.
  - **Your own family (`createNurblings`).** Brand colours, body designs, eyes, mouths and extras, drawn parts through `slots` and `parts`, and presets combined with `use` or `compose()`.
  - **Nurbi (`nurblings/nurbi`).** `nurbi()` returns the family's flagship as the stored drawing.
  - **Components.** `@nurblings/react` is a Server Component with no client JavaScript, `@nurblings/vue` renders on the server for Vue 3 and Nuxt, `@nurblings/astro` ships static SVG with no client JavaScript, and `@nurblings/element` is `<nurbling-avatar>` for any HTML. Each takes an app-wide `createNurblings` instance.
  - **Small.** About 7.3 KB compressed for a plain avatar, with no runtime dependencies.

### Patch Changes

- Updated dependencies
  - nurblings@1.0.0
