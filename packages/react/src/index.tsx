import type { NurblingOptions, NurblingRenderer } from 'nurblings'
import { renderNurbling, type Theme, type ThemeName } from 'nurblings/themes'
import type { CSSProperties } from 'react'

export type NurblingProps = {
  seed: string
  className?: string
  style?: CSSProperties
  /** a built-in theme by name, such as `"lagoon"`, or any theme object */
  theme?: ThemeName | Theme
  /** render with an app-wide configuration from `createNurblings` */
  nurblings?: NurblingRenderer
} & NurblingOptions

/**
 * A deterministic avatar rendered as inline SVG. A valid React Server
 * Component: no client JavaScript, no state, no hydration-only behaviour.
 * The same seed always renders the same markup on the server and the client.
 */
export function Nurbling(props: NurblingProps) {
  const { seed, className, style, nurblings, theme, ...options } = props
  const svg = renderNurbling(nurblings, seed, options, theme)
  return (
    <span
      className={className}
      style={{ display: 'inline-block', lineHeight: 0, ...style }}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: svg is generated and escaped by nurblings
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
