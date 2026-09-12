// Shared-element transitions: a Nurbling moves between the places it appears
// (a dialog and a list, a hero and a header) instead of jumping. Native View
// Transitions when each key is on screen once; otherwise a FLIP animation,
// which also keeps the vector sharp while it scales. Nothing moves under
// reduced motion.

const ATTR = 'data-nurbling-transition'
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'

export interface MorphOptions {
  /** milliseconds; defaults to 450 */
  duration?: number
  /** any CSS easing; defaults to a soft ease-out */
  easing?: string
}

type Update = () => void | Promise<void>
type Tagged = HTMLElement | SVGElement
type ViewTransition = { ready: Promise<void>; finished: Promise<void> }
type ViewTransitionDocument = Document & {
  startViewTransition?: (update: Update) => ViewTransition
}

/** The `view-transition-name` a key uses: handy for cross-page transitions in your framework. */
export const transitionName = (key: string) => `nb-${key.replace(/[^\w-]/g, '_')}`

const keyOf = (el: Element) => el.getAttribute(ATTR) ?? ''
const visible = () =>
  [...document.querySelectorAll<Tagged>(`[${ATTR}]`)].filter((el) => el.getClientRects().length > 0)
const name = (els: Tagged[]) => {
  for (const el of els) el.style.setProperty('view-transition-name', transitionName(keyOf(el)))
}
const unname = (els: Tagged[]) => {
  for (const el of els) el.style.removeProperty('view-transition-name')
}
const uniqueKeys = (els: Tagged[]) => new Set(els.map(keyOf)).size === els.length

/**
 * Applies `update` (close a dialog, move an item, swap a layout) and moves
 * every tagged Nurbling from where it was to where it lands. Tag an avatar
 * with the `transition` option; the same key in two places links them.
 * `update` must change the DOM before it returns or its promise resolves.
 */
export async function morph(update: Update, options: MorphOptions = {}): Promise<void> {
  const { duration = 450, easing = EASE } = options
  if (typeof matchMedia !== 'function' || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    await update()
    return
  }
  const before = visible()
  const doc = document as ViewTransitionDocument
  if (doc.startViewTransition && uniqueKeys(before)) {
    name(before)
    const vt = doc.startViewTransition(async () => {
      await update()
      unname(before)
      const after = visible()
      // one element per key in the new state: prefer the one that just appeared
      const byKey = new Map<string, Tagged>()
      for (const el of after)
        if (!byKey.has(keyOf(el)) || !before.includes(el)) byKey.set(keyOf(el), el)
      name([...byKey.values()])
    })
    await vt.ready.then(
      () => {
        for (const a of document.getAnimations()) {
          const effect = a.effect as KeyframeEffect | null
          if (effect?.pseudoElement?.includes('(nb-')) effect.updateTiming({ duration, easing })
        }
      },
      () => {},
    )
    await vt.finished.finally(() => unname([...document.querySelectorAll<Tagged>(`[${ATTR}]`)]))
    return
  }
  const from = new Map(before.map((el) => [el, el.getBoundingClientRect()]))
  await update()
  const after = visible()
  const moves: Promise<unknown>[] = []
  for (const el of after) {
    const key = keyOf(el)
    // where it came from: a twin that just left, its own old box, or a twin
    // still on screen (a dialog opening over the list it came from)
    const twins = before.filter((b) => keyOf(b) === key)
    const source =
      twins.find((b) => !after.includes(b)) ??
      (from.has(el) ? el : undefined) ??
      twins.find((b) => b !== el)
    const a = source && from.get(source)
    const b = el.getBoundingClientRect()
    if (!a || !b.width || !b.height) continue
    const dx = a.left - b.left
    const dy = a.top - b.top
    const sx = a.width / b.width
    const sy = a.height / b.height
    if (!dx && !dy && sx === 1 && sy === 1) continue
    const start = `translate(${dx}px,${dy}px) scale(${sx},${sy})`
    moves.push(
      el.animate(
        [
          { transformOrigin: '0 0', transform: start },
          { transformOrigin: '0 0', transform: 'none' },
        ],
        { duration, easing },
      ).finished,
    )
  }
  await Promise.all(moves)
}
