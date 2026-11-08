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
}: {
  discover: boolean
  scene: "tian-shan" | "eiffel" | "giza"
  onPick: (hit: { iso: string | null; lat: number; lng: number }) => void
  onPoint: (title: string, text: string) => void
  onHover?: (hit: { iso: string | null; name: string | null; x: number; y: number } | null) => void
}) {
  return (
    <ErrorBoundary>
      <WorldCanvas>
        <CameraRig mode={discover ? "land" : "earth"} />
        {discover ? <LandmarkScene scene={scene} onPoint={onPoint} /> : <EarthBundle onPick={onPick} onHover={onHover} />}
      </WorldCanvas>
    </ErrorBoundary>
  )
}
