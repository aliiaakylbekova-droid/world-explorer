import { ErrorBoundary } from "./ErrorBoundary"
import { WorldCanvas } from "./WorldCanvas"
import { EiffelScene } from "./landmarks/EiffelScene"
import { GizaScene } from "./landmarks/GizaScene"
import { TianShanScene } from "./landmarks/TianShanScene"

export function LandmarkWorld({
  scene,
  onPoint,
}: {
  scene: "tian-shan" | "eiffel" | "giza"
  onPoint: (title: string, text: string) => void
}) {
  return (
    <ErrorBoundary
      fallback={<div className="globe-wait">Сцена места: поверни камеру мышью. Если пусто — включи аппаратный WebGL.</div>}
    >
      <WorldCanvas cameraZ={12} key={scene}>
        {scene === "tian-shan" ? <TianShanScene onPoint={onPoint} /> : null}
        {scene === "eiffel" ? <EiffelScene onPoint={onPoint} /> : null}
        {scene === "giza" ? <GizaScene onPoint={onPoint} /> : null}
      </WorldCanvas>
    </ErrorBoundary>
  )
}
