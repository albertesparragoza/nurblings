// A Vue 3 component for nurblings: seed in, SVG out, rendered with plain h().
// No SFC, no compiler, no reactive state beyond props, no lifecycle hooks: the
// markup is identical on the server and the client.

import type { NurblingOptions } from 'nurblings'
import { nurbling } from 'nurblings'
import { defineComponent, h, type PropType } from 'vue'

export interface NurblingProps extends NurblingOptions {
  seed: string
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
] as const satisfies readonly (keyof NurblingOptions)[]

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
    animate: { type: Boolean as PropType<NurblingOptions['animate']>, default: undefined },
    gen: { type: Number as PropType<NurblingOptions['gen']>, default: undefined },
    mood: { type: String as PropType<NurblingOptions['mood']>, default: undefined },
    mouth: { type: String as PropType<NurblingOptions['mouth']>, default: undefined },
    extra: { type: String as PropType<NurblingOptions['extra']>, default: undefined },
    silhouette: {
      type: String as PropType<NurblingOptions['silhouette']>,
      default: undefined,
    },
    shell: { type: String as PropType<NurblingOptions['shell']>, default: undefined },
  },
  setup(props) {
    return () => {
      const opts: NurblingOptions = {}
      for (const key of OPTION_KEYS) {
        const value = props[key]
        if (value !== undefined) opts[key] = value as never
      }
      return h('span', {
        style: 'display:inline-block;line-height:0',
        innerHTML: nurbling(props.seed, opts),
      })
    }
  },
})

export default Nurbling
