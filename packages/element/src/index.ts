// <nurbling-avatar>: one custom element for every page without a React, Vue
// or Astro component, such as plain HTML, a CMS, Svelte, Solid or Angular.
// Light DOM on purpose: the SVG's motion styles and `morph` transitions see
// it like any other avatar.

import { type NurblingOptions, type NurblingRenderer, nurbling } from 'nurblings'

const TEXT = [
  'background',
  'title',
  'frame',
  'mood',
  'mouth',
  'extra',
  'silhouette',
  'shell',
  'transition',
] as const
const NUMBER = ['size', 'gen'] as const

// Importable on the server: the class only needs HTMLElement once it is defined.
const Base = (typeof HTMLElement === 'undefined' ? class {} : HTMLElement) as typeof HTMLElement

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

export class NurblingElement extends Base {
  static observedAttributes = ['seed', 'animate', ...TEXT, ...NUMBER]

  #renderer: NurblingRenderer = { nurbling }

  /** A `createNurblings` instance to render with; the built-in family by default. */
  get nurblings(): NurblingRenderer {
    return this.#renderer
  }

  set nurblings(value: NurblingRenderer | undefined) {
    this.#renderer = value ?? { nurbling }
    this.#render()
  }

  connectedCallback() {
    this.#render()
  }

  attributeChangedCallback() {
    this.#render()
  }

  #render() {
    if (!this.isConnected) return
    const seed = this.getAttribute('seed')
    if (seed === null) {
      this.replaceChildren()
      return
    }
    const opts: Record<string, unknown> = {}
    for (const name of TEXT) {
      const value = this.getAttribute(name)
      if (value !== null) opts[name] = value
    }
    for (const name of NUMBER) {
      const value = this.getAttribute(name)
      if (value !== null) opts[name] = Number(value)
    }
    const animate = parseAnimate(this.getAttribute('animate'))
    if (animate !== undefined) opts.animate = animate
    if (!this.style.display) this.style.display = 'inline-block'
    if (!this.style.lineHeight) this.style.lineHeight = '0'
    this.innerHTML = this.#renderer.nurbling(seed, opts)
  }
}

/** Registers the element under `tag`. Safe to call twice, and a no-op on the server. */
export function define(tag = 'nurbling-avatar'): void {
  if (typeof customElements === 'undefined' || customElements.get(tag)) return
  // a subclass per tag: one constructor cannot be registered under two names
  customElements.define(tag, class extends NurblingElement {})
}

declare global {
  interface HTMLElementTagNameMap {
    'nurbling-avatar': NurblingElement
  }
}
