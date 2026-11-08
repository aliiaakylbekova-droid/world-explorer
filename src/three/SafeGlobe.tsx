import { useState } from "react"
import type { ContinentId } from "../data/world"
import { ErrorBoundary } from "./ErrorBoundary"
import { Globe } from "./Globe"
import { Globe2D } from "./Globe2D"
import { hasWebGL } from "./webgl"

type Props = {
  continent: ContinentId
  countryId: string | null
  onPickCountry: (id: string) => void
  interactive?: boolean
}

export function SafeGlobe(props: Props) {
  const [webgl] = useState(() => hasWebGL())
  const fallback = <Globe2D continent={props.continent} countryId={props.countryId} onPickCountry={props.onPickCountry} />
  if (!webgl) return fallback
  return (
    <ErrorBoundary fallback={fallback}>
      <Globe {...props} />
    </ErrorBoundary>
  )
}
