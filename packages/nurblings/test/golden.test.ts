// Generation 1 is frozen: these fixtures pin what every listed seed renders.
//
// If this test fails, an existing avatar changed. That is never allowed within
// a generation. Do not edit the fixtures to make it pass: find the change that
// moved the output, and ship it as a new generation instead.

import { describe, expect, it } from 'vitest'
import { nurbi } from '../src/nurbi'
import { nurbling } from '../src/nurbling'
import { GEN1_GOLDEN } from './fixtures/gen1.golden'

async function digest(svg: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(svg)))
  let hex = ''
  for (const b of bytes.subarray(0, 8)) hex += b.toString(16).padStart(2, '0')
  return hex
}

describe('generation 1 golden fixtures', () => {
  it('covers a spread of seeds at two sizes', () => {
    expect(Object.keys(GEN1_GOLDEN).length).toBeGreaterThanOrEqual(80)
  })

  it('pins the stored Nurbi drawing', async () => {
    expect(await digest(nurbi({ size: 24, animate: false }))).toBe('a1c5e43cc44fd1e7')
    expect(await digest(nurbi({ size: 128, animate: false }))).toBe('5215f3582c7a303d')
  })

  it.each(Object.entries(GEN1_GOLDEN))('%s renders exactly as recorded', async (key, expected) => {
    const [seed, size] = JSON.parse(key) as [string, number]
    // the drawing is the contract; motion is a layer on top, pinned in svg.test.ts
    expect(await digest(nurbling(seed, { size, animate: false }))).toBe(expected)
  })
})
