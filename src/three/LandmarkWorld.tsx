import { OrbitControls } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { useLayoutEffect } from "react"
import { BuranaScene } from "./landmarks/BuranaScene"
import { EiffelScene } from "./landmarks/EiffelScene"
import { GizaScene } from "./landmarks/GizaScene"
import { TianShanScene } from "./landmarks/TianShanScene"
import type { LandmarkSceneId } from "../data/landmarkQuests"

const CAM: Record<LandmarkSceneId, { pos: [number, number, number]; target: [number, number, number] }> = {
  eiffel: { pos: [8.2, 5.2, 11.5], target: [0, 2.6, 0] },
  burana: { pos: [5.8, 3.0, 7.2], target: [0, 2.2, 0] },
  giza: { pos: [8.2, 4.4, 11.2], target: [0, 1.1, 0] },
  "tian-shan": { pos: [12, 8.5, 16], target: [0, 1.2, 0] },
}

function LandControls({ scene }: { scene: LandmarkSceneId }) {
  const { camera } = useThree()
  const cfg = CAM[scene]
  useLayoutEffect(() => {
    camera.position.set(...cfg.pos)
    camera.up.set(0, 1, 0)
    camera.lookAt(...cfg.target)
    camera.updateProjectionMatrix()
  }, [camera, cfg])
  return (
    <OrbitControls enableDamping dampingFactor={0.08} minDistance={6} maxDistance={36} target={cfg.target} />
  )
}

export function LandmarkScene({
  scene,
  onPoint,
  speech,
  speaking,
}: {
  scene: LandmarkSceneId
  onPoint: (title: string, text: string) => void
  speech: string
  speaking: boolean
}) {
  return (
    <>
      <LandControls scene={scene} />
      {scene === "eiffel" ? <EiffelScene onPoint={onPoint} speech={speech} speaking={speaking} /> : null}
      {scene === "giza" ? <GizaScene onPoint={onPoint} speech={speech} speaking={speaking} /> : null}
      {scene === "burana" ? <BuranaScene speech={speech} speaking={speaking} /> : null}
      {scene === "tian-shan" ? <TianShanScene onPoint={onPoint} /> : null}
    </>
  )
}
