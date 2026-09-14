// Parsing for the element's `animate` attribute, kept out of the package entry:
// it is the element's own business, not part of its public API.

import type { NurblingOptions } from 'nurblings'

/**
 * The `animate` attribute: absent (motion on), `false` for a still avatar,
 * or the layers to keep, such as `animate="blink hover"`.
 */
export function parseAnimate(value: string | null): NurblingOptions['animate'] {
  if (value === null || value === '' || value === 'true') return undefined
  if (value === 'false') return false
  const on = new Set(value.split(/[\s,]+/))
  return {
    breath: on.has('breath'),
    blink: on.has('blink'),
    antennae: on.has('antennae'),
    hover: on.has('hover'),
  }
}
