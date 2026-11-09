import { OrbitControls } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useState } from "react"
import { EiffelScene } from "./landmarks/EiffelScene"
import { GizaScene } from "./landmarks/GizaScene"
import { TianShanScene } from "./landmarks/TianShanScene"

function LandControls() {
  const [ready, setReady] = useState(false)
  useFrame(({ camera }) => {
    ;(window as unknown as { __gqCam?: number[] }).__gqCam = [camera.position.x, camera.position.y, camera.position.z]
    if (ready) return
    camera.position.set(0, 18, 26)
    camera.up.set(0, 1, 0)
    camera.lookAt(0, 0.25, 0)
    camera.updateProjectionMatrix()
    setReady(true)
  })
  if (!ready) return null
  return <OrbitControls enableDamping minDistance={14} maxDistance={48} target={[0, 0.25, 0]} />
}

export function LandmarkScene({
  scene,
  onPoint,
}: {
  scene: "tian-shan" | "eiffel" | "giza"
  onPoint: (title: string, text: string) => void
}) {
  return (
    <>
      <LandControls />
      {scene === "eiffel" ? <EiffelScene onPoint={onPoint} /> : null}
      {scene === "giza" ? <GizaScene onPoint={onPoint} /> : null}
      {scene === "tian-shan" ? <TianShanScene onPoint={onPoint} /> : null}
    </>
  )
}
