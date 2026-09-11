import { describe, expect, it } from 'vitest'
import { body, cosDeg, n, render, sinDeg } from '../src/svg'
import type { Traits } from '../src/types'

const TRAITS: Traits = {
  gen: 1,
  silhouette: { hw: 0.96, widest: 0.38, crown: 0.4, base: 0.7 },
  antennae: { lean: [22, 30], length: [0.34, 0.46], bend: 0.3, tip: 0.08 },
  eyes: { shape: 'tall', size: 0.12, spacing: 0.38, depth: 0.54, catchlight: 'asymmetric' },
  brow: { shape: 'wave', tilt: 3 },
  mouth: 'smile',
  extra: 'scarf',
  mood: 'curious',
  palette: {
    shell: '#8fd3c1',
    accent: '#2d3a8c',
    eye: '#141414',
    catchlight: '#9a9a9a',
    wear: '#e07a5f',
    background: '#f4efe6',
  },
}

describe('n', () => {
  it('rounds to two decimals and never prints -0 or exponents', () => {
    expect(n(-0.001)).toBe('0')
    expect(n(12.5)).toBe('12.5')
    expect(n(1e-7)).toBe('0')
    expect(n(33.333333)).toBe('33.33')
  })
})

describe('trigonometry', () => {
  it('matches Math.sin and Math.cos far below the output rounding', () => {
    for (let d = 0; d <= 90; d += 0.5) {
      expect(Math.abs(sinDeg(d) - Math.sin((d * Math.PI) / 180))).toBeLessThan(1e-6)
      expect(Math.abs(cosDeg(d) - Math.cos((d * Math.PI) / 180))).toBeLessThan(1e-6)
    }
  })
})

describe('body', () => {
  it('is widest near the widest point and closed at crown and base', () => {
    const g = body(TRAITS.silhouette)
    const yw = 93 - TRAITS.silhouette.widest * g.height
    expect(g.halfWidthAt(yw)).toBeCloseTo(g.radius, 1)
    expect(g.halfWidthAt(g.top - 1)).toBe(0)
    expect(g.halfWidthAt(g.top + g.height / 2)).toBeLessThanOrEqual(g.radius + 1e-9)
  })
})

describe('render', () => {
  const svg = render(TRAITS, { size: 256 })

  it('is an accessible, sized svg', () => {
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true)
    expect(svg).toContain('role="img"')
    expect(svg).toContain('aria-label="Nurbling"')
    expect(svg).toContain('<title>Nurbling</title>')
    expect(svg).toContain('width="256" height="256"')
  })

  it('escapes the title', () => {
    const out = render(TRAITS, { title: '<Ada & "Bob">' })
    expect(out).toContain('&lt;Ada &amp; &quot;Bob&quot;&gt;')
    expect(out).not.toContain('<Ada')
  })

  it('uses no ids, so many avatars can share a page', () => {
    expect(svg).not.toMatch(/\sid=/)
    expect(svg).not.toContain('url(#')
  })

  it('prints no number with more than two decimals', () => {
    expect(svg).not.toMatch(/\d\.\d{3,}/)
    expect(svg).not.toMatch(/\de[+-]?\d/)
  })

  it('draws exactly two antennae with square tips', () => {
    expect(svg.match(/class="nb-a[lr]"/g)).toHaveLength(2)
    expect(svg.match(/<rect x=/g)?.length).toBeGreaterThanOrEqual(2)
  })

  it('drops mouth and extras at 32 px and below', () => {
    const plain = { ...TRAITS, mouth: 'none', extra: 'none' } as const
    expect(render(TRAITS, { size: 32 })).toBe(render(plain, { size: 32 }))
    expect(render(TRAITS, { size: 33 })).not.toBe(render(plain, { size: 33 }))
  })

  it('never tilts the brow more than 6 degrees', () => {
    for (const tilt of [-40, -6, 0, 6, 40]) {
      const out = render({ ...TRAITS, brow: { shape: 'level', tilt } })
      const rotations = [...out.matchAll(/stroke-linecap="round" transform="rotate\((-?[\d.]+)/g)]
      for (const [, deg] of rotations) expect(Math.abs(Number(deg))).toBeLessThanOrEqual(6)
    }
  })

  it('only moves when asked, and only without reduced motion', () => {
    expect(svg).not.toContain('<style>')
    const moving = render(TRAITS, { animate: true })
    expect(moving).toContain('@media (prefers-reduced-motion:no-preference)')
  })

  it('draws a backdrop only when asked', () => {
    expect(svg).not.toContain('#f4efe6')
    expect(render(TRAITS, { background: 'circle' })).toContain(
      '<circle cx="50" cy="50" r="50" fill="#f4efe6"/>',
    )
  })

  it('is deterministic', () => {
    expect(render(TRAITS, { size: 256 })).toBe(svg)
  })
})
