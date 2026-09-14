// A Vue 3 component for nurblings: seed in, SVG out, rendered with plain h().
// No SFC, no compiler, no reactive state beyond props, no lifecycle hooks: the
// markup is identical on the server and the client.

import type { NurblingOptions, NurblingRenderer } from 'nurblings'
import { renderNurbling, type Theme, type ThemeName } from 'nurblings/themes'
import { defineComponent, h, type InjectionKey, inject, type Plugin, type PropType } from 'vue'

export interface NurblingProps extends Omit<NurblingOptions, 'shell'> {
  seed: string
  /** a body colour by name; with a theme, one of that theme's names */
  shell?: string
  /** a built-in theme by name, such as `"lagoon"`, or any theme object */
  theme?: ThemeName | Theme
  /** render with an app-wide configuration from `createNurblings` */
  nurblings?: NurblingRenderer
}

const OPTION_KEYS = [
  'size',
  'background',
  'title',
  'decorative',
  'animate',
  'gen',
  'mood',
  'mouth',
  'extra',
  'silhouette',
  'shell',
  'frame',
  'mode',
  'transition',
] as const satisfies readonly (keyof NurblingOptions)[]

/** Where `NurblingsPlugin` provides the app-wide configuration. */
export const NURBLINGS: InjectionKey<NurblingRenderer> = Symbol('nurblings')

/** Makes a `createNurblings` instance the default for every Nurbling in the app. */
export const NurblingsPlugin = (value: NurblingRenderer): Plugin => ({
  install: (app) => {
    app.provide(NURBLINGS, value)
  },
})

export const Nurbling = defineComponent({
  name: 'Nurbling',
  props: {
    seed: { type: String, required: true },
    size: { type: Number as PropType<NurblingOptions['size']>, default: undefined },
    background: {
      type: String as PropType<NurblingOptions['background']>,
      default: undefined,
    },
    title: { type: String as PropType<NurblingOptions['title']>, default: undefined },
    // default undefined keeps an absent prop from casting to false, like animate below
    decorative: { type: Boolean, default: undefined },
    // default undefined keeps an absent prop from casting to false: motion is on by default
    animate: {
      type: [Boolean, Object] as PropType<NurblingOptions['animate']>,
      default: undefined,
    },
    gen: { type: Number as PropType<NurblingOptions['gen']>, default: undefined },
    mood: { type: String as PropType<NurblingOptions['mood']>, default: undefined },
    mouth: { type: String as PropType<NurblingOptions['mouth']>, default: undefined },
    extra: { type: String as PropType<NurblingOptions['extra']>, default: undefined },
    silhouette: {
      type: String as PropType<NurblingOptions['silhouette']>,
      default: undefined,
    },
    shell: { type: String, default: undefined },
    frame: { type: String as PropType<NurblingOptions['frame']>, default: undefined },
    mode: { type: String as PropType<NurblingOptions['mode']>, default: undefined },
    theme: { type: [String, Object] as PropType<ThemeName | Theme>, default: undefined },
    transition: {
      type: String as PropType<NurblingOptions['transition']>,
      default: undefined,
    },
    nurblings: { type: Object as PropType<NurblingRenderer>, default: undefined },
  },
  setup(props) {
    const provided = inject(NURBLINGS, undefined)
    return () => {
      const opts: NurblingOptions = {}
      for (const key of OPTION_KEYS) {
        const value = props[key]
        if (value !== undefined) opts[key] = value as never
      }
      return h('span', {
        style: 'display:inline-block;line-height:0',
        innerHTML: renderNurbling(props.nurblings ?? provided, props.seed, opts, props.theme),
      })
    }
  },
})

export default Nurbling
