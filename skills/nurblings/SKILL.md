---
name: nurblings
description: >
  Add Nurblings avatars: deterministic SVG profile pictures where any string
  (a user id, username or email) always hatches the same small creature. Use
  when adding avatars, profile pictures, user icons, member lists, comment
  authors, placeholders or default images to a React, Next.js, Vue, Nuxt,
  Astro, Svelte, Angular or plain HTML/JavaScript app, when theming avatars
  with a built-in theme or a brand palette, supporting dark mode, animating
  them, or moving an avatar between a list and a dialog. Also use whenever the user mentions nurblings, Nurbi or
  @nurblings/* packages.
---

# Nurblings avatars

Any string in, a small creature out. The same seed always renders the same
SVG, so nothing is stored, uploaded or fetched. Full docs:
https://github.com/albertesparragoza/nurblings/tree/develop/docs

## Pick the package

| The project uses | Install | Render |
| --- | --- | --- |
| Next.js or React | `npm install @nurblings/react` | `<Nurbling seed={user.id} title={user.name} />` |
| Nuxt or Vue | `npm install @nurblings/vue` | `<Nurbling :seed="user.id" :title="user.name" />` |
| Astro | `npm install @nurblings/astro` | `<Nurbling seed={user.id} title={user.name} />` |
| Svelte, Angular, Solid, plain HTML, a CMS | `npm install @nurblings/element` | `import '@nurblings/element/define'`, then `<nurbling-avatar seed="…" title="…">` |
| No framework, or an `<img>` / email | `npm install nurblings` | `nurbling(seed, opts)` returns an SVG string; `nurblingSrc(seed, opts)` for an `<img src>` |

Use the project's package manager (check the lockfile). Imports:
`import { Nurbling } from '@nurblings/react'` (likewise `/vue`, `/astro`),
`import { nurbling, toDataUri, createNurblings } from 'nurblings'`.

## Always

- **Seed with a stable id** (`user.id`), not an email or display name: ids
  never change, and an email in markup leaks personal data.
- **Pass the person's name as `title`**: it becomes the accessible name
  (`role="img"`, `aria-label`, `<title>`). Use `title` for decorative
  duplicates too; never leave the default when a name is known.
- **Set `size`** in pixels to match the slot (40 in lists, 96+ on profiles).
  At 48 px and below the framing becomes a portrait automatically; at 32 px and
  below mouth, extras and motion drop out so the face still reads.
- **Use `background`** (`'circle' | 'squircle' | 'square'`) instead of wrapping
  the avatar in a clipped div; round containers clip the antennae for you.

## React specifics

`<Nurbling>` from `@nurblings/react` is a Server Component: no `'use client'`,
no hooks, zero client JavaScript. Do not wrap it in a client component just to
render it. For an app-wide palette in client components use
`NurblingsProvider` from `@nurblings/react/client`; in server components pass
`nurblings={avatars}` (wrap once in your own `Avatar` component).

## Motion

Avatars breathe, blink and sway by default, with CSS only, and stop
automatically under `prefers-reduced-motion` and at 32 px and below.

- A still avatar: `animate={false}` (Vue `:animate="false"`, element
  `animate="false"`).
- Pick layers: `animate={{ blink: false }}`, `{ breath: false, antennae: false }`
  for long lists, `{ speed: 0.5 }` for calmer motion.
- Hundreds of avatars on one page: use `animate={false}`; each animated avatar
  carries its own small style block.

## Move an avatar between places

Give the avatar the same `transition` key in both places (list and dialog,
card and header), then wrap the state change in `morph` from
`nurblings/transition`. The update must change the DOM before it resolves:

```tsx
import { morph } from 'nurblings/transition'
import { flushSync } from 'react-dom'

<Nurbling seed={user.id} title={user.name} transition={user.id} size={40} />
// in the dialog: same key, bigger size
<Nurbling seed={user.id} title={user.name} transition={user.id} size={240} />

morph(() => flushSync(() => setOpen(true)))
```

Vue: `morph(async () => { open.value = true; await nextTick() })`. It uses
View Transitions when available and a transform animation otherwise, and does
nothing under reduced motion.

## Colours and themes

Ten built-in themes, passed by name on every component:

```tsx
<Nurbling seed={user.id} title={user.name} theme="lagoon" />
```

`lagoon`, `punch`, `candy`, `picnic`, `sorbet` and `terracotta` put soft bodies
on strong containers; `marble`, `riso`, `lime` and `bauhaus` use vivid bodies
with one dark ink. Pick one that matches the product before writing colours.

For brand colours, turn 2 to 5 of them into a theme with `palette()`:

```ts
// avatars.ts
import { createNurblings } from 'nurblings'
import { palette } from 'nurblings/themes'

export const avatars = createNurblings({ theme: palette(['#264653', '#e9c46a', '#f4a261']) })
```

Pass it with `nurblings={avatars}`, `NurblingsProvider` (React client),
`app.use(NurblingsPlugin(avatars))` (Vue) or `el.nurblings = avatars`
(element). `palette()` repairs contrast itself. Hand-written `shells` and
`accents` still throw a `RangeError` naming a colour that fails contrast: fix
the named colour, or switch to `palette()`; never catch and ignore the error.

## Extending parts

Every drawn part is a named slot, and every extension is a config. To change a
part, add a slot (`(ctx, base) => string`, `false` drops it); to add one, add
a `parts` entry with `after` and `draw(ctx)`. Put separate features in separate
presets and stack them with `use: [a, b]`: later slots wrap earlier ones, so
they combine. Place markup on `ctx.anchors` (eyes, brow, mouth, chest, crown,
`band(f)`) and colour it with `ctx.paint(role)` or `ctx.colours`, never with
fixed coordinates or the raw palette, so it fits every body, theme and
`mode`. Per-call data goes in `props`; put any text from it through `ctx.esc`.
New eyes, mouths or extras (a season's accessories) go in `eyes`, `mouths` or
`extras`: each new name with a `draw(ctx)` joins the list the seed picks from,
and `false` drops a built-in one. Body designs in `silhouettes` work the same.

## Light and dark pages

On a dark page, pass `mode="dark"`. For a site with both, `mode="auto"` follows
the OS setting and any `data-theme="dark"` or `.dark` ancestor with CSS only,
so it stays server-rendered. The creature never changes between modes; the
container colour does, so pair `mode` with `background`.

## Avoid

- Randomising seeds (`Math.random()`): the point is that a person keeps their
  creature everywhere.
- Rendering the avatar in a client-only effect to "load" it: it is a pure
  function, render it during SSR.
- Adding `id` attributes inside custom slots: many avatars share a page.
- Pinning traits (`mood`, `silhouette`, `shell`) unless the user asked; the
  seed already decides them.
- Upgrading generations silently: pass `gen: 1` if avatars must never change.

## Check your work

- The avatar renders on the server (view source shows the `<svg>`).
- Every avatar has a meaningful `title`.
- A list with 50+ avatars uses a reduced motion setting or `animate={false}`.
- Tests: same seed and options always produce the same string, so snapshot
  tests are stable.
