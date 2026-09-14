import { describe, expect, it } from 'vitest'
import { nurbi } from '../src/nurbi'

describe('flagship', () => {
  it('renders the stored drawing in ivory and hot pink', () => {
    const out = nurbi({ size: 64 })
    expect(out).toContain('#efe9df')
    expect(out).toContain('#ff2f6e')
    expect(out).toContain('aria-label="Nurbi"')
    expect(out).not.toMatch(/<!--/)
  })

  it('prints the size with two decimals and rejects invalid sizes', () => {
    expect(nurbi({ size: 64.126 })).toContain('width="64.13" height="64.13"')
    for (const size of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => nurbi({ size })).toThrow(RangeError)
    }
  })

  it('hides a decorative Nurbi from assistive technology, still or moving', () => {
    for (const animate of [false, true]) {
      const out = nurbi({ decorative: true, animate })
      expect(out).toContain('aria-hidden="true"')
      expect(out).not.toMatch(/role=|aria-label|<title>/)
    }
  })

  it('uses no ids, so it can share a page with other avatars', () => {
    const out = nurbi()
    expect(out).not.toMatch(/\sid=/)
    expect(out).not.toContain('url(#')
  })

  it('breathes and sways like the family, and stays still when asked', () => {
    const live = nurbi()
    expect(live).toContain('class="nb nb-mb nb-mk nb-ma nb-mh"')
    expect(live.match(/class="nb-a[lr]"/g)).toHaveLength(2)
    expect(live).toContain('<g class="nb-f">')
    const still = nurbi({ animate: false })
    expect(still).not.toMatch(/<style>|nb-f|nb-a[lr]/)
    expect(nurbi({ size: 32 })).toBe(nurbi({ size: 32, animate: false }))
  })
})
