import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { nurbling } from 'nurblings'
import { describe, expect, it } from 'vitest'
import Nurbling from '../src/Nurbling.astro'

const SEEDS = ['ada@example.com', 'nurbling', 'a very long seed with spaces and CAPS', '']

async function renderNurbling(props: Record<string, unknown>) {
  const container = await AstroContainer.create()
  return container.renderToString(Nurbling, { props, partial: true })
}

describe('Nurbling.astro', () => {
  it('renders exactly the core markup for a seed', async () => {
    for (const seed of SEEDS) {
      const html = await renderNurbling({ seed })
      expect(html).toContain(nurbling(seed))
    }
  })

  it('forwards options to the core renderer', async () => {
    const opts = { size: 48, mood: 'curious' as const, background: 'circle' as const }
    const html = await renderNurbling({ seed: 'ada@example.com', ...opts })
    expect(html).toContain(nurbling('ada@example.com', opts))
  })

  it('forwards class to the wrapper span', async () => {
    const html = await renderNurbling({ seed: 'ada@example.com', class: 'avatar' })
    expect(html).toMatch(/<span[^>]*class="avatar"/)
  })

  it('merges a forwarded style with the wrapper defaults', async () => {
    const html = await renderNurbling({ seed: 'ada@example.com', style: 'margin:4px' })
    expect(html).toMatch(/<span[^>]*style="display:inline-block;line-height:0;margin:4px"/)
  })

  it('ships no client JavaScript', async () => {
    const html = await renderNurbling({ seed: 'ada@example.com' })
    expect(html).not.toMatch(/<script/i)
  })

  it('renders the wrapper as a single inline-block span with no extra markup', async () => {
    const html = await renderNurbling({ seed: 'ada@example.com' })
    expect(html.match(/<span/g)).toHaveLength(1)
  })

  it('is deterministic: the same seed always renders the same markup', async () => {
    const first = await renderNurbling({ seed: 'stable-seed' })
    const second = await renderNurbling({ seed: 'stable-seed' })
    expect(first).toBe(second)
  })
})
