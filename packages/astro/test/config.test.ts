import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { createNurblings } from 'nurblings'
import { describe, expect, it } from 'vitest'
import Nurbling from '../src/Nurbling.astro'

const brand = createNurblings({
  shells: { mist: '#e4ebf2', sand: '#f1e4cf' },
  accents: { ink: '#2c5fd9', coral: '#c94f38', forest: '#2e7d4f' },
})

describe('app-wide configuration', () => {
  it('renders with a createNurblings instance passed as a prop', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Nurbling, {
      props: { seed: 'ada', size: 64, nurblings: brand },
      partial: true,
    })
    expect(html).toContain(brand.nurbling('ada', { size: 64 }))
  })
})
