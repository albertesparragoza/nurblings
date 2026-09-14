import { describe, expect, it } from 'vitest'
import { ACCENTS, RANGES, SHAPE_JITTER, SHELLS, SILHOUETTE_WEIGHTS, SILHOUETTES } from '../src/gen1'
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
// the seed sweeps are heavy; a busy CI runner needs more than the 5 s default
const SWEEP = { timeout: 30_000 }

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
  it('are the ten locked designs, each with its plates in one place', () => {
    expect(Object.keys(SILHOUETTES)).toHaveLength(10)
    for (const s of Object.values(SILHOUETTES)) {
      expect(['crown', 'side', 'base', 'none']).toContain(s.plates)
      expect(s.hw).toBeGreaterThanOrEqual(0.7)
      expect(s.hw).toBeLessThanOrEqual(1.7)
    }
  })

  it('weights every design, with crown plates for about half the family', () => {
    expect(new Set(SILHOUETTE_WEIGHTS.map(([name]) => name))).toEqual(
      new Set(Object.keys(SILHOUETTES)),
    )
    const total = SILHOUETTE_WEIGHTS.reduce((sum, [, w]) => sum + w, 0)
    const crown = SILHOUETTE_WEIGHTS.filter(([name]) => SILHOUETTES[name].plates === 'crown')
    expect(crown.reduce((sum, [, w]) => sum + w, 0) / total).toBeCloseTo(0.5, 5)
  })
})

describe('traits', () => {
  it('is deterministic and ignores case, accents and separators', () => {
    expect(traits('Ada Lovelace')).toEqual(traits('ada.lovelace'))
    expect(traits('Adá-Lövelace')).toEqual(traits('ADA_LOVELACE'))
    expect(nurbling('ada@example.com')).toBe(nurbling('ada@example.com'))
  })

  it('keeps every family invariant across 50,000 seeds', SWEEP, () => {
    let single = 0
    for (const seed of SEEDS) {
      const t = traits(seed)
      const [l0, l1] = t.antennae.length
      expect(Math.abs(l0 - l1)).toBeGreaterThanOrEqual(RANGES.lengthGap - 1e-9)
      for (const l of [l0, l1]) {
        expect(l).toBeGreaterThanOrEqual(RANGES.length[0])
        expect(l).toBeLessThanOrEqual(RANGES.length[1])
      }
      expect([1, 2]).toContain(t.antennae.count)
      if (t.antennae.count === 1) single++
      expect(Math.abs(t.brow.tilt)).toBeLessThanOrEqual(6)
      expect(t.eyes.depth).toBeGreaterThanOrEqual(RANGES.eyeDepth[0])
      expect(t.eyes.depth).toBeLessThanOrEqual(RANGES.eyeDepth[1])
      expect(t.eyes.spacing).toBeGreaterThanOrEqual(RANGES.eyeSpacing[0])
      expect(t.eyes.spacing).toBeLessThanOrEqual(RANGES.eyeSpacing[1])
      expect(t.palette.wear).not.toBe(t.palette.accent)
      expect(inProtectedRegion(t)).toBe(false)
    }
    // one antenna for about 1 in 8 seeds
    expect(single / SEEDS.length).toBeGreaterThan(0.1)
    expect(single / SEEDS.length).toBeLessThan(0.15)
  })

  it('reaches every plate placement, every shell and both extremes of shape', () => {
    const zones = new Set<string>()
    const shells = new Set<string>()
    let tallest = 0
    let widest = 0
    for (const seed of SEEDS.slice(0, 2_000)) {
      const t = traits(seed)
      zones.add(t.silhouette.plates ?? 'crown')
      shells.add(t.palette.shell)
      tallest = Math.max(tallest, t.silhouette.hw)
      widest = Math.max(widest, t.silhouette.width ?? 1)
    }
    expect(zones).toEqual(new Set(['crown', 'side', 'base', 'none']))
    expect(shells.size).toBe(Object.keys(SHELLS).length)
    expect(tallest).toBeGreaterThan(1.5)
    expect(widest).toBeGreaterThan(1.15)
  })

  it('varies each seed a little around its design and gives it its own plate pattern', () => {
    const t = traits('jitter-probe', { silhouette: 'basketball' })
    const preset = SILHOUETTES.basketball
    expect(Math.abs(t.silhouette.hw - preset.hw)).toBeLessThanOrEqual(SHAPE_JITTER.hw + 1e-9)
    expect(Math.abs((t.silhouette.width ?? 1) - preset.width)).toBeLessThanOrEqual(
      SHAPE_JITTER.width + 1e-9,
    )
    expect(t.silhouette.plates).toBe(preset.plates)
    expect(t.silhouette.grain).not.toBe(traits('another-probe').silhouette.grain)
  })

  it('pins a trait without shifting any other', () => {
    const free = traits('pinned-seed')
    const pinned = traits('pinned-seed', { mood: 'sleepy', shell: 'lemon', silhouette: 'bell' })
    expect(pinned.mood).toBe('sleepy')
    expect(pinned.silhouette.plates).toBe(SILHOUETTES.bell.plates)
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
    expect(() => traits('x', { mouth: 'fangs' as 'line' })).toThrow(RangeError)
    expect(() => traits('x', { extra: 'cape' as 'hat' })).toThrow(RangeError)
    expect(() => nurbling('x', { mood: 'angry' as 'sleepy' })).toThrow(RangeError)
  })

  it('returns copies, so mutating a result never changes later avatars', () => {
    const before = nurbling('mutation-probe')
    const t = traits('mutation-probe')
    t.silhouette.hw = 2
    t.silhouette.rows = 9
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

  it('keeps pinned pale shells out of the region for every seed', SWEEP, () => {
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
  it('returns the stored Nurbi for the reserved seed', () => {
    for (const seed of ['nurbi', 'Nurbi', 'NURBI']) {
      const svg = nurbling(seed)
      expect(svg).toContain('#efe9df')
      expect(svg).toContain('aria-label="Nurbi"')
    }
  })

  it('never produces the flagship colours for anyone else', SWEEP, () => {
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
