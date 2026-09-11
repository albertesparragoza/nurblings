import { describe, expect, it } from 'vitest'
import { isFlagshipSeed, renderFlagship } from '../src/protect'

describe('flagship', () => {
  it.each([
    'albertesparragoza',
    'Albert Esparragoza',
    'albert.esparragoza',
    'NURBI',
    'Nurbi',
    'albert-labs',
    'Albert Labs',
  ])('%j resolves to Nurbi', (seed) => {
    expect(isFlagshipSeed(seed)).toBe(true)
  })

  it.each(['albert', 'esparragoza', 'nurbling', 'nurbi2', 'labs'])('%j does not', (seed) => {
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
})
