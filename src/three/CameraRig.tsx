import { useThree } from "@react-three/fiber"
import { useLayoutEffect } from "react"

export function CameraRig({ mode }: { mode: "earth" | "land" }) {
  const { gl } = useThree()
  useLayoutEffect(() => {
    gl.setClearColor(mode === "land" ? "#9ec7e6" : "#07101c")
  }, [mode, gl])
  return null
}
