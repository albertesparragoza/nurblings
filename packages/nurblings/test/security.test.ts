// Hostile input never becomes markup. Every public entry point that takes
// strings from outside is fed attack strings; the output may only contain the
// elements and attributes the renderer itself writes, or the call must throw.

import { describe, expect, it } from 'vitest'
import { createNurblings, nurbling, renderTraits, traits } from '../src/nurbling'
import { palette, renderNurbling, THEMES, themed, themeOf } from '../src/themes'
import { transitionName } from '../src/transition'
import type { Traits } from '../src/types'

const HOSTILE = [
  '"><script>alert(1)</script>',
  "'><img src=x onerror=alert(1)>",
  '</title><script>alert(1)</script>',
  '" onmouseover="alert(1)',
  'javascript:alert(1)',
  '<svg onload=alert(1)>',
  '"}</style><script>alert(1)</script>',
  '&lt;script&gt; &amp; "quotes" \'apostrophes\'',
  // bidi override, NUL, a non-character and an emoji, built from code points so the file stays text
  String.fromCodePoint(0x202e, 0x0000, 0xffff, 0x1f600),
]

// the stored drawing of Nurbi adds <line> with its x1, y1, x2 and y2
const TAGS = new Set(['svg', 'title', 'style', 'g', 'path', 'circle', 'rect', 'ellipse', 'line'])
const ATTRIBUTES = new Set([
  'xmlns',
  'viewBox',
  'width',
  'height',
  'role',
  'aria-label',
  'class',
  'style',
  'data-nurbling-transition',
  'd',
  'fill',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'transform',
  'x',
  'y',
  'rx',
  'ry',
  'cx',
  'cy',
  'r',
  'x1',
  'y1',
  'x2',
  'y2',
])

/** Throws unless every tag and attribute in the SVG is one the renderer writes. */
function assertClean(svg: string): void {
  // the text inside <style> is the fixed motion and dark-mode CSS
  for (const [, css] of svg.matchAll(/<style>([^<]*)<\/style>/g)) {
    expect(css).not.toMatch(/@import|url\(|expression\(/i)
  }
  for (const [, name, rest] of svg.matchAll(/<\/?([a-zA-Z][\w:-]*)([^>]*)>/g)) {
    expect(TAGS, `unexpected <${name}>`).toContain(name)
    const leftover = (rest ?? '').replace(
      /\s([\w:-]+)="([^"]*)"/g,
      (_, attr: string, value: string) => {
        expect(ATTRIBUTES, `unexpected ${attr}= on <${name}>`).toContain(attr)
        if (attr === 'style') expect(value).toMatch(/^[\w\s:;.%#(),-]*$/)
        return ''
      },
    )
    // nothing may remain but whitespace and the self-closing slash
    expect(leftover.trim(), `stray markup in <${name}>`).toMatch(/^\/?$/)
  }
}

describe('hostile input never becomes markup', () => {
  it.each(HOSTILE)('a title and transition key of %j stay inside their text and attribute', (s) => {
    assertClean(nurbling('ada', { title: s, transition: s }))
    assertClean(nurbling('ada', { title: s, transition: s, mode: 'auto', background: 'circle' }))
    assertClean(themed('lagoon').nurbling('ada', { title: s, transition: s }))
    assertClean(nurbling('nurbi', { title: s, transition: s }))
  })

  it.each(HOSTILE)('the seed %j only picks traits', (s) => {
    assertClean(nurbling(s))
  })

  it.each(HOSTILE)('an option value of %j is refused or ignored, never written', (s) => {
    for (const key of ['mood', 'mouth', 'extra', 'silhouette', 'shell', 'mode'] as const) {
      expect(() => nurbling('ada', { [key]: s } as never)).toThrow(RangeError)
    }
    // unknown containers and frames fall back to the defaults
    assertClean(nurbling('ada', { background: s as never, frame: s as never }))
    expect(() => nurbling('ada', { size: s as never })).toThrow(RangeError)
    expect(() => nurbling('ada', { animate: { speed: s as never } })).toThrow(RangeError)
  })
})

describe('renderTraits checks what it is handed', () => {
  const base = () => structuredClone(traits('ada')) as Traits

  it('draws genuine traits exactly as nurbling() does', () => {
    expect(renderTraits(traits('ada'), { size: 64 })).toBe(nurbling('ada', { size: 64 }))
  })

  it.each(HOSTILE)('refuses %j in any colour', (s) => {
    for (const key of [
      'shell',
      'accent',
      'eye',
      'catchlight',
      'wear',
      'background',
      'backgroundDark',
    ] as const) {
      const t = base()
      ;(t.palette as unknown as Record<string, string>)[key] = s
      expect(() => renderTraits(t)).toThrow(RangeError)
    }
  })

  it.each(HOSTILE)('refuses %j in any named trait', (s) => {
    const edits: ((t: Traits) => void)[] = [
      (t) => {
        ;(t as { mood: string }).mood = s
      },
      (t) => {
        ;(t as { mouth: string }).mouth = s
      },
      (t) => {
        ;(t as { extra: string }).extra = s
      },
      (t) => {
        ;(t.eyes as { shape: string }).shape = s
      },
      (t) => {
        ;(t.eyes as { catchlight: string }).catchlight = s
      },
      (t) => {
        ;(t.brow as { shape: string }).shape = s
      },
      (t) => {
        ;(t.silhouette as { plates: string }).plates = s
      },
    ]
    for (const edit of edits) {
      const t = base()
      edit(t)
      expect(() => renderTraits(t)).toThrow(RangeError)
    }
  })

  it('refuses numbers that are not finite and shapes that are missing', () => {
    const cases: ((t: Traits) => void)[] = [
      (t) => {
        ;(t.silhouette as { hw: unknown }).hw = '1" onload="x'
      },
      (t) => {
        ;(t.silhouette as { grain: number }).grain = Number.NaN
      },
      (t) => {
        ;(t.antennae as { lean: unknown }).lean = [1]
      },
      (t) => {
        ;(t.antennae as { count: number }).count = 3
      },
      (t) => {
        ;(t.eyes as { size: number }).size = Number.POSITIVE_INFINITY
      },
      (t) => {
        ;(t as { gen: number }).gen = 2
      },
      (t) => {
        ;(t as { palette?: unknown }).palette = undefined
      },
    ]
    for (const edit of cases) {
      const t = base()
      edit(t)
      expect(() => renderTraits(t)).toThrow(RangeError)
    }
  })
})

describe('theme names and colours', () => {
  it('only resolves the names of built-in themes', () => {
    for (const name of ['constructor', '__proto__', 'toString', 'hasOwnProperty', 'valueOf']) {
      expect(() => themeOf(name as never)).toThrow(RangeError)
      expect(() => renderNurbling(undefined, 'ada', {}, name as never)).toThrow(RangeError)
    }
    for (const name of Object.keys(THEMES))
      expect(themeOf(name as never)).toBe(THEMES[name as keyof typeof THEMES])
  })

  it.each(HOSTILE)('refuses %j as a colour in palettes, configs and theme objects', (s) => {
    expect(() => palette([s, '#000000'])).toThrow(RangeError)
    expect(() => createNurblings({ shells: { a: s as never } })).toThrow(RangeError)
    expect(() => createNurblings({ accents: { a: s as never } })).toThrow(RangeError)
    const theme = { name: 'x', shells: { a: '#f2e8cf' }, accents: { b: '#1b1b1b' } } as const
    expect(() => createNurblings({ theme: { ...theme, backdrops: [s as never] } })).toThrow(
      RangeError,
    )
    expect(() => createNurblings({ theme: { ...theme, darkBackdrops: [s as never] } })).toThrow(
      RangeError,
    )
  })
})

describe('very long input', () => {
  it('renders a million-character seed and title quickly and cleanly', () => {
    const long = `${'<script>'.repeat(125_000)}`
    const start = performance.now()
    const svg = nurbling(long, { title: long, animate: false })
    expect(performance.now() - start).toBeLessThan(2000)
    assertClean(svg)
  })
})

describe('extensions cannot open a way in', () => {
  const plain = { hw: 1, width: 1, belly: 0.3, tip: 1, rows: 3, cols: 4, plates: 'crown' } as const

  it('gives slots only library values, never the seed or the title', () => {
    let keys: string[] = []
    let text = ''
    createNurblings({
      slots: {
        body: (ctx, base) => {
          keys = Object.keys(ctx)
          text = JSON.stringify(ctx.traits)
          return base()
        },
      },
    }).nurbling('ada-secret', { title: 'Title Secret' })
    expect(keys.sort()).toEqual([
      'anchors',
      'colours',
      'esc',
      'geometry',
      'mode',
      'n',
      'options',
      'paint',
      'props',
      'random',
      'size',
      'small',
      'theme',
      'traits',
    ])
    expect(text).not.toMatch(/secret/i)
  })

  it.each(HOSTILE)('keeps a title of %j escaped when slots wrap parts', (s) => {
    const wrapped = createNurblings({
      slots: { body: (_ctx, base) => `<g>${base()}</g>`, eyes: (_ctx, base) => base() },
    })
    assertClean(wrapped.nurbling('ada', { title: s, transition: s }))
  })

  it.each(HOSTILE)('refuses %j in a custom body design', (s) => {
    for (const key of ['hw', 'width', 'belly', 'tip', 'rows', 'cols', 'plates'] as const) {
      expect(() =>
        createNurblings({ silhouettes: { x: { ...plain, [key]: s } as never } }),
      ).toThrow(RangeError)
    }
  })

  it('bounds the plate grid so a design cannot stall rendering', () => {
    for (const bad of [0, 13, 2.5, 500, Number.NaN, Number.POSITIVE_INFINITY, -1]) {
      expect(() => createNurblings({ silhouettes: { x: { ...plain, rows: bad } } })).toThrow(
        RangeError,
      )
      expect(() => createNurblings({ silhouettes: { x: { ...plain, cols: bad } } })).toThrow(
        RangeError,
      )
    }
    const t = structuredClone(traits('ada')) as Traits
    ;(t.silhouette as { rows: number }).rows = 1_000_000
    expect(() => renderTraits(t)).toThrow(RangeError)
    const start = performance.now()
    createNurblings({ silhouettes: { x: { ...plain, rows: 12, cols: 12 } } }).nurbling('ada', {
      animate: false,
    })
    expect(performance.now() - start).toBeLessThan(250)
  })

  it.each(HOSTILE)('encodes a transition key of %j into a safe CSS name', (s) => {
    expect(transitionName(s)).toMatch(/^nb-[A-Za-z0-9_-]*$/)
  })
})
