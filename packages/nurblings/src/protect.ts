// Flagship protection: a short list of reserved seeds renders the stored
// drawing of Nurbi. Nothing else ever does, and the generator never produces it.

import { FLAGSHIP_BODY } from './flagship'
import { normaliseSeed } from './seed'
import { type Box, backdrop, esc, MOTION, motion, n, pixelSize, resolveFrame } from './svg'
import type { Frame, RenderOptions } from './types'

/** Normalised seeds that resolve to Nurbi. */
export const FLAGSHIP_SEEDS: readonly string[] = ['albertesparragoza', 'nurbi', 'albertlabs']

const FLAGSHIP_BACKGROUND = '#15151a'

// Measured bounds of the stored drawing (640 x 640 units): the body alone, and
// the whole figure with both antenna tips.
const BODY = { left: 119.9, right: 520.1, top: 185.4, base: 595 }
const FIGURE = { left: 119.9, right: 520.1, top: 54.3, base: 595 }

function flagshipBox(frame: Frame): Box {
  if (frame === 'portrait') {
    const width = BODY.right - BODY.left
    const height = BODY.base - BODY.top
    const s = Math.max(width * 1.36, height * 1.18)
    const cy = BODY.top + height * 0.52
    return { x: 320 - s / 2, y: cy - s / 2, s }
  }
  const s = Math.max(FIGURE.right - FIGURE.left, FIGURE.base - FIGURE.top) * 1.12
  return {
    x: (FIGURE.left + FIGURE.right) / 2 - s / 2,
    y: (FIGURE.top + FIGURE.base) / 2 - s / 2,
    s,
  }
}

export function isFlagshipSeed(seed: string): boolean {
  return FLAGSHIP_SEEDS.includes(normaliseSeed(seed))
}

export function renderFlagship(opts: RenderOptions = {}): string {
  const px = pixelSize(opts.size)
  const size = n(px)
  const title = esc(opts.title ?? 'Nurbi')
  const box = flagshipBox(resolveFrame(opts.frame, px))
  const vb = `${n(box.x)} ${n(box.y)} ${n(box.s)} ${n(box.s)}`
  const back = backdrop(opts.background ?? 'none', FLAGSHIP_BACKGROUND, box)
  const live = motion(FLAGSHIP_GRAIN, false, opts.animate, px <= 32)
  if (!live) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${size}" height="${size}" role="img" aria-label="${title}" class="nb"><title>${title}</title>${back}${FLAGSHIP_BODY}</svg>`
  }
  // ponytail: the stored drawing has no separate eye group, so Nurbi breathes and sways but does not blink.
  const figure = `<g class="nb-al">${LEFT}</g><g class="nb-ar">${RIGHT}</g>${REST}`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${size}" height="${size}" role="img" aria-label="${title}" class="nb${live.cls}" style="${live.style}">${MOTION}<title>${title}</title>${back}<g class="nb-f">${figure}</g></svg>`
}

const FLAGSHIP_GRAIN = 1
// The stored drawing opens with the left and right antennae, a line and a square each.
const [, LEFT, RIGHT, REST] = FLAGSHIP_BODY.match(
  /^(<line[^>]*\/><rect[^>]*\/>)(<line[^>]*\/><rect[^>]*\/>)(.*)$/s,
) as RegExpMatchArray
