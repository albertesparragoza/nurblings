// <nurbling-avatar>: one custom element for every page without a React, Vue
// or Astro component, such as plain HTML, a CMS, Svelte, Solid or Angular.
// Light DOM on purpose: the SVG's motion styles and `morph` transitions see
// it like any other avatar.

import { type NurblingOptions, type NurblingRenderer, nurbling } from 'nurblings'
import { renderNurbling, type ThemeName } from 'nurblings/themes'

const TEXT = [
  'background',
  'title',
  'frame',
  'mode',
  'mood',
  'mouth',
  'extra',
  'silhouette',
  'shell',
  'transition',
] as const
const NUMBER = ['size', 'gen'] as const

// Attributes that also get a matching property, for frameworks that bind
// properties. `title` and `animate` are left out: both are built-in element
// members (the tooltip and the Web Animations method), so they stay attributes.
const REFLECTED = [
  'seed',
  'background',
  'frame',
  'mode',
  'mood',
  'mouth',
  'extra',
  'silhouette',
  'shell',
  'transition',
  'theme',
  ...NUMBER,
] as const
type Reflected = (typeof REFLECTED)[number]

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

export interface NurblingElement extends Record<Reflected, string | null> {}

// biome-ignore lint/suspicious/noUnsafeDeclarationMerging: the interface types the reflected accessors defined on the prototype below
export class NurblingElement extends Base {
  static observedAttributes = ['seed', 'animate', 'decorative', 'theme', ...TEXT, ...NUMBER]

  #renderer: NurblingRenderer | undefined

  constructor() {
    super()
    // A property set before the element was defined sits on the instance and
    // would hide the accessor: take it off and set it again through the accessor.
    const self = this as unknown as Record<string, unknown>
    for (const name of [...REFLECTED, 'nurblings']) {
      if (!Object.hasOwn(self, name)) continue
      const value = self[name]
      delete self[name]
      self[name] = value
    }
  }

  /** A `createNurblings` instance to render with; the built-in family by default. */
  get nurblings(): NurblingRenderer {
    return this.#renderer ?? { nurbling }
  }

  set nurblings(value: NurblingRenderer | undefined) {
    this.#renderer = value
    this.#render()
  }

  connectedCallback() {
    // Default to inline-block with no line height (no baseline gap under the
    // avatar) only while nothing styles the element, so any display set by a
    // stylesheet, a layer or a shadow root wins.
    // ponytail: checked once on connect; CSS that arrives later and wants inline back must say so inline.
    if (getComputedStyle(this).display === 'inline') {
      this.style.display = 'inline-block'
      this.style.lineHeight = '0'
    }
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
    // a boolean attribute: present means decorative, unless it says false
    const decorative = this.getAttribute('decorative')
    if (decorative !== null && decorative !== 'false') opts.decorative = true
    const theme = (this.getAttribute('theme') || undefined) as ThemeName | undefined
    this.innerHTML = renderNurbling(this.#renderer, seed, opts, theme)
  }
}

for (const name of REFLECTED) {
  Object.defineProperty(NurblingElement.prototype, name, {
    configurable: true,
    enumerable: true,
    get(this: HTMLElement) {
      return this.getAttribute(name)
    },
    set(this: HTMLElement, value: unknown) {
      if (value === null || value === undefined) this.removeAttribute(name)
      else this.setAttribute(name, String(value))
    },
  })
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
