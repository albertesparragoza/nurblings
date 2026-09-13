import { describe, expect, it } from 'vitest'
import { contrast } from '../src/colour'
import { createNurblings, nurbling } from '../src/nurbling'
import { lagoon, palette, renderNurbling, THEMES, themed, themeOf } from '../src/themes'

const seeds = Array.from({ length: 120 }, (_, i) => `person-${i}`)

describe('built-in themes', () => {
  it.each(Object.values(THEMES))('$name keeps every face readable', (theme) => {
    const nb = createNurblings({ theme })
    for (const seed of seeds) {
      const { palette: p } = nb.traits(seed)
      expect(contrast(p.eye, p.shell)).toBeGreaterThanOrEqual(4.5)
      expect(contrast(p.accent, p.shell)).toBeGreaterThanOrEqual(3)
      expect(Object.values(theme.shells)).toContain(p.shell)
    }
  })

  it('resolves names, and refuses unknown ones', () => {
    expect(themeOf('lagoon')).toBe(lagoon)
    expect(() => themeOf('nope' as 'lagoon')).toThrow(RangeError)
    expect(themed('lagoon')).toBe(themed(lagoon))
  })

  it('renders the same by name or by object, and leaves the default family alone', () => {
    const byName = renderNurbling(undefined, 'ada', { size: 64 }, 'lagoon')
    expect(byName).toBe(themed(lagoon).nurbling('ada', { size: 64 }))
    expect(byName).not.toBe(nurbling('ada', { size: 64 }))
    expect(renderNurbling(undefined, 'ada', { size: 64 })).toBe(nurbling('ada', { size: 64 }))
  })

  it('lets one call on an instance switch theme and keep its body designs', () => {
    const nb = createNurblings({
      silhouettes: { only: { hw: 1, belly: 0.3, tip: 1, rows: 3, cols: 4 } },
    })
    const t = nb.traits('ada', { theme: lagoon })
    expect(Object.values(lagoon.shells)).toContain(t.palette.shell)
    expect(t.silhouette.rows).toBe(3)
  })
})

describe('palette()', () => {
  it('takes 2 to 5 hex colours', () => {
    expect(() => palette(['#ffffff'])).toThrow(RangeError)
    expect(() => palette(['#fff', '#000000'])).toThrow(RangeError)
    expect(() => palette(Array(6).fill('#123456'))).toThrow(RangeError)
  })

  it('makes a two-tone family from two colours', () => {
    const theme = palette(['#1d3557', '#f1faee'])
    const nb = createNurblings({ theme })
    for (const seed of seeds.slice(0, 20)) {
      const p = nb.traits(seed).palette
      expect(p.shell).toBe('#f1faee')
      expect(p.accent).toBe(p.wear)
    }
  })

  it('ignores input order', () => {
    const a = palette(['#264653', '#e9c46a', '#f4a261'])
    const b = palette(['#f4a261', '#264653', '#e9c46a'])
    expect(a).toEqual(b)
  })

  it('keeps any 2 to 5 colours readable', () => {
    let x = 7
    const hex = () => {
      x = (x * 48271) % 2147483647
      return `#${(x % 0xffffff).toString(16).padStart(6, '0')}`
    }
    for (let i = 0; i < 200; i++) {
      const nb = createNurblings({ theme: palette(Array.from({ length: 2 + (i % 4) }, hex)) })
      const p = nb.traits(`s${i}`).palette
      expect(contrast(p.eye, p.shell)).toBeGreaterThanOrEqual(4.5)
      expect(contrast(p.accent, p.shell)).toBeGreaterThanOrEqual(3)
    }
  })
})

describe('mode', () => {
  it('keeps the creature and changes its container on a dark page', () => {
    const light = nurbling('ada', { background: 'circle', animate: false })
    const dark = nurbling('ada', { background: 'circle', animate: false, mode: 'dark' })
    expect(dark).not.toBe(light)
    const body = (svg: string) => svg.match(/<path d="[^"]+" fill="#[0-9a-f]{6}"\/>/)?.[0]
    expect(body(dark)).toBe(body(light))
  })

  it('switches with CSS alone under auto, and stays id-free', () => {
    const svg = nurbling('ada', { background: 'circle', mode: 'auto' })
    expect(svg).toContain('nb-auto')
    expect(svg).toContain('--nb-g:')
    expect(svg).toContain('prefers-color-scheme:dark')
    expect(svg).not.toMatch(/\bid=/)
  })

  it('keeps dark-ink antennae readable on a dark container', () => {
    const nb = createNurblings({ theme: THEMES.lime })
    for (const seed of seeds.slice(0, 40)) {
      const svg = nb.nurbling(seed, { background: 'circle', mode: 'dark', animate: false })
      const ground = svg.match(/<circle[^>]*fill="(#[0-9a-f]{6})"/)?.[1] as string
      const stem = svg.match(/class="nb-a[lr]"[^>]*stroke="(#[0-9a-f]{6})"/)?.[1]
      if (stem) expect(contrast(stem, ground)).toBeGreaterThanOrEqual(2)
    }
  })

  it('refuses an unknown mode', () => {
    expect(() => nurbling('ada', { mode: 'dim' as 'dark' })).toThrow(RangeError)
  })
})
