import { describe, expect, it } from 'vitest'
import {
  body,
  bodySvg,
  cosDeg,
  n,
  PORTRAIT_UP_TO,
  profileAt,
  render,
  resolveFrame,
  shade,
  sinDeg,
} from '../src/svg'
import type { Silhouette, Traits } from '../src/types'

const SHELL = '#8fd3c1'

const SHAPE: Silhouette = {
  hw: 1.02,
  width: 1,
  belly: 0.31,
  tip: 1,
  rows: 3,
  cols: 4,
  grain: 7,
  plates: 'crown',
}

const TRAITS: Traits = {
  gen: 1,
  silhouette: SHAPE,
  antennae: { count: 2, lean: [22, 30], length: [0.34, 0.46], bend: 0.3, tip: 0.08 },
  eyes: { shape: 'tall', size: 0.12, spacing: 0.38, depth: 0.54, catchlight: 'asymmetric' },
  brow: { shape: 'wave', tilt: 3 },
  mouth: 'smile',
  extra: 'scarf',
  mood: 'curious',
  palette: {
    shell: SHELL,
    accent: '#2d3a8c',
    eye: '#141414',
    catchlight: '#9a9a9a',
    wear: '#e07a5f',
    background: '#f4efe6',
    backgroundDark: '#1d2b2a',
  },
}

/** The body outline path alone. */
const outline = (s: Silhouette) =>
  bodySvg(s, SHELL).match(new RegExp(`<path d="([^"]+)" fill="${SHELL}"/>`))?.[1] ?? ''

/** The plate paths alone (every path in a tone other than the shell). */
const platePaths = (svg: string) =>
  [...svg.matchAll(/<path d="([^"]+)" fill="(#[0-9a-f]{6})"\/>/g)]
    .filter(([, , fill]) => fill !== SHELL)
    .map(([, d]) => d as string)

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

describe('shade', () => {
  it('moves a colour toward black or white on integer channels', () => {
    expect(shade('#808080', 0)).toBe('#808080')
    expect(shade('#808080', -1)).toBe('#000000')
    expect(shade('#808080', 1)).toBe('#ffffff')
    expect(shade('#a8e0d1', -0.08)).toBe('#9bcec0')
  })

  it('clamps factors beyond one, so it always returns a valid colour', () => {
    expect(shade('#ffffff', -2)).toBe('#000000')
    expect(shade('#000000', 5)).toBe('#ffffff')
    for (const k of [-3, -1, -0.5, 0, 0.5, 1, 3]) expect(shade(SHELL, k)).toMatch(/^#[0-9a-f]{6}$/)
  })
})

describe('profile', () => {
  it("follows Nurbi's outline: soft point at the apex, broad belly, broad base", () => {
    const nurbi: Silhouette = { ...SHAPE, hw: 1.024, belly: 0.313, tip: 1 }
    expect(profileAt(nurbi, 0)).toBe(0)
    expect(profileAt(nurbi, 1)).toBe(0)
    expect(profileAt(nurbi, 0.313)).toBeCloseTo(1, 2)
    expect(profileAt(nurbi, 0.03)).toBeGreaterThan(0.5)
  })

  it('stays within the widest half-width for any belly or tip', () => {
    for (const tip of [0.5, 0.8, 1, 1.2, 2]) {
      for (const belly of [0.1, 0.2, 0.31, 0.45, 0.6]) {
        for (let f = 0; f <= 1; f += 0.02) {
          const h = profileAt({ ...SHAPE, tip, belly }, f)
          expect(h).toBeGreaterThanOrEqual(0)
          expect(h).toBeLessThanOrEqual(1)
        }
      }
    }
  })
})

describe('plate zones', () => {
  it('turns the crown outline into straight plate edges, one per band on each side', () => {
    for (const rows of [2, 3, 4]) {
      expect(outline({ ...SHAPE, rows }).match(/L/g)).toHaveLength(2 * rows)
    }
  })

  it("keeps Nurbi's smooth bottom line under base plates", () => {
    const shape: Silhouette = { ...SHAPE, plates: 'base' }
    expect(outline(shape)).not.toContain('L')
    expect(platePaths(bodySvg(shape, SHELL)).length).toBeGreaterThan(0)
  })

  it('plates one flank only on the side zone', () => {
    const g = body({ ...SHAPE, plates: 'side' })
    const straight = g.outline.filter((v) => v.straight)
    expect(straight.length).toBeGreaterThan(0)
    for (const v of straight) expect(v.p[0]).toBeGreaterThan(50)
  })

  it('draws a fully smooth body with no plates', () => {
    const svg = bodySvg({ ...SHAPE, plates: 'none' }, SHELL)
    expect(svg.match(/<path/g)).toHaveLength(1)
    expect(outline({ ...SHAPE, plates: 'none' })).not.toContain('L')
  })

  it('keeps crown plates above the face', () => {
    for (const hw of [0.8, 1.02, 1.6]) {
      const shape: Silhouette = { ...SHAPE, hw }
      const g = body(shape)
      const limit = 93 - 0.6 * g.height + 0.01
      for (const d of platePaths(bodySvg(shape, SHELL))) {
        for (const [, y] of d.matchAll(/,(-?[\d.]+)/g)) expect(Number(y)).toBeLessThanOrEqual(limit)
      }
    }
  })

  it('paints plates in flat tones only: no gradients, no seams', () => {
    const svg = render(TRAITS)
    expect(svg).not.toMatch(/gradient/i)
    expect(svg).not.toContain('stroke-linejoin')
  })

  it('merges plates into a few large ones at small sizes', () => {
    const quads = (size: number) =>
      platePaths(render(TRAITS, { size })).reduce((sum, d) => sum + (d.match(/Z/g)?.length ?? 0), 0)
    expect(quads(24)).toBeLessThan(quads(128))
  })

  it('varies the plate tones with the grain', () => {
    expect(bodySvg({ ...SHAPE, grain: 1 }, SHELL)).not.toBe(bodySvg({ ...SHAPE, grain: 2 }, SHELL))
  })
})

describe('antennae', () => {
  const groups = (count: 0 | 1 | 2) =>
    render({ ...TRAITS, antennae: { ...TRAITS.antennae, count } }).match(/class="nb-a[lr]"/g)
      ?.length ?? 0

  it('draws the classic pair, a single centre antenna, or none', () => {
    expect(groups(2)).toBe(2)
    expect(groups(1)).toBe(1)
    expect(groups(0)).toBe(0)
  })
})

describe('framing', () => {
  it('picks a portrait at small sizes and the full figure above', () => {
    expect(resolveFrame(undefined, PORTRAIT_UP_TO)).toBe('portrait')
    expect(resolveFrame('auto', PORTRAIT_UP_TO + 1)).toBe('full')
    expect(resolveFrame('full', 24)).toBe('full')
    expect(resolveFrame('portrait', 256)).toBe('portrait')
  })

  it('frames in a square view box, closer in for a portrait', () => {
    const box = (svg: string) =>
      svg
        .match(/viewBox="([^"]+)"/)?.[1]
        ?.split(' ')
        .map(Number) ?? []
    const full = box(render(TRAITS, { frame: 'full' }))
    const portrait = box(render(TRAITS, { frame: 'portrait' }))
    expect(full[2]).toBe(full[3])
    expect(portrait[2]).toBe(portrait[3])
    expect(portrait[2] as number).toBeLessThan(full[2] as number)
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

  it('hides a decorative avatar from assistive technology, with no name to read', () => {
    const out = render(TRAITS, { decorative: true, title: 'Ada' })
    expect(out).toContain('aria-hidden="true"')
    expect(out).not.toMatch(/role=|aria-label|<title>|Ada/)
  })

  it('uses no ids, so many avatars can share a page', () => {
    expect(svg).not.toMatch(/\sid=/)
    expect(svg).not.toContain('url(#')
  })

  it('prints no number with more than two decimals', () => {
    expect(svg).not.toMatch(/\d\.\d{3,}/)
    expect(svg).not.toMatch(/\de[+-]?\d/)
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

  it('moves by default, only without reduced motion, and can be turned off', () => {
    const style = svg.match(/<style>.*<\/style>/)?.[0] ?? ''
    expect(style).toMatch(/^<style>@media \(prefers-reduced-motion:no-preference\)\{.*\}<\/style>$/)
    expect(svg).toContain('class="nb nb-mb nb-mk nb-ma nb-mh"')
    expect(render(TRAITS, { size: 256, animate: true })).toBe(svg)
    const still = render(TRAITS, { size: 256, animate: false })
    expect(still).not.toMatch(/<style>|nb-f|nb-e|--nb-/)
  })

  it('scopes every rule to a layer class, so still avatars on the same page stay still', () => {
    const rules = (svg.match(/\{(.*)\}<\/style>/)?.[1] ?? '').split('}')
    for (const rule of rules.filter((r) => r.includes('animation:'))) {
      expect(rule).toMatch(/^\.nb-m[bkah]/)
    }
  })

  it('turns layers on and off one by one', () => {
    expect(render(TRAITS, { animate: { blink: false } })).toContain('class="nb nb-mb nb-ma nb-mh"')
    expect(render(TRAITS, { animate: { breath: false, hover: false } })).toContain(
      'class="nb nb-mk nb-ma"',
    )
    const none = { breath: false, blink: false, antennae: false, hover: false }
    expect(render(TRAITS, { animate: none })).toBe(render(TRAITS, { animate: false }))
  })

  it('stays still at 32 px and below', () => {
    expect(render(TRAITS, { size: 32 })).toBe(render(TRAITS, { size: 32, animate: false }))
    expect(render(TRAITS, { size: 33 })).toContain('<style>')
  })

  it('clips round containers, so antenna tips never poke out', () => {
    expect(render(TRAITS, { background: 'circle', animate: false })).toContain(
      'class="nb" style="clip-path:circle(50%)"',
    )
    expect(render(TRAITS, { background: 'squircle' })).toMatch(
      /style="--nb-b:[^"]*;clip-path:inset\(0 round 30%\)"/,
    )
    expect(render(TRAITS, { background: 'square' })).not.toContain('clip-path')
    expect(render(TRAITS)).not.toContain('clip-path')
  })

  it('times each seed its own way, slower when sleepy, scaled by speed', () => {
    const period = (out: string) => Number(out.match(/--nb-b:([\d.]+)s/)?.[1])
    const base = period(svg)
    expect(base).toBeGreaterThanOrEqual(3.2)
    expect(base).toBeLessThanOrEqual(4.4)
    const other = render({ ...TRAITS, silhouette: { ...TRAITS.silhouette, grain: 99 } })
    expect(period(other)).not.toBe(base)
    expect(period(render({ ...TRAITS, mood: 'sleepy' }, { size: 256 }))).toBeCloseTo(base * 1.4, 1)
    expect(period(render(TRAITS, { size: 256, animate: { speed: 2 } }))).toBeCloseTo(base / 2, 1)
    for (const speed of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => render(TRAITS, { animate: { speed } })).toThrow(RangeError)
    }
  })

  it('draws a backdrop only when asked', () => {
    expect(svg).not.toContain('#f4efe6')
    expect(render(TRAITS, { background: 'circle' })).toMatch(/<circle [^>]*fill="#f4efe6"\/>/)
  })

  it('is deterministic', () => {
    expect(render(TRAITS, { size: 256 })).toBe(svg)
  })

  it('prints the size like every other number and rejects invalid sizes', () => {
    expect(render(TRAITS, { size: 128.456789 })).toContain('width="128.46" height="128.46"')
    expect(render(TRAITS, { size: 1e21 })).not.toMatch(/\de[+-]?\d/)
    for (const size of [0, -10, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => render(TRAITS, { size })).toThrow(RangeError)
    }
  })
})
