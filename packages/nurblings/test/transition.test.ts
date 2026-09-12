// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { morph, transitionName } from '../src/transition'

type Rect = [left: number, top: number, width: number, height: number]

/** A tagged avatar with a fixed on-screen box and a recorded `animate`. */
function avatar(key: string, box: Rect) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  el.setAttribute('data-nurbling-transition', key)
  place(el, box)
  el.animate = vi.fn(() => ({ finished: Promise.resolve() })) as unknown as typeof el.animate
  document.body.append(el)
  return el
}

function place(el: Element, [left, top, width, height]: Rect) {
  const rect = {
    left,
    top,
    width,
    height,
    x: left,
    y: top,
    right: left + width,
    bottom: top + height,
  }
  el.getBoundingClientRect = () => rect as DOMRect
  el.getClientRects = () => (width ? [rect] : []) as unknown as DOMRectList
}

const firstFrame = (el: Element) =>
  (vi.mocked((el as SVGElement).animate).mock.calls[0]?.[0] as Keyframe[] | undefined)?.[0]
    ?.transform

afterEach(() => {
  document.body.innerHTML = ''
  delete (document as { startViewTransition?: unknown }).startViewTransition
  vi.restoreAllMocks()
})

describe('morph', () => {
  it('flies a Nurbling from the dialog it leaves to the place it lands', async () => {
    const dialog = avatar('ada', [100, 100, 320, 320])
    const inList = avatar('ada', [10, 500, 48, 48])
    await morph(() => dialog.remove())
    expect(firstFrame(inList)).toMatch(/^translate\(90px,-400px\) scale\(6\.66\d*,6\.66\d*\)$/)
    expect(firstFrame(dialog)).toBeUndefined()
  })

  it('animates a Nurbling that only moved', async () => {
    const el = avatar('ada', [0, 0, 64, 64])
    await morph(() => place(el, [200, 0, 64, 64]))
    expect(firstFrame(el)).toBe('translate(-200px,0px) scale(1,1)')
  })

  it('leaves untouched avatars and unrelated keys alone', async () => {
    const still = avatar('grace', [0, 0, 64, 64])
    const gone = avatar('ada', [0, 100, 64, 64])
    await morph(() => gone.remove())
    expect(firstFrame(still)).toBeUndefined()
  })

  it('only applies the change under reduced motion', async () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList)
    const dialog = avatar('ada', [100, 100, 320, 320])
    const inList = avatar('ada', [10, 500, 48, 48])
    const update = vi.fn(() => dialog.remove())
    await morph(update)
    expect(update).toHaveBeenCalledOnce()
    expect(firstFrame(inList)).toBeUndefined()
  })

  it('uses native view transitions when each key is on screen once, then clears the names', async () => {
    const hero = avatar('ada@example.com', [0, 0, 320, 320])
    let header: SVGSVGElement | undefined
    const seen: string[] = []
    const vtName = (el?: Element) =>
      (el as SVGElement | undefined)?.style.getPropertyValue('view-transition-name') ?? ''
    ;(document as { startViewTransition?: unknown }).startViewTransition = vi.fn(
      (cb: () => Promise<void>) => {
        seen.push(vtName(hero))
        const done = cb().then(() => {
          seen.push(vtName(hero), vtName(header))
        })
        return { ready: done, finished: done }
      },
    )
    const ours = {
      effect: {
        pseudoElement: '::view-transition-group(nb-ada_example_com)',
        updateTiming: vi.fn(),
      },
    }
    const root = { effect: { pseudoElement: '::view-transition-old(root)', updateTiming: vi.fn() } }
    ;(document as { getAnimations?: unknown }).getAnimations = () => [ours, root]
    await morph(
      () => {
        hero.remove()
        header = avatar('ada@example.com', [20, 10, 32, 32])
      },
      { duration: 600 },
    )
    expect(seen).toEqual(['nb-ada_example_com', '', 'nb-ada_example_com'])
    expect(vtName(header)).toBe('')
    expect(firstFrame(header as SVGSVGElement)).toBeUndefined()
    expect(ours.effect.updateTiming).toHaveBeenCalledWith(
      expect.objectContaining({ duration: 600 }),
    )
    expect(root.effect.updateTiming).not.toHaveBeenCalled()
    delete (document as { getAnimations?: unknown }).getAnimations
  })

  it('falls back to FLIP when the same key is on screen twice', async () => {
    const start = vi.fn()
    ;(document as { startViewTransition?: unknown }).startViewTransition = start
    const dialog = avatar('ada', [100, 100, 320, 320])
    const inList = avatar('ada', [10, 500, 48, 48])
    await morph(() => dialog.remove())
    expect(start).not.toHaveBeenCalled()
    expect(firstFrame(inList)).toBeDefined()
  })

  it('opens a dialog from the avatar that stays in the list', async () => {
    avatar('ada', [10, 500, 48, 48])
    let opened: SVGSVGElement | undefined
    await morph(() => {
      opened = avatar('ada', [100, 100, 240, 240])
    })
    expect(firstFrame(opened as SVGSVGElement)).toMatch(
      /^translate\(-90px,400px\) scale\(0\.2,0\.2\)$/,
    )
  })
})

describe('transitionName', () => {
  it('turns any key into a valid, prefixed name', () => {
    expect(transitionName('ada@example.com')).toBe('nb-ada_example_com')
    expect(transitionName('user-42')).toBe('nb-user-42')
  })
})
