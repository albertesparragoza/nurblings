import { type NurblingOptions, nurbling } from 'nurblings'
import type { CSSProperties } from 'react'

export type NurblingProps = {
  seed: string
  className?: string
  style?: CSSProperties
} & NurblingOptions

/**
 * A deterministic avatar rendered as inline SVG. A valid React Server
 * Component: no client JavaScript, no state, no hydration-only behaviour.
 * The same seed always renders the same markup on the server and the client.
 */
export function Nurbling(props: NurblingProps) {
  const { seed, className, style, ...options } = props
  const svg = nurbling(seed, options)
  return (
    <span
      className={className}
      style={{ display: 'inline-block', lineHeight: 0, ...style }}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: svg is generated and escaped by nurblings
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
