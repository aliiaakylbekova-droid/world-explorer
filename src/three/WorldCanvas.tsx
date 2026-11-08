import { Canvas, useThree } from "@react-three/fiber"
import { useEffect, type ReactNode } from "react"

function Disposer() {
  const { gl, scene } = useThree()
  useEffect(() => {
    return () => {
      scene.traverse((obj) => {
        const mesh = obj as { geometry?: { dispose: () => void }; material?: { dispose: () => void } | { dispose: () => void }[] }
        mesh.geometry?.dispose()
        const mat = mesh.material
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else mat?.dispose()
      })
      gl.dispose()
    }
  }, [gl, scene])
  return null
}

export function WorldCanvas({
  children,
  cameraZ = 6.2,
}: {
  children: ReactNode
  cameraZ?: number
}) {
  return (
    <Canvas
      className="world-canvas"
      camera={{
        position: cameraZ > 8 ? [11, 7.5, cameraZ] : [0, 0.35, cameraZ],
        fov: 40,
        near: 0.1,
        far: 80,
      }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      shadows
      onCreated={({ gl }) => {
        gl.setClearColor("#061018")
      }}
    >
      <Disposer />
      {children}
    </Canvas>
  )
}
