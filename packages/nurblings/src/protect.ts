// Flagship protection: a short list of reserved seeds renders the stored
// drawing of Nurbi. Nothing else ever does, and the generator never produces it.

import { FLAGSHIP_BODY, FLAGSHIP_VIEWBOX } from './flagship'
import { normaliseSeed } from './seed'
import { backdrop, esc, n, pixelSize } from './svg'
import type { RenderOptions } from './types'

/** Normalised seeds that resolve to Nurbi. */
export const FLAGSHIP_SEEDS: readonly string[] = ['albertesparragoza', 'nurbi', 'albertlabs']

const FLAGSHIP_BACKGROUND = '#15151a'

export function isFlagshipSeed(seed: string): boolean {
  return FLAGSHIP_SEEDS.includes(normaliseSeed(seed))
}

export function renderFlagship(opts: RenderOptions = {}): string {
  const size = n(pixelSize(opts.size))
  const title = esc(opts.title ?? 'Nurbi')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${title}" class="nb"><title>${title}</title>${backdrop(opts.background ?? 'none', FLAGSHIP_BACKGROUND)}<svg viewBox="${FLAGSHIP_VIEWBOX}" width="100" height="100">${FLAGSHIP_BODY}</svg></svg>`
}
