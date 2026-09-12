import { createNurblings } from 'nurblings'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { Nurbling, NurblingsPlugin } from '../src/index'

const brand = createNurblings({
  shells: { mist: '#e4ebf2', sand: '#f1e4cf' },
  accents: { ink: '#2c5fd9', coral: '#c94f38', forest: '#2e7d4f' },
})

describe('app-wide configuration', () => {
  it('renders with a createNurblings instance passed as a prop', async () => {
    const html = await renderToString(
      createSSRApp(() => h(Nurbling, { seed: 'ada', size: 64, nurblings: brand })),
    )
    expect(html).toContain(brand.nurbling('ada', { size: 64 }))
  })

  it('renders every Nurbling in an app with the plugin configuration', async () => {
    const app = createSSRApp(() => h(Nurbling, { seed: 'ada', size: 64 })).use(
      NurblingsPlugin(brand),
    )
    expect(await renderToString(app)).toContain(brand.nurbling('ada', { size: 64 }))
  })
})
