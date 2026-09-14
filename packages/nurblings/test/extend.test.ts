// Extensions combine: presets stack, slots chain, added parts sit in paint
// order and can be slotted like built-in ones, and every part reads the same
// anchors, colours and references.

import { describe, expect, it } from 'vitest'
import { compose, type SlotContext } from '../src/extend'
import { SILHOUETTES as SILHOUETTES_FOR_TEST } from '../src/gen1'
import {
  createNurblings,
  type NurblingsConfig,
  nurbling,
  renderTraits,
  traits,
} from '../src/nurbling'
import { n } from '../src/svg'
import { lagoon } from '../src/themes'

const SEEDS = Array.from({ length: 60 }, (_, i) => `user-${i}`)
const still = { defaults: { animate: false } } satisfies NurblingsConfig

/** The context a part sees, for one call. */
function contextOf(seed: string, config: NurblingsConfig = {}, opts = {}): SlotContext {
  let seen: SlotContext | undefined
  createNurblings({
    ...config,
    parts: {
      probe: {
        draw: (ctx) => {
          seen = ctx
          return ''
        },
      },
    },
  }).nurbling(seed, opts)
  return seen as SlotContext
}

describe('a config that changes no part', () => {
  it('draws exactly what nurbling() does, with presets and props too', () => {
    const nb = createNurblings({ use: [{}, { props: { a: 1 } }], props: { b: 2 } })
    for (const seed of SEEDS) expect(nb.nurbling(seed)).toBe(nurbling(seed))
  })
})

describe('anchors', () => {
  it('are where the built-in eyes, brow and mouth are drawn', () => {
    for (const seed of SEEDS) {
      const ctx = contextOf(seed, still, { mouth: 'line' })
      const svg = nurbling(seed, { animate: false, mouth: 'line' })
      for (const eye of ctx.anchors.eyes) {
        expect(svg).toContain(
          `<ellipse cx="${n(eye.x)}" cy="${n(eye.y)}" rx="${n(eye.rx)}" ry="${n(eye.ry)}"`,
        )
      }
      expect(svg).toContain(` ${n(ctx.anchors.centre)} ${n(ctx.anchors.brow)})"/>`)
      expect(svg).toMatch(new RegExp(`<path d="M[\\d.]+,${n(ctx.anchors.mouth)}L`))
    }
  })

  it('put the crown on top, the chest below the eyes and bands inside the body', () => {
    for (const seed of SEEDS) {
      const { anchors: a, geometry: g } = contextOf(seed)
      expect(a.crown.y).toBeCloseTo(g.top, 5)
      expect(a.chest.y).toBeGreaterThan(a.mouth)
      expect(a.chest.y).toBeLessThan(a.base)
      const mid = a.band(0.5)
      expect(mid.left).toBeLessThan(a.centre)
      expect(mid.right).toBeGreaterThan(a.centre)
      expect(mid.y).toBeCloseTo(a.base - g.height / 2, 5)
    }
  })
})

describe('added parts', () => {
  const mark = (name: string) => ({ draw: () => `<circle class="${name}"/>` })

  it('paint after the part they name, in the order they are given', () => {
    const svg = createNurblings({
      ...still,
      parts: {
        a: { ...mark('a'), after: 'eyes' },
        b: { ...mark('b'), after: 'a' },
        c: { ...mark('c'), after: 'eyes' },
        top: mark('top'),
      },
    }).nurbling('ada', { mouth: 'line' })
    const at = (s: string) => svg.indexOf(s)
    expect(at('<ellipse')).toBeLessThan(at('class="a"'))
    expect(at('class="a"')).toBeLessThan(at('class="c"'))
    expect(at('class="a"')).toBeLessThan(at('class="b"'))
    expect(at('class="b"')).toBeLessThan(at('stroke-linecap="round" transform'))
    // no position: on top, after the mouth
    expect(at('class="top"')).toBeGreaterThan(at('<path d="M'))
    expect(svg.lastIndexOf('<circle class="top"/>')).toBe(
      svg.length - '<circle class="top"/></svg>'.length,
    )
  })

  it('stay still behind the figure when painted after the backdrop', () => {
    const svg = createNurblings({
      parts: { halo: { ...mark('halo'), after: 'backdrop' } },
    }).nurbling('ada', { background: 'circle' })
    expect(svg.indexOf('class="halo"')).toBeLessThan(svg.indexOf('<g class="nb-f">'))
  })

  it('step aside at 32 px unless they ask to stay', () => {
    const nb = createNurblings({ parts: { a: mark('a'), b: { ...mark('b'), small: true } } })
    const svg = nb.nurbling('ada', { size: 32 })
    expect(svg).not.toContain('class="a"')
    expect(svg).toContain('class="b"')
  })

  it('are refused at setup when misplaced, named like a built-in part, or slotted by a typo', () => {
    expect(() => createNurblings({ parts: { a: { ...mark('a'), after: 'nose' } } })).toThrow(/nose/)
    expect(() => createNurblings({ parts: { eyes: mark('x') } })).toThrow(/built-in/)
    expect(() => createNurblings({ slots: { eyse: false } })).toThrow(/eyse/)
    // a part may name one added later in the config
    expect(() =>
      createNurblings({ parts: { b: { ...mark('b'), after: 'a' }, a: mark('a') } }),
    ).not.toThrow()
  })
})

describe('presets combine', () => {
  const glasses = {
    slots: { eyes: (_ctx, base) => `${base()}<g class="glasses"/>` },
  } satisfies NurblingsConfig
  const tinted = {
    slots: { eyes: (_ctx, base) => `<g class="tint">${base()}</g>` },
  } satisfies NurblingsConfig
  const badge = {
    parts: { badge: { after: 'extra', draw: () => '<circle class="badge"/>' } },
  } satisfies NurblingsConfig
  const bigBadge = {
    slots: { badge: (_ctx, base) => `<g class="big">${base()}</g>` },
  } satisfies NurblingsConfig

  it('each later slot wraps what the earlier ones drew, on built-in and added parts', () => {
    const svg = createNurblings({ ...still, use: [glasses, badge, bigBadge, tinted] }).nurbling(
      'ada',
    )
    expect(svg).toMatch(/<g class="tint"><ellipse[\s\S]*<g class="glasses"\/><\/g>/)
    expect(svg).toContain('<g class="big"><circle class="badge"/></g>')
  })

  it('in any order, with the same result for the same order', () => {
    const one = createNurblings({ use: [glasses, tinted] }).nurbling('ada')
    const two = createNurblings(compose(glasses, tinted)).nurbling('ada')
    expect(one).toBe(two)
    expect(createNurblings({ use: [tinted, glasses] }).nurbling('ada')).not.toBe(one)
  })

  it('let a later preset bring back a part an earlier one dropped', () => {
    const svg = createNurblings({
      use: [{ slots: { mouth: false } }],
      slots: { mouth: (_ctx, base) => `${base()}<circle class="new-mouth"/>` },
    }).nurbling('ada', { mouth: 'smile' })
    expect(svg).toContain('<circle class="new-mouth"/>')
    expect(svg).not.toContain('fill="none" stroke-width')
  })

  it('merge colours, designs, parts, props and defaults by name; the last theme wins', () => {
    const c = compose(
      { theme: lagoon, props: { a: 1, b: 1 }, defaults: { size: 40 }, shells: { x: '#eeeeee' } },
      { props: { b: 2 }, defaults: { background: 'circle' }, shells: { y: '#dddddd' } },
    )
    expect(c.theme).toBe(lagoon)
    expect(c.props).toEqual({ a: 1, b: 2 })
    expect(c.defaults).toEqual({ size: 40, background: 'circle' })
    expect(Object.keys(c.shells ?? {})).toEqual(['x', 'y'])
  })
})

describe('what every part reads', () => {
  it('colours as drawn, for the mode', () => {
    const t = traits('ada')
    expect(contextOf('ada').colours.ground).toBe(t.palette.background)
    const dark = contextOf('ada', {}, { mode: 'dark' })
    expect(dark.colours.ground).toBe(t.palette.backgroundDark)
    expect(dark.colours.shell).toBe(t.palette.shell)
  })

  it('paint that switches with the page in auto mode, adding CSS only when needed', () => {
    const nb = createNurblings({
      parts: {
        dot: { draw: (ctx) => `<circle${ctx.paint('mark')}/><rect${ctx.paint('ground')}/>` },
      },
    })
    const light = nb.nurbling('ada')
    expect(light).not.toContain('nb-cf')
    const auto = nb.nurbling('ada', { mode: 'auto' })
    expect(auto).toContain('<circle class="nb-cf" fill=')
    expect(auto).toContain('<rect class="nb-g" fill=')
    expect(auto).toContain('.nb-auto .nb-cf{fill:var(--nb-c)}')
    const plain = createNurblings({
      parts: { dot: { draw: (ctx) => `<rect${ctx.paint('ground')}/>` } },
    })
    expect(plain.nurbling('ada', { mode: 'auto' })).not.toContain('.nb-cf')
  })

  it('a random stream per name, fixed per avatar', () => {
    const roll = (seed: string, name: string) => contextOf(seed).random(name).next()
    expect(roll('ada', 'spots')).toBe(roll('ada', 'spots'))
    expect(roll('ada', 'spots')).not.toBe(roll('ada', 'stars'))
    expect(roll('ada', 'spots')).not.toBe(roll('grace', 'spots'))
  })

  it('the theme, the options and props, the call winning, never the title', () => {
    const ctx = contextOf(
      'ada',
      { theme: lagoon, props: { status: 'away', team: 'core' } },
      {
        size: 64,
        title: 'Ada Secret',
        props: { status: 'online' },
      },
    )
    expect(ctx.theme).toBe(lagoon)
    expect(ctx.options.size).toBe(64)
    expect(ctx.props).toEqual({ status: 'online', team: 'core' })
    expect(JSON.stringify(ctx.options)).not.toMatch(/secret/i)
  })

  it('props reach the SVG only through a part, escaped with esc', () => {
    const hostile = '"><script>alert(1)</script>'
    expect(createNurblings({}).nurbling('ada', { props: { name: hostile } })).not.toContain(
      'script',
    )
    const svg = createNurblings({
      parts: { label: { draw: (ctx) => `<text>${ctx.esc(String(ctx.props.name))}</text>` } },
    }).nurbling('ada', { props: { name: hostile } })
    expect(svg).not.toContain('<script>')
    expect(svg).toContain('&lt;script&gt;')
  })
})

describe('collections: eyes, mouths and extras', () => {
  const MANY = Array.from({ length: 300 }, (_, i) => `user-${i}`)
  const winter = {
    extras: {
      beanie: { draw: () => '<circle class="beanie"/>' },
      bowtie: { weight: 2, draw: () => '<circle class="bowtie"/>' },
    },
  } satisfies NurblingsConfig

  it('changes nothing when a list is given but nothing in it changes', () => {
    const nb = createNurblings({ extras: {}, mouths: {}, silhouettes: {} })
    for (const seed of SEEDS) expect(nb.nurbling(seed)).toBe(nurbling(seed))
  })

  it('adds new choices to the built-in ones, and the seed picks among them all', () => {
    const nb = createNurblings({ ...still, use: [winter] })
    const worn = new Set(MANY.map((seed) => nb.traits(seed).extra))
    for (const name of ['none', 'scarf', 'hat', 'collar', 'beanie', 'bowtie']) {
      expect(worn).toContain(name)
    }
    const seed = MANY.find((s) => nb.traits(s).extra === 'bowtie') as string
    expect(nb.nurbling(seed)).toContain('<circle class="bowtie"/>')
    // every other trait is drawn exactly as before
    const { extra: _a, ...rest } = nb.traits(seed)
    const { extra: _b, ...plain } = traits(seed)
    expect(rest).toEqual(plain)
  })

  it('drops originals with false, and pins any name the instance has', () => {
    const nb = createNurblings({
      use: [winter],
      extras: { hat: false, scarf: false, collar: false },
    })
    for (const seed of MANY) expect(['none', 'beanie', 'bowtie']).toContain(nb.traits(seed).extra)
    expect(nb.traits('ada', { extra: 'beanie' }).extra).toBe('beanie')
    // @ts-expect-error hat was dropped, so it is no longer a valid name
    expect(() => nb.traits('ada', { extra: 'hat' })).toThrow(RangeError)
  })

  it('reweighs a built-in choice, or gives it a new look', () => {
    const bare = createNurblings({ extras: { none: { weight: 0 } } })
    for (const seed of MANY) expect(bare.traits(seed).extra).not.toBe('none')
    const hats = createNurblings({ extras: { hat: { draw: () => '<circle class="my-hat"/>' } } })
    expect(hats.nurbling('ada', { extra: 'hat' })).toContain('<circle class="my-hat"/>')
    expect(hats.nurbling('ada', { extra: 'scarf' })).not.toContain('my-hat')
  })

  it('adds eye shapes and mouths, drawn on the same anchors', () => {
    const nb = createNurblings({
      eyes: {
        star: {
          weight: 20,
          draw: ({ anchors, n }) =>
            anchors.eyes
              .map((e) => `<circle class="star" cx="${n(e.x)}" cy="${n(e.y)}"/>`)
              .join(''),
        },
      },
      mouths: { grin: { weight: 50, draw: () => '<circle class="grin"/>' } },
    })
    const seed = MANY.find((s) => nb.traits(s).eyes.shape === 'star') as string
    const svg = nb.nurbling(seed, { animate: false })
    expect(svg.match(/class="star"/g)).toHaveLength(2)
    expect(svg).not.toContain('<ellipse')
    expect(MANY.filter((s) => nb.traits(s).mouth === 'grin').length).toBeGreaterThan(200)
  })

  it('keeps new mouths and extras off small avatars, but never the eyes', () => {
    const nb = createNurblings({
      use: [winter],
      eyes: { dot: { weight: 1000, draw: () => '<circle class="dot"/>' } },
    })
    const svg = nb.nurbling('ada', { extra: 'bowtie', size: 32 })
    expect(svg).not.toContain('bowtie')
    expect(svg).toContain('class="dot"')
  })

  it('refuses a new name without a draw, or a list left with nothing to pick', () => {
    expect(() => createNurblings({ extras: { beanie: {} } })).toThrow(/beanie/)
    expect(() => createNurblings({ mouths: { none: false, line: false, smile: false } })).toThrow(
      /weight/,
    )
  })

  it('combine across presets: one adds, a later one drops or brings back', () => {
    const nb = createNurblings({ use: [winter, { extras: { beanie: false } }] })
    const worn = new Set(MANY.map((seed) => nb.traits(seed).extra))
    expect(worn).not.toContain('beanie')
    expect(worn).toContain('bowtie')
    const back = createNurblings(compose({ extras: { hat: false } }, { extras: { hat: {} } }))
    expect(back.traits('ada', { extra: 'hat' }).extra).toBe('hat')
  })

  it('adds, replaces and drops body designs the same way', () => {
    const { classic } = SILHOUETTES_FOR_TEST
    const nb = createNurblings({
      silhouettes: { pear: false, robot: { ...classic, plates: 'side' } },
    })
    const shapes = new Set(MANY.map((seed) => nb.traits(seed).silhouette.plates))
    expect(shapes).toContain('side')
    // @ts-expect-error pear was dropped
    expect(() => nb.traits('ada', { silhouette: 'pear' })).toThrow(RangeError)
    expect(nb.traits('ada', { silhouette: 'tall' }).silhouette.hw).toBeGreaterThan(1)
  })
})

describe('renderTraits', () => {
  it('takes slots too, and draws what nurbling() does without them', () => {
    const t = traits('ada')
    expect(renderTraits(t)).toBe(nurbling('ada'))
    expect(renderTraits(t, {}, { mouth: false })).not.toBe(renderTraits(t, {}))
  })
})
