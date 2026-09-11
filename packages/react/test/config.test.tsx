import { createNurblings } from 'nurblings'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { NurblingsProvider, Nurbling as ProvidedNurbling } from '../src/client'
import { Nurbling } from '../src/index'

const brand = createNurblings({
  shells: { mist: '#e4ebf2', sand: '#f1e4cf' },
  accents: { ink: '#2c5fd9', coral: '#c94f38', forest: '#2e7d4f' },
})

describe('app-wide configuration', () => {
  it('renders with a createNurblings instance passed as a prop', () => {
    const markup = renderToStaticMarkup(<Nurbling seed="ada" size={64} nurblings={brand} />)
    expect(markup).toContain(brand.nurbling('ada', { size: 64 }))
  })

  it('renders every client Nurbling below a provider with its configuration', () => {
    const markup = renderToStaticMarkup(
      <NurblingsProvider value={brand}>
        <ProvidedNurbling seed="ada" size={64} />
      </NurblingsProvider>,
    )
    expect(markup).toContain(brand.nurbling('ada', { size: 64 }))
  })

  it('falls back to the default renderer without a provider', () => {
    const markup = renderToStaticMarkup(<ProvidedNurbling seed="ada" size={64} />)
    expect(markup).not.toContain(brand.nurbling('ada', { size: 64 }))
  })
})
