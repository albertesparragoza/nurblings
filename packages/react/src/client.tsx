// Client-side React: a Provider for an app-wide configuration. Server
// components cannot read context, so in Next.js server code pass the
// `nurblings` prop (or wrap Nurbling once) instead.

import type { NurblingRenderer } from 'nurblings'
import { createContext, type ReactNode, useContext } from 'react'
import { type NurblingProps, Nurbling as StaticNurbling } from './index'

const NurblingsContext = createContext<NurblingRenderer | undefined>(undefined)

/** Makes a `createNurblings` instance the default for every Nurbling below it. */
export function NurblingsProvider(props: { value: NurblingRenderer; children?: ReactNode }) {
  return <NurblingsContext.Provider value={props.value}>{props.children}</NurblingsContext.Provider>
}

/** Nurbling that renders with the nearest provider's configuration, unless given its own. */
export function Nurbling(props: NurblingProps) {
  const provided = useContext(NurblingsContext)
  const nurblings = props.nurblings ?? provided
  return <StaticNurbling {...props} {...(nurblings ? { nurblings } : {})} />
}

export type { NurblingProps }
