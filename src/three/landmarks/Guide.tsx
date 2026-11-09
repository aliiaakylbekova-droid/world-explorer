import { Html } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import type { Group } from "three"

export function Guide({
  position,
  speech,
  speaking,
}: {
  position: [number, number, number]
  speech: string
  speaking: boolean
}) {
  const group = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.getElapsedTime()
    group.current.position.y = position[1] + Math.sin(t * 2.2) * 0.03
    group.current.rotation.y = Math.sin(t * 1.4) * 0.15
  })
  return (
    <group ref={group} position={position}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.12, 0.36, 8]} />
        <meshStandardMaterial color="#2b4c7e" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <sphereGeometry args={[0.11, 12, 10]} />
        <meshStandardMaterial color="#e2c2a0" roughness={0.5} />
      </mesh>
      <mesh position={[0.16, 0.3, 0.02] } rotation={[0, 0, -0.7]}>
        <cylinderGeometry args={[0.03, 0.03, 0.22, 6]} />
        <meshStandardMaterial color="#e2c2a0" />
      </mesh>
      {speaking && speech ? (
        <Html position={[0.55, 0.78, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div className="guide-bubble" data-guide="speech">
            {speech}
          </div>
        </Html>
      ) : null}
    </group>
  )
}
