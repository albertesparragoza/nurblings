import { render } from '@testing-library/react'
import { nurbling } from 'nurblings'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Nurbling } from '../src/index'

const SEEDS = ['ada@example.com', 'grace-hopper', 'katherine.johnson', '']
const OPTION_SETS = [
  {},
  { size: 32 },
  { mood: 'curious' as const },
  { background: 'circle' as const, mouth: 'smile' as const },
]

describe('Nurbling (server)', () => {
  it('renders exactly nurbling(seed, opts) for several seeds and option sets', () => {
    for (const seed of SEEDS) {
      for (const opts of OPTION_SETS) {
        const markup = renderToStaticMarkup(<Nurbling seed={seed} {...opts} />)
        expect(markup).toContain(nurbling(seed, opts))
      }
    }
  })

  it('forwards class and style to the wrapper span', () => {
    const markup = renderToStaticMarkup(
      <Nurbling seed="ada@example.com" className="avatar" style={{ width: 32 }} />,
    )
    expect(markup).toContain('class="avatar"')
    expect(markup).toContain('width:32px')
  })

  it('always wraps the svg in a single inline-block, zero-line-height span', () => {
    const markup = renderToStaticMarkup(<Nurbling seed="ada@example.com" />)
    expect(markup).toMatch(/^<span[^>]*display:inline-block/)
  })

  it('is deterministic: the same seed renders the same markup every time', () => {
    const a = renderToStaticMarkup(<Nurbling seed="repeat-me" />)
    const b = renderToStaticMarkup(<Nurbling seed="repeat-me" />)
    expect(a).toBe(b)
  })
})

describe('Nurbling (client)', () => {
  it('renders in the DOM with markup matching the server render, with no hydration-only behaviour', () => {
    const server = renderToStaticMarkup(<Nurbling seed="ada@example.com" mood="pleased" />)
    const { container } = render(<Nurbling seed="ada@example.com" mood="pleased" />)
    const span = container.querySelector('span')
    // The wrapper's inline style is applied through the CSSOM on the client
    // and kept as a literal attribute string on the server, so the two
    // serialise differently even when they express the same style: compare
    // the resolved properties instead of the raw attribute text.
    expect(span?.style.display).toBe('inline-block')
    expect(span?.style.lineHeight).toBe('0')
    expect(server).toContain(nurbling('ada@example.com', { mood: 'pleased' }))
    // The dangerouslySetInnerHTML payload, the nurbling svg, must be
    // identical on both sides. Compare after the same DOM round trip on each
    // side, since a live DOM never preserves the original self-closing tag
    // syntax on serialisation.
    const reference = document.createElement('div')
    reference.innerHTML = server
    expect(container.querySelector('svg')?.outerHTML).toBe(
      reference.querySelector('svg')?.outerHTML,
    )
  })

  it('forwards class and style on the client too', () => {
    const { container } = render(
      <Nurbling seed="ada@example.com" className="avatar" style={{ width: 32 }} />,
    )
    const span = container.querySelector('span')
    expect(span?.className).toBe('avatar')
    expect(span?.style.width).toBe('32px')
  })
})
