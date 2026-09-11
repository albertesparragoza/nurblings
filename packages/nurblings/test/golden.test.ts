// Generation 1 is frozen: these fixtures pin what every listed seed renders.
//
// If this test fails, an existing avatar changed. That is never allowed within
// a generation. Do not edit the fixtures to make it pass: find the change that
// moved the output, and ship it as a new generation instead.

import { describe, expect, it } from 'vitest'
import { nurbling } from '../src/nurbling'
import { GEN1_GOLDEN } from './fixtures/gen1.golden'

async function digest(svg: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(svg)))
  let hex = ''
  for (const b of bytes.subarray(0, 8)) hex += b.toString(16).padStart(2, '0')
  return hex
}

describe('generation 1 golden fixtures', () => {
  it('covers a spread of seeds at two sizes, the reserved seed included', () => {
    expect(Object.keys(GEN1_GOLDEN).length).toBeGreaterThanOrEqual(82)
    expect(GEN1_GOLDEN[JSON.stringify(['albertesparragoza', 128])]).toBeDefined()
  })

  it.each(Object.entries(GEN1_GOLDEN))('%s renders exactly as recorded', async (key, expected) => {
    const [seed, size] = JSON.parse(key) as [string, number]
    expect(await digest(nurbling(seed, { size }))).toBe(expected)
  })
})
