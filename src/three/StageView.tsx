import type { LandmarkSceneId } from "../data/landmarkQuests"
import { EarthBundle } from "../game/GlobeMap"
import { CameraRig } from "./CameraRig"
import { ErrorBoundary } from "./ErrorBoundary"
import { LandmarkScene } from "./LandmarkWorld"
import { WorldCanvas } from "./WorldCanvas"

export function StageView({
  discover,
  scene,
  onPick,
  onPoint,
  onHover,
  speech,
  speaking,
}: {
  discover: boolean
  scene: LandmarkSceneId
  onPick: (hit: { iso: string | null; lat: number; lng: number }) => void
  onPoint: (title: string, text: string) => void
  onHover?: (hit: { iso: string | null; name: string | null; x: number; y: number } | null) => void
  speech: string
  speaking: boolean
}) {
  return (
    <ErrorBoundary>
      <WorldCanvas>
        <CameraRig mode={discover ? "land" : "earth"} />
        {discover ? (
          <LandmarkScene scene={scene} onPoint={onPoint} speech={speech} speaking={speaking} />
        ) : (
          <EarthBundle onPick={onPick} onHover={onHover} />
        )}
      </WorldCanvas>
    </ErrorBoundary>
  )
}
