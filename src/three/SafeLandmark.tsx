import { useState } from "react"
import type { LandmarkDef } from "../data/world"
import { ErrorBoundary } from "./ErrorBoundary"
import { LandmarkStage } from "./LandmarkStage"
import { hasWebGL } from "./webgl"

export function SafeLandmark({ landmark }: { landmark: LandmarkDef }) {
  const [webgl] = useState(() => hasWebGL())
  const fallback = (
    <div className="landmark2d">
      <div className={`lm-shape lm-${landmark.kind}`} />
      <p>{landmark.name}</p>
      <small>3D-сцена на системах с WebGL</small>
    </div>
  )
  if (!webgl) return fallback
  return (
    <ErrorBoundary fallback={fallback}>
      <LandmarkStage landmark={landmark} />
    </ErrorBoundary>
  )
}
