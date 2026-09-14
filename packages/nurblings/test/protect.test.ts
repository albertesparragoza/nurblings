import { describe, expect, it } from 'vitest'
import { isFlagshipSeed, renderFlagship } from '../src/protect'

describe('flagship', () => {
  it.each(['nurbi', 'NURBI', 'Nurbi', 'n.u.r.b.i', ' Nurbi '])('%j resolves to Nurbi', (seed) => {
    expect(isFlagshipSeed(seed)).toBe(true)
  })

  it.each(['nurbling', 'nurbi2', 'nurb', 'nurbis'])('%j does not', (seed) => {
    expect(isFlagshipSeed(seed)).toBe(false)
  })

  it('renders the stored drawing in ivory and hot pink', () => {
    const out = renderFlagship({ size: 64 })
    expect(out).toContain('#efe9df')
    expect(out).toContain('#ff2f6e')
    expect(out).toContain('aria-label="Nurbi"')
    expect(out).not.toMatch(/<!--/)
  })

  it('prints the size with two decimals and rejects invalid sizes', () => {
    expect(renderFlagship({ size: 64.126 })).toContain('width="64.13" height="64.13"')
    for (const size of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => renderFlagship({ size })).toThrow(RangeError)
    }
  })

  it('uses no ids, so it can share a page with other avatars', () => {
    const out = renderFlagship()
    expect(out).not.toMatch(/\sid=/)
    expect(out).not.toContain('url(#')
  })

  it('breathes and sways like the family, and stays still when asked', () => {
    const live = renderFlagship()
    expect(live).toContain('class="nb nb-mb nb-mk nb-ma nb-mh"')
    expect(live.match(/class="nb-a[lr]"/g)).toHaveLength(2)
    expect(live).toContain('<g class="nb-f">')
    const still = renderFlagship({ animate: false })
    expect(still).not.toMatch(/<style>|nb-f|nb-a[lr]/)
    expect(renderFlagship({ size: 32 })).toBe(renderFlagship({ size: 32, animate: false }))
  })
})
