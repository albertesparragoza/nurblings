// Seed handling: normalisation, hashing and the per-trait random streams.
//
// Everything here is part of the stability contract. Changing how a seed is
// normalised or hashed changes every avatar in every generation, so this file
// only ever gains code, it never changes what existing code returns.

const MARKS = /\p{M}/gu
// Whitespace, punctuation, separators and invisible format characters. Symbols
// (emoji included) are kept so an emoji-only seed still carries information.
const SEPARATORS = /[\s\p{P}\p{Z}\p{Cc}\p{Cf}]/gu

/**
 * Normalise a seed before hashing: Unicode NFKC, lower case, accents and other
 * combining marks stripped, separators and whitespace removed.
 *
 * `Ada Lovelace`, `ada.lovelace` and `ＡＤＡ－ＬＯＶＥＬＡＣＥ` all normalise to
 * `adalovelace`. A seed made only of separators, marks or format characters
 * normalises to its NFKC form so it still hashes to something of its own.
 */
export function normaliseSeed(seed: string): string {
  const folded = seed.normalize('NFKC').toLowerCase().normalize('NFD').replace(MARKS, '')
  const stripped = folded.replace(SEPARATORS, '').normalize('NFC')
  return stripped === '' ? seed.normalize('NFKC') : stripped
}

/**
 * cyrb128: a fast, well-mixed 128-bit string hash, returned as four unsigned
 * 32-bit words. Not cryptographic, and does not need to be.
 */
export function hash128(input: string): [number, number, number, number] {
  let h1 = 1779033703
  let h2 = 3144134277
  let h3 = 1013904242
  let h4 = 2773480762
  for (let i = 0; i < input.length; i++) {
    const k = input.charCodeAt(i)
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067)
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233)
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213)
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179)
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067)
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233)
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213)
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179)
  h1 ^= h2 ^ h3 ^ h4
  h2 ^= h1
  h3 ^= h1
  h4 ^= h1
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0]
}

/** A seeded pseudo-random source. Every method advances the same sequence. */
export interface Rng {
  /** A float in [0, 1). */
  next(): number
  /** An integer in [0, n). */
  int(n: number): number
  /** A float in [min, max). */
  range(min: number, max: number): number
  /** One element of a non-empty list. */
  pick<T>(items: readonly T[]): T
  /** One element of a non-empty list, chosen by weight. */
  weighted<T>(items: readonly (readonly [T, number])[]): T
}

/** sfc32, seeded from four 32-bit words. Small, fast and well distributed. */
function sfc32(a: number, b: number, c: number, d: number): () => number {
  return () => {
    a |= 0
    b |= 0
    c |= 0
    d |= 0
    const t = (((a + b) | 0) + d) | 0
    d = (d + 1) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    c = (c + t) | 0
    return (t >>> 0) / 4294967296
  }
}

function rngFrom(next: () => number): Rng {
  const rng: Rng = {
    next,
    int: (n) => Math.floor(next() * n),
    range: (min, max) => min + next() * (max - min),
    pick: (items) => items[rng.int(items.length)] as (typeof items)[number],
    weighted: (items) => {
      let total = 0
      for (const [, w] of items) total += w
      let roll = next() * total
      for (const [item, w] of items) {
        roll -= w
        if (roll < 0) return item
      }
      return (items[items.length - 1] as (typeof items)[number])[0]
    },
  }
  return rng
}

/**
 * The random stream for one trait group of one seed. Each group draws from its
 * own stream, so adding a trait group, or drawing more values in one, never
 * shifts what any other group gets.
 *
 * `seed` must already be normalised.
 */
export function stream(seed: string, group: string): Rng {
  const [a, b, c, d] = hash128(`${seed}\u0000${group}`)
  const next = sfc32(a, b, c, d)
  // discard the first outputs: sfc32 mixes its state over the first few steps
  for (let i = 0; i < 12; i++) next()
  return rngFrom(next)
}
