// What rendering costs, and where the time goes.
//
// This exists to answer design questions, not to produce a headline number:
//
// - How much of a render is choosing traits, and how much is drawing them?
//   Selection is what a family's weighted tables drive; drawing is geometry.
// - What does a configured instance cost to BUILD against what it costs to
//   USE? If setup dominates a render, preparing a family once at load time is
//   worth doing, which is the argument behind the `{ family }` design.
// - What does validating caller-supplied traits cost? `renderTraits()` checks
//   every value; the seeded path never does.
// - What do themes, auto mode and small sizes cost?
//
// `pnpm bench`. Compare rows within one run, never across machines or runs:
// these are relative numbers on a shared machine, not a benchmark suite.
//
// Vitest 5 dropped its bench runner, and a dependency for this would not earn
// its place, so the timing loop is here: warm up, then take the median of
// several rounds. The median matters because a garbage collection lands in one
// round and would drag a mean with it.

import { performance } from 'node:perf_hooks'
import { createNurblings, nurbling, renderTraits, traits } from '../packages/nurblings/src/nurbling'
import { themed } from '../packages/nurblings/src/themes'

const ROUNDS = 15
const WARMUP = 8

interface Row {
  name: string
  nsPerOp: number
  opsPerSec: number
}

function measure(name: string, ops: number, run: () => void): Row {
  for (let i = 0; i < WARMUP; i++) run()
  const times: number[] = []
  for (let i = 0; i < ROUNDS; i++) {
    const start = performance.now()
    run()
    times.push(performance.now() - start)
  }
  times.sort((a, b) => a - b)
  const ms = times[(times.length - 1) >> 1] as number
  const nsPerOp = (ms * 1e6) / ops
  return { name, nsPerOp, opsPerSec: 1e9 / nsPerOp }
}

const num = (v: number) =>
  v >= 1e6 ? `${(v / 1e6).toFixed(2)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(1)}k` : v.toFixed(0)

function report(title: string, rows: readonly Row[]): void {
  const width = Math.max(...rows.map((r) => r.name.length))
  const fastest = Math.min(...rows.map((r) => r.nsPerOp))
  console.log(`\n${title}`)
  console.log('-'.repeat(title.length))
  for (const r of rows) {
    const rel = r.nsPerOp / fastest
    const marker = rel === 1 ? '' : `  ${rel.toFixed(2)}x`
    console.log(
      `  ${r.name.padEnd(width)}  ${num(r.nsPerOp).padStart(7)} ns/op  ${num(r.opsPerSec).padStart(7)}/s${marker}`,
    )
  }
}

// A fixed spread of seeds, so no run measures one unusually cheap avatar.
const SEEDS = Array.from({ length: 32 }, (_, i) => `bench-seed-${i}`)
const N = SEEDS.length
const each = (draw: (seed: string) => unknown) => () => {
  for (const seed of SEEDS) draw(seed)
}

const configured = createNurblings({})
const lagoon = themed('lagoon')
const sample = traits('bench-seed-0')

report('Where a render goes', [
  measure(
    'traits only, no drawing',
    N,
    each((s) => traits(s)),
  ),
  measure(
    'nurbling: traits and drawing',
    N,
    each((s) => nurbling(s)),
  ),
])

report('Entry points', [
  measure(
    'nurbling',
    N,
    each((s) => nurbling(s)),
  ),
  measure(
    'themed instance',
    N,
    each((s) => lagoon.nurbling(s)),
  ),
  measure(
    'configured instance',
    N,
    each((s) => configured.nurbling(s)),
  ),
  measure('renderTraits, validating every value', N, () => {
    for (let i = 0; i < N; i++) renderTraits(sample)
  }),
])

report('Instance setup: paid once, or once per avatar', [
  measure('createNurblings()', 1, () => {
    createNurblings({})
  }),
  measure('createNurblings() with a custom palette', 1, () => {
    createNurblings({
      shells: { sand: '#f2e8cf', mist: '#dfe7ef' },
      accents: { amber: '#b7700a', teal: '#16857d', violet: '#7a52c7' },
    })
  }),
  measure('one render, for scale', 1, () => {
    nurbling('bench-seed-0')
  }),
])

report('Options that change the work', [
  measure(
    'default, 128 px',
    N,
    each((s) => nurbling(s)),
  ),
  measure(
    'small, 24 px: mouth and extras dropped',
    N,
    each((s) => nurbling(s, { size: 24 })),
  ),
  measure(
    'auto mode: extra css and properties',
    N,
    each((s) => nurbling(s, { mode: 'auto' })),
  ),
  measure(
    'still: no motion css',
    N,
    each((s) => nurbling(s, { animate: false })),
  ),
  measure(
    'circle container',
    N,
    each((s) => nurbling(s, { background: 'circle' })),
  ),
])

console.log('\nRelative within a run only. Median of %d rounds after %d warmups.\n', ROUNDS, WARMUP)
