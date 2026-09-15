import { describe, expect, it } from 'vitest'
import { SILHOUETTES } from '../src/gen1'
import { contrast, createNurblings, nurbling, traits } from '../src/nurbling'

const SEEDS = Array.from({ length: 300 }, (_, i) => `user-${i}`)

const BRAND = {
  shells: { mist: '#e4ebf2', sand: '#f1e4cf', mint: '#d4efe4' },
  accents: { ink: '#2c5fd9', coral: '#c94f38', forest: '#2e7d4f', plum: '#8a3f99' },
} as const

describe('createNurblings', () => {
  it('matches the default renderer when nothing is overridden', () => {
    const nb = createNurblings({})
    for (const seed of SEEDS) {
      expect(nb.nurbling(seed)).toBe(nurbling(seed))
      expect(nb.traits(seed)).toEqual(traits(seed))
    }
  })

  it('uses only brand colours, and pairs only accents that read on each shell', () => {
    const nb = createNurblings(BRAND)
    const shells = Object.values(BRAND.shells) as string[]
    const accents = Object.values(BRAND.accents) as string[]
    for (const seed of SEEDS) {
      const { palette } = nb.traits(seed)
      expect(shells).toContain(palette.shell)
      expect(accents).toContain(palette.accent)
      expect(contrast(palette.accent, palette.shell)).toBeGreaterThanOrEqual(3)
    }
  })

  it('refuses a shell that cannot be paired, naming it', () => {
    expect(() => createNurblings({ ...BRAND, shells: { slate: '#555b66' } })).toThrow(/slate/)
    expect(() => createNurblings({ accents: { only: '#2c5fd9' } })).toThrow(RangeError)
    expect(() => createNurblings({ shells: { bad: '#12345' as '#' } })).toThrow(/hex/)
    // two names for one colour count once
    expect(() =>
      createNurblings({
        shells: { sand: '#f1e4cf' },
        accents: { ink: '#2c5fd9', ink2: '#2C5FD9' },
      }),
    ).toThrow(/sand/)
    const { classic } = SILHOUETTES
    expect(() => createNurblings({ silhouettes: { a: { ...classic, weight: -1 } } })).toThrow(
      /weight/,
    )
    const none = Object.fromEntries(Object.keys(SILHOUETTES).map((name) => [name, false] as const))
    expect(() => createNurblings({ silhouettes: none })).toThrow(/at least one/)
  })

  it('keeps slot context read-only in its types', () => {
    createNurblings({
      slots: {
        body: (ctx, base) => {
          // @ts-expect-error slots cannot repaint the shared traits
          ctx.traits.palette.shell = '#000000'
          return base()
        },
      },
    })
  })

  it('adds and drops designs, typed by name', () => {
    const nb = createNurblings({
      silhouettes: {
        pear: false,
        robot: { hw: 1.1, width: 0.9, belly: 0.3, tip: 0.9, rows: 4, cols: 2, plates: 'side' },
      },
    })
    expect(nb.traits('ada', { silhouette: 'robot' }).silhouette.plates).toBe('side')
    // @ts-expect-error pear was dropped, so it is no longer a valid name
    expect(() => nb.traits('ada', { silhouette: 'pear' })).toThrow(RangeError)
  })

  it('drops, replaces and wraps drawn parts', () => {
    const nb = createNurblings({
      slots: {
        mouth: false,
        extra: () => '<circle cx="50" cy="80" r="3" fill="#000000"/>',
        brow: (_ctx, base) => `<g class="brand-brow">${base()}</g>`,
      },
    })
    const svg = nb.nurbling('ada', { mouth: 'smile', size: 128 })
    expect(svg).not.toContain('stroke-linecap="round"/><path d="M')
    expect(svg).toContain('<circle cx="50" cy="80" r="3" fill="#000000"/>')
    expect(svg).toContain('<g class="brand-brow"><path')
    expect(nb.nurbling('ada', { mouth: 'smile' })).not.toBe(nurbling('ada', { mouth: 'smile' }))
  })

  it('applies defaults to every call, and calls can still override them', () => {
    const nb = createNurblings({ defaults: { size: 40, background: 'circle' } })
    expect(nb.nurbling('ada')).toContain('width="40"')
    expect(nb.nurbling('ada', { size: 64 })).toContain('width="64"')
  })

  it('treats the seed nurbi like any other seed', () => {
    expect(createNurblings({}).nurbling('nurbi')).toBe(nurbling('nurbi'))
  })
})
