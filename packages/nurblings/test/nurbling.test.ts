import { describe, expect, it } from 'vitest'
import { ACCENTS, RANGES, SHELLS, SILHOUETTES } from '../src/gen1'
import { colourDistance, inProtectedRegion, nurbling, toDataUri, traits } from '../src/nurbling'

const lin = (c: number) => {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const lum = (hex: string) => {
  const v = Number.parseInt(hex.slice(1), 16)
  return 0.2126 * lin(v >> 16) + 0.7152 * lin((v >> 8) & 255) + 0.0722 * lin(v & 255)
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

const DARK = '#16161a'
const LIGHT = '#f7f5f2'
const SEEDS = Array.from({ length: 50_000 }, (_, i) => `seed-${i}@example.com`)

describe('colour rules', () => {
  it('every accent clears 2.5:1 on both the dark and the light ground', () => {
    for (const [name, hex] of Object.entries(ACCENTS)) {
      expect(contrast(hex, DARK), `${name} on dark`).toBeGreaterThanOrEqual(2.5)
      expect(contrast(hex, LIGHT), `${name} on light`).toBeGreaterThanOrEqual(2.5)
    }
  })

  it('every allowed accent clears 3:1 on its shell, and eyes clear 4.5:1', () => {
    for (const [name, entry] of Object.entries(SHELLS)) {
      expect(contrast('#141414', entry.shell), `eye on ${name}`).toBeGreaterThanOrEqual(4.5)
      for (const accent of entry.accents) {
        expect(
          contrast(ACCENTS[accent], entry.shell),
          `${accent} on ${name}`,
        ).toBeGreaterThanOrEqual(3)
      }
    }
  })

  it('keeps the rejected and flagship colours out of the pool', () => {
    const shells = Object.values(SHELLS).map((s) => s.shell)
    const accents = Object.values(ACCENTS)
    for (const banned of ['#efe9df', '#ead9bf']) expect(shells).not.toContain(banned)
    for (const banned of ['#ff2f6e', '#9a4a8c']) expect(accents).not.toContain(banned)
  })

  it('measures colour distance with integers', () => {
    expect(colourDistance('#000000', '#ffffff')).toBe(3 * 255 * 255)
    expect(colourDistance('#efe9df', '#efe9df')).toBe(0)
  })
})

describe('silhouettes', () => {
  it('give every crown a soft point and low-poly facets', () => {
    for (const s of Object.values(SILHOUETTES)) {
      expect(s.crown).toBeGreaterThanOrEqual(0.55)
      expect(s.facets).toBeGreaterThanOrEqual(2)
      expect(s.facets).toBeLessThanOrEqual(4)
    }
  })
})

describe('traits', () => {
  it('is deterministic and ignores case, accents and separators', () => {
    expect(traits('Ada Lovelace')).toEqual(traits('ada.lovelace'))
    expect(traits('Adá-Lövelace')).toEqual(traits('ADA_LOVELACE'))
    expect(nurbling('ada@example.com')).toBe(nurbling('ada@example.com'))
  })

  // the seed sweeps are heavy; a busy CI runner needs more than the 5 s default
  it('keeps every family invariant across 50,000 seeds', { timeout: 30_000 }, () => {
    for (const seed of SEEDS) {
      const t = traits(seed)
      const [l0, l1] = t.antennae.length
      expect(Math.abs(l0 - l1)).toBeGreaterThanOrEqual(RANGES.lengthGap - 1e-9)
      for (const l of [l0, l1]) {
        expect(l).toBeGreaterThanOrEqual(RANGES.length[0])
        expect(l).toBeLessThanOrEqual(RANGES.length[1])
      }
      expect(Math.abs(t.brow.tilt)).toBeLessThanOrEqual(6)
      expect(t.eyes.depth).toBeGreaterThanOrEqual(RANGES.eyeDepth[0])
      expect(t.eyes.depth).toBeLessThanOrEqual(RANGES.eyeDepth[1])
      expect(t.eyes.spacing).toBeGreaterThanOrEqual(RANGES.eyeSpacing[0])
      expect(t.eyes.spacing).toBeLessThanOrEqual(RANGES.eyeSpacing[1])
      expect(t.palette.wear).not.toBe(t.palette.accent)
      expect(inProtectedRegion(t)).toBe(false)
    }
  })

  it('reaches every silhouette and every shell', () => {
    const shapes = new Set<unknown>()
    const shells = new Set<string>()
    for (const seed of SEEDS.slice(0, 2_000)) {
      const t = traits(seed)
      shapes.add(JSON.stringify(t.silhouette))
      shells.add(t.palette.shell)
    }
    expect(shapes.size).toBe(Object.keys(SILHOUETTES).length)
    expect(shells.size).toBe(Object.keys(SHELLS).length)
  })

  it('pins a trait without shifting any other', () => {
    const free = traits('pinned-seed')
    const pinned = traits('pinned-seed', { mood: 'sleepy', shell: 'lemon', silhouette: 'bell' })
    expect(pinned.mood).toBe('sleepy')
    expect(pinned.silhouette).toEqual(SILHOUETTES.bell)
    expect(pinned.palette.shell).toBe(SHELLS.lemon.shell)
    expect(pinned.antennae).toEqual(free.antennae)
    expect(pinned.eyes).toEqual(free.eyes)
    expect(pinned.brow).toEqual(free.brow)
    expect(pinned.mouth).toBe(free.mouth)
  })

  it('rejects unknown generations and pinned values', () => {
    expect(() => traits('x', { gen: 2 as 1 })).toThrow(RangeError)
    expect(() => traits('x', { silhouette: 'blob' as 'bell' })).toThrow(RangeError)
    expect(() => traits('x', { shell: 'ivory' as 'mint' })).toThrow(RangeError)
    expect(() => traits('x', { mood: 'angry' as 'sleepy' })).toThrow(RangeError)
    expect(() => traits('x', { mouth: 'fangs' as 'dot' })).toThrow(RangeError)
    expect(() => traits('x', { extra: 'cape' as 'pin' })).toThrow(RangeError)
    expect(() => nurbling('x', { mood: 'angry' as 'sleepy' })).toThrow(RangeError)
  })

  it('returns copies, so mutating a result never changes later avatars', () => {
    const before = nurbling('mutation-probe')
    const t = traits('mutation-probe')
    t.silhouette.hw = 2
    t.silhouette.facets = 9
    expect(traits('mutation-probe').silhouette.hw).not.toBe(2)
    expect(nurbling('mutation-probe')).toBe(before)
  })
})

describe('protected region', () => {
  const base = traits('region-probe')
  const near = { ...base.palette, shell: '#ece6dc' }

  it('catches a near-ivory shell with a hot-pink accent', () => {
    expect(inProtectedRegion({ ...base, palette: { ...near, accent: '#f8346f' } })).toBe(true)
  })

  it("catches a near-ivory shell with Nurbi's quiet face", () => {
    const quiet = { ...base, mouth: 'none', brow: { shape: 'level', tilt: 0 } } as const
    expect(inProtectedRegion({ ...quiet, palette: near })).toBe(true)
  })

  it('has no generation 1 accent near the flagship accent, so only the quiet face can reach it', () => {
    for (const [name, hex] of Object.entries(ACCENTS)) {
      expect(colourDistance(hex, '#ff2f6e'), name).toBeGreaterThanOrEqual(80 * 80)
    }
  })

  it('keeps pinned pale shells out of the region for every seed', { timeout: 30_000 }, () => {
    for (const shell of ['cloud', 'blush'] as const) {
      for (const seed of SEEDS.slice(0, 5_000)) {
        expect(inProtectedRegion(traits(seed, { shell, mouth: 'none' }))).toBe(false)
      }
    }
  })

  it('lets a pale shell with a lively face through', () => {
    const lively = { ...base, mouth: 'smile', brow: { shape: 'wave', tilt: 3 } } as const
    expect(inProtectedRegion({ ...lively, palette: { ...near, accent: ACCENTS.teal } })).toBe(false)
  })
})

describe('nurbling', () => {
  it('returns the stored Nurbi for reserved seeds', () => {
    for (const seed of ['albertesparragoza', 'Nurbi', 'Albert Labs']) {
      const svg = nurbling(seed)
      expect(svg).toContain('#efe9df')
      expect(svg).toContain('aria-label="Nurbi"')
    }
  })

  it('never produces the flagship colours for anyone else', { timeout: 30_000 }, () => {
    for (const seed of SEEDS.slice(0, 5_000)) {
      const svg = nurbling(seed)
      expect(svg).not.toContain('#efe9df')
      expect(svg).not.toContain('#ff2f6e')
    }
  })

  it('encodes a data uri', () => {
    const uri = toDataUri(nurbling('ada'))
    expect(uri.startsWith('data:image/svg+xml,%3Csvg')).toBe(true)
    expect(decodeURIComponent(uri.slice('data:image/svg+xml,'.length))).toBe(nurbling('ada'))
  })
})
