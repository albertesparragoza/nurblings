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

  it('uses no ids, so it can share a page with other avatars', () => {
    const out = renderFlagship()
    expect(out).not.toMatch(/\sid=/)
    expect(out).not.toContain('url(#')
  })
})
