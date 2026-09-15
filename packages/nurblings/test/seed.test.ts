import { describe, expect, it } from 'vitest'
import { hash128, normaliseSeed, stream } from '../src/seed'

describe('normaliseSeed', () => {
  it.each([
    ['Ada Lovelace', 'adalovelace'],
    ['ada.lovelace', 'adalovelace'],
    ['ada_lovelace', 'adalovelace'],
    ['  ADA-LOVELACE  ', 'adalovelace'],
    ['ada@example.com', 'adaexamplecom'],
    ['Adá Lövelace', 'adalovelace'],
    ['ＡＤＡ－ＬＯＶＥＬＡＣＥ', 'adalovelace'],
    ['user１２３', 'user123'],
    ['İstanbul', 'istanbul'],
    ['a​da', 'ada'],
    ['Ñandú', 'nandu'],
  ])('%j normalises to %j', (input, expected) => {
    expect(normaliseSeed(input)).toBe(expected)
  })

  it('keeps emoji so an emoji seed is not empty', () => {
    expect(normaliseSeed('🐙')).toBe('🐙')
    expect(normaliseSeed('🐙')).not.toBe(normaliseSeed('🦑'))
  })

  it('falls back to the NFKC form when only separators remain', () => {
    expect(normaliseSeed('...')).toBe('...')
    expect(normaliseSeed('')).toBe('')
  })

  it('is idempotent', () => {
    for (const s of ['Ada Lovelace', 'ＡＤＡ', 'Ñandú', '🐙 octo']) {
      expect(normaliseSeed(normaliseSeed(s))).toBe(normaliseSeed(s))
    }
  })
})

describe('hash128', () => {
  it('returns four unsigned 32-bit words', () => {
    for (const w of hash128('nurbling')) {
      expect(Number.isInteger(w)).toBe(true)
      expect(w).toBeGreaterThanOrEqual(0)
      expect(w).toBeLessThan(2 ** 32)
    }
  })

  it('is stable across releases', () => {
    // Pinned values. If this fails, every avatar in every generation changed.
    expect(hash128('')).toEqual(HASH_EMPTY)
    expect(hash128('adalovelace')).toEqual(HASH_ADA)
  })

  it('separates near seeds', () => {
    expect(hash128('ada')).not.toEqual(hash128('adb'))
  })
})

describe('stream', () => {
  it('is deterministic per seed and group', () => {
    const a = stream('ada', 'body')
    const b = stream('ada', 'body')
    for (let i = 0; i < 100; i++) expect(a.next()).toBe(b.next())
  })

  it('gives each group its own sequence', () => {
    expect(stream('ada', 'body').next()).not.toBe(stream('ada', 'eyes').next())
  })

  it('is stable across releases', () => {
    const s = stream('adalovelace', 'body')
    expect([s.next(), s.next(), s.next()]).toEqual(STREAM_ADA_BODY)
  })

  it('stays in range', () => {
    const s = stream('range', 'test')
    for (let i = 0; i < 10_000; i++) {
      const f = s.next()
      expect(f).toBeGreaterThanOrEqual(0)
      expect(f).toBeLessThan(1)
      const n = s.int(7)
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThan(7)
      const r = s.range(-2, 3)
      expect(r).toBeGreaterThanOrEqual(-2)
      expect(r).toBeLessThan(3)
    }
  })

  it('picks every element of a list with roughly equal frequency', () => {
    const s = stream('pick', 'test')
    const counts = [0, 0, 0, 0]
    for (let i = 0; i < 40_000; i++) {
      const k = s.pick([0, 1, 2, 3])
      counts[k] = (counts[k] ?? 0) + 1
    }
    for (const c of counts) expect(c).toBeGreaterThan(9_400)
  })

  it('honours weights', () => {
    const s = stream('weights', 'test')
    let heavy = 0
    for (let i = 0; i < 10_000; i++)
      if (
        s.weighted([
          ['a', 9],
          ['b', 1],
        ] as const) === 'a'
      )
        heavy++
    expect(heavy).toBeGreaterThan(8_700)
    expect(heavy).toBeLessThan(9_300)
  })
})

// Recorded from the first implementation. Never edit these to make a test pass.
const HASH_EMPTY = [41608494, 3485963809, 1435736333, 1262568316]
const HASH_ADA = [708807980, 222365621, 2340841899, 2870679779]
const STREAM_ADA_BODY = [0.09767906437627971, 0.7129510901868343, 0.4712531992699951]
