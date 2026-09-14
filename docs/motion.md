# Motion and transitions

Every Nurbling breathes, blinks and sways its antennae. The motion is CSS
inside the SVG: no script and no ids, so it works in server components, in an
`<img>` and in a `data:` URI. Each seed gets its own timing, so a grid of
avatars never moves in unison.

## Turn motion off, or pick layers

```ts
nurbling(seed)                                            // every layer
nurbling(seed, { animate: false })                        // a still drawing
nurbling(seed, { animate: { blink: false } })             // everything but blinking
nurbling(seed, { animate: { hover: false, speed: 0.5 } }) // calmer, no hover
```

Framework components take the same value: `animate={false}` in React and
Astro, `:animate="false"` in Vue. On `<nurbling-avatar>`, `animate="false"`
draws a still avatar and a list keeps only some layers:
`animate="blink hover"`.

| Layer | What moves |
| --- | --- |
| `breath` | The body squashes and stretches slowly from its base. |
| `blink` | The eyes blink every few seconds. |
| `antennae` | Each antenna drifts on its own clock. |
| `hover` | The antennae wiggle faster while the pointer is over the avatar. |

`speed` multiplies every clock (2 is twice as fast) and must be a positive
number. Sleepy Nurblings move a little slower.

## When nothing moves

- When the viewer asks for reduced motion. Every rule sits inside
  `prefers-reduced-motion: no-preference`, so a paused avatar is simply its
  still drawing.
- At 32 px and below, where motion reads as noise.

For long lists, `animate: { breath: false, antennae: false }` keeps just the
blink and the hover.

Each animated avatar carries its own small style block, under 1 KB before
compression and the same text in every avatar, because styles cannot be
shared between SVGs without ids. For hundreds of avatars on one page,
`animate: false` is the lighter choice.

## Move an avatar between places: `morph(update, options?)`

A Nurbling can glide from a dialog into a list, or from a hero into a header,
instead of jumping. Give the avatar the same `transition` key in both places,
then make the change inside `morph`:

```ts
import { morph } from 'nurblings/transition'

// the same key in the list and in the dialog links the two
nurbling(user.id, { size: 48, transition: user.id })
nurbling(user.id, { size: 320, transition: user.id })

await morph(() => dialog.close())
```

`update` must change the page before it returns, or return a promise that
resolves once it has:

```tsx
// React
morph(() => flushSync(() => setOpen(false)))
```

```ts
// Vue
morph(async () => {
  open.value = false
  await nextTick()
})
```

`duration` (milliseconds, default 450) and `easing` (any CSS easing) tune the
move. Under reduced motion the change simply happens.

## How it works

- Browsers with View Transitions use them when each key is on screen once.
- Otherwise, and in every other browser, the avatar is animated from its old
  box to its new one with a transform, which keeps the vector sharp. A new
  avatar flies out of a twin that stays on screen, so a dialog opening over a
  list animates too.
- A name the page set itself on a tagged element is restored afterwards, and
  overlapping calls never undo each other.
- The helper is its own entry, under 1 KB: pages that never import it pay
  nothing.

## Across page navigations

For moves between pages, use your framework's view transitions and set
`view-transition-name` to `transitionName(key)`, also exported by
`nurblings/transition`, so the names match the ones `morph` uses.
