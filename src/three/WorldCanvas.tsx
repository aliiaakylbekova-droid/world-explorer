import { Canvas } from "@react-three/fiber"
import { type ReactNode } from "react"
import { WebGLRenderer } from "three"

function bindGlLog(gl: WebGLRenderer) {
  const el = gl.domElement
  const lost = (event: Event) => {
    event.preventDefault()
    console.error("[geo-quest] WebGL context lost", event)
  }
  const restored = () => console.warn("[geo-quest] WebGL context restored")
  el.addEventListener("webglcontextlost", lost)
  el.addEventListener("webglcontextrestored", restored)
}

export function WorldCanvas({
  children,
  cameraZ = 11.2,
}: {
  children: ReactNode
  cameraZ?: number
}) {
  const land = cameraZ > 14
  return (
    <Canvas
      className="world-canvas"
      style={{ touchAction: "none", cursor: "grab" }}
      camera={{
        position: land ? [11, 7.5, cameraZ] : [0, 0.55, cameraZ],
        fov: 40,
        near: 0.1,
        far: 160,
      }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
        preserveDrawingBuffer: true,
      }}
      shadows={false}
      frameloop="always"
      onCreated={({ gl }) => {
        gl.setClearColor("#050814")
        bindGlLog(gl)
        console.info("[geo-quest] WebGL", gl.getContext().getParameter(gl.getContext().VERSION))
      }}
      onPointerMissed={() => undefined}
    >
      {children}
    </Canvas>
  )
}
