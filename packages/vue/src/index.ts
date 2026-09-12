// A Vue 3 component for nurblings: seed in, SVG out, rendered with plain h().
// No SFC, no compiler, no reactive state beyond props, no lifecycle hooks: the
// markup is identical on the server and the client.

import type { NurblingOptions, NurblingRenderer } from 'nurblings'
import { nurbling } from 'nurblings'
import { defineComponent, h, type InjectionKey, inject, type Plugin, type PropType } from 'vue'

export interface NurblingProps extends NurblingOptions {
  seed: string
  /** render with an app-wide configuration from `createNurblings` */
  nurblings?: NurblingRenderer
}

const OPTION_KEYS = [
  'size',
  'background',
  'title',
  'animate',
  'gen',
  'mood',
  'mouth',
  'extra',
  'silhouette',
  'shell',
  'frame',
] as const satisfies readonly (keyof NurblingOptions)[]

/** Where `NurblingsPlugin` provides the app-wide configuration. */
export const NURBLINGS: InjectionKey<NurblingRenderer> = Symbol('nurblings')

/** Makes a `createNurblings` instance the default for every Nurbling in the app. */
export const NurblingsPlugin = (value: NurblingRenderer): Plugin => ({
  install: (app) => {
    app.provide(NURBLINGS, value)
  },
})

const defaults: NurblingRenderer = { nurbling }

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
    shell: { type: String as PropType<NurblingOptions['shell']>, default: undefined },
    frame: { type: String as PropType<NurblingOptions['frame']>, default: undefined },
    nurblings: { type: Object as PropType<NurblingRenderer>, default: undefined },
  },
  setup(props) {
    const provided = inject(NURBLINGS, defaults)
    return () => {
      const opts: NurblingOptions = {}
      for (const key of OPTION_KEYS) {
        const value = props[key]
        if (value !== undefined) opts[key] = value as never
      }
      return h('span', {
        style: 'display:inline-block;line-height:0',
        innerHTML: (props.nurblings ?? provided).nurbling(props.seed, opts),
      })
    }
  },
})

export default Nurbling
