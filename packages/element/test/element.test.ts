import { createNurblings, nurbling } from 'nurblings'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { parseAnimate } from '../src/animate'
import { define, NurblingElement } from '../src/index'

beforeAll(() => define())
afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

function avatar(attrs: Record<string, string>) {
  const el = document.createElement('nurbling-avatar')
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value)
  document.body.append(el)
  return el
}

/** Core output as the DOM serialises it, so the comparison is markup for markup. */
function parsed(svg: string) {
  const box = document.createElement('div')
  box.innerHTML = svg
  return box.innerHTML
}

describe('<nurbling-avatar>', () => {
  it('renders exactly what the core renders', () => {
    const el = avatar({ seed: 'ada', size: '64', mood: 'curious', background: 'circle' })
    expect(el).toBeInstanceOf(NurblingElement)
    expect(el.innerHTML).toBe(
      parsed(nurbling('ada', { size: 64, mood: 'curious', background: 'circle' })),
    )
  })

  it('takes decorative as a boolean attribute', () => {
    expect(avatar({ seed: 'ada', decorative: '' }).innerHTML).toBe(
      parsed(nurbling('ada', { decorative: true })),
    )
    expect(avatar({ seed: 'ada', decorative: 'false' }).innerHTML).toBe(parsed(nurbling('ada')))
  })

  it('re-renders when an attribute changes', () => {
    const el = avatar({ seed: 'ada' })
    el.setAttribute('seed', 'grace')
    expect(el.innerHTML).toBe(parsed(nurbling('grace')))
    el.setAttribute('size', '48')
    expect(el.innerHTML).toBe(parsed(nurbling('grace', { size: 48 })))
  })

  it('does not rewrite the DOM when an attribute is set to what it already was', () => {
    const el = avatar({ seed: 'ada', size: '48' })
    const svg = el.querySelector('svg')
    // a framework re-render sets every attribute again, usually unchanged
    el.setAttribute('seed', 'ada')
    el.setAttribute('size', '48')
    // the same node, so the CSS animations were never restarted
    expect(el.querySelector('svg')).toBe(svg)
    el.setAttribute('seed', 'grace')
    expect(el.querySelector('svg')).not.toBe(svg)
  })

  it('renders nothing until it has a seed', () => {
    const el = avatar({ size: '48' })
    expect(el.innerHTML).toBe('')
    el.setAttribute('seed', 'ada')
    expect(el.innerHTML).toContain('<svg')
    el.removeAttribute('seed')
    expect(el.innerHTML).toBe('')
  })

  it('reads animate as off, or as the layers to keep', () => {
    expect(parseAnimate(null)).toBeUndefined()
    expect(parseAnimate('')).toBeUndefined()
    expect(parseAnimate('false')).toBe(false)
    expect(parseAnimate('blink, hover')).toEqual({
      breath: false,
      blink: true,
      antennae: false,
      hover: true,
    })
    expect(avatar({ seed: 'ada', animate: 'false' }).innerHTML).toBe(
      parsed(nurbling('ada', { animate: false })),
    )
  })

  it('carries the transition key for morph', () => {
    const el = avatar({ seed: 'ada', transition: 'user-1' })
    expect(el.querySelector('svg')?.getAttribute('data-nurbling-transition')).toBe('user-1')
  })

  it('renders with a configured instance', () => {
    const avatars = createNurblings({
      shells: { mist: '#e4ebf2', sand: '#f1e4cf' },
      accents: { ink: '#2c5fd9', coral: '#c94f38', forest: '#2e7d4f' },
    })
    const el = avatar({ seed: 'ada' })
    el.nurblings = avatars
    expect(el.innerHTML).toBe(parsed(avatars.nurbling('ada')))
    el.nurblings = undefined
    expect(el.innerHTML).toBe(parsed(nurbling('ada')))
  })

  it('sits inline-block with no baseline gap when nothing styles it', () => {
    // browsers compute an unstyled custom element as inline; happy-dom does not
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      display: 'inline',
    } as CSSStyleDeclaration)
    const el = avatar({ seed: 'ada' })
    expect(el.style.display).toBe('inline-block')
    expect(el.style.lineHeight).toBe('0')
  })

  it('leaves the display alone when a stylesheet sets one', () => {
    const style = document.createElement('style')
    style.textContent = 'nurbling-avatar.card { display: block }'
    document.head.append(style)
    const el = avatar({ seed: 'ada', class: 'card' })
    expect(el.style.display).toBe('')
    expect(getComputedStyle(el).display).toBe('block')
    style.remove()
  })

  it('reflects properties to attributes, for frameworks that bind properties', () => {
    const el = avatar({ seed: 'ada' })
    el.seed = 'grace'
    expect(el.getAttribute('seed')).toBe('grace')
    expect(el.innerHTML).toBe(parsed(nurbling('grace')))
    el.size = '48'
    expect(el.innerHTML).toBe(parsed(nurbling('grace', { size: 48 })))
    el.mood = 'sleepy'
    el.mood = null
    expect(el.hasAttribute('mood')).toBe(false)
    expect(typeof el.animate).toBe('function')
  })

  it('keeps properties set before the element was defined', () => {
    const el = document.createElement('late-avatar') as HTMLElement & Record<string, unknown>
    el.seed = 'ada'
    el.size = 48
    document.body.append(el)
    define('late-avatar')
    expect(el).toBeInstanceOf(NurblingElement)
    expect(el.getAttribute('seed')).toBe('ada')
    expect(el.innerHTML).toBe(parsed(nurbling('ada', { size: 48 })))
  })
})

describe('define', () => {
  it('registers under any tag, and is safe to call twice', () => {
    define('team-avatar')
    define('team-avatar')
    expect(document.createElement('team-avatar')).toBeInstanceOf(NurblingElement)
  })
})
