import { mount } from '@vue/test-utils'
import { nurbling } from 'nurblings'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { Nurbling, type NurblingProps } from '../src/index'

const SEEDS = ['alice@example.com', 'bob', 'a very long seed string with spaces', '']

const OPTION_SETS: Omit<NurblingProps, 'seed'>[] = [
  {},
  { size: 32 },
  { background: 'circle', title: 'Bob' },
  { mood: 'curious', mouth: 'smile', extra: 'scarf', silhouette: 'pear', shell: 'sky' },
  { animate: true },
]

const ssr = (props: NurblingProps) => renderToString(createSSRApp(() => h(Nurbling, props)))

describe('Nurbling (server render)', () => {
  it('renders exactly nurbling(seed, opts) inside the wrapper span, for every seed and option set', async () => {
    for (const seed of SEEDS) {
      for (const opts of OPTION_SETS) {
        const html = await ssr({ seed, ...opts })
        expect(html).toContain(nurbling(seed, opts as Parameters<typeof nurbling>[1]))
      }
    }
  })

  it('forwards class and style to the wrapper span', async () => {
    const html = await renderToString(
      createSSRApp(() =>
        h(Nurbling, { seed: 'carol', class: 'avatar', style: { border: '1px solid red' } }),
      ),
    )
    expect(html).toContain('class="avatar"')
    expect(html).toContain('border:1px solid red')
    expect(html).toContain('display:inline-block')
    expect(html).toContain('line-height:0')
  })

  it('renders the same seed to the same markup every time', async () => {
    const first = await ssr({ seed: 'deterministic-seed' })
    const second = await ssr({ seed: 'deterministic-seed' })
    expect(first).toBe(second)
  })

  it('produces identical markup on client mount, with no hydration-only behaviour', () => {
    // The DOM re-serialises self-closing tags (<path/> becomes <path></path>),
    // so round-trip the expected markup through the same DOM before comparing.
    const normalise = (svg: string) => {
      const span = document.createElement('span')
      span.innerHTML = svg
      return span.innerHTML
    }
    for (const seed of SEEDS) {
      const wrapper = mount(Nurbling, { props: { seed } })
      expect(wrapper.find('span').element.innerHTML).toBe(normalise(nurbling(seed)))
      expect(wrapper.find('span').attributes('style')).toContain('display: inline-block')
    }
  })
})
