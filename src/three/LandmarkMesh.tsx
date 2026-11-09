import { useMemo } from "react"
import type { LandmarkKind } from "../data/world"

type Props = {
  kind: LandmarkKind
  id: string
}

const gold = {
  color: "#e8c547",
  metalness: 0.55,
  roughness: 0.28,
  emissive: "#7a5a12",
  emissiveIntensity: 0.18,
} as const

export function LandmarkMesh({ kind, id }: Props) {
  const palette = useMemo(() => {
    if (id.includes("taj") || id.includes("hagia") || id.includes("opera")) return "#f4f7fb"
    if (id.includes("giza") || id.includes("sphinx")) return "#d7b07a"
    if (id.includes("eiffel") || id.includes("bigben")) return "#c4a882"
    if (id.includes("wall") || id.includes("pagoda")) return "#c45c48"
    if (id.includes("burana") || id.includes("kalyan")) return "#c98a4a"
    if (id.includes("baiterek")) return "#9fd7e8"
    if (id.includes("darvaza")) return "#ff6a22"
    if (id.includes("fuji") || id.includes("ice") || id.includes("pobeda") || id.includes("somoni")) return "#e8eef6"
    if (id.includes("issyk") || id.includes("baikal") || id.includes("amazon")) return "#2ec4b6"
    if (id.includes("liberty")) return "#7fd0c0"
    return "#d7e4f2"
  }, [id])

  if (kind === "pyramid") {
    return (
      <group>
        <mesh position={[0, 0.7, 0]}>
          <coneGeometry args={[1.4, 1.6, 4]} />
          <meshStandardMaterial color={palette} roughness={0.7} />
        </mesh>
        <mesh position={[1.5, 0.4, 0.4]}>
          <coneGeometry args={[0.7, 0.9, 4]} />
          <meshStandardMaterial color="#c9a066" roughness={0.75} />
        </mesh>
        <mesh position={[-1.3, 0.3, 0.6]} rotation={[0, 0.4, 0]}>
          <boxGeometry args={[0.7, 0.5, 1.1]} />
          <meshStandardMaterial color="#c4a070" />
        </mesh>
      </group>
    )
  }

  if (kind === "tower") {
    const tall = id.includes("eiffel")
    return (
      <group>
        <mesh position={[0, tall ? 1.6 : 1.1, 0]}>
          <cylinderGeometry args={tall ? [0.04, 0.55, 3.2, 4] : [0.12, 0.32, 2.2, 8]} />
          <meshStandardMaterial color={palette} metalness={0.35} roughness={0.4} />
        </mesh>
        {id.includes("baiterek") ? (
          <mesh position={[0, 2.35, 0]}>
            <sphereGeometry args={[0.28, 24, 24]} />
            <meshStandardMaterial {...gold} />
          </mesh>
        ) : (
          <mesh position={[0, tall ? 3.2 : 2.2, 0]}>
            <coneGeometry args={[0.16, 0.4, 8]} />
            <meshStandardMaterial {...gold} />
          </mesh>
        )}
        {tall ? (
          <>
            <mesh position={[0, 0.55, 0]}>
              <torusGeometry args={[0.42, 0.04, 8, 16]} />
              <meshStandardMaterial color={palette} />
            </mesh>
            <mesh position={[0, 1.4, 0]}>
              <torusGeometry args={[0.22, 0.035, 8, 16]} />
              <meshStandardMaterial color={palette} />
            </mesh>
          </>
        ) : null}
      </group>
    )
  }

  if (kind === "dome") {
    return (
      <group>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[1.6, 0.9, 1.6]} />
          <meshStandardMaterial color={palette} roughness={0.35} />
        </mesh>
        <mesh position={[0, 1.15, 0]}>
          <sphereGeometry args={[0.7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#7ee0d6" metalness={0.2} roughness={0.25} />
        </mesh>
        <mesh position={[0, 1.85, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
          <meshStandardMaterial {...gold} />
        </mesh>
        {[-0.85, 0.85].map((x) => (
          <mesh key={x} position={[x, 0.9, -0.85]}>
            <cylinderGeometry args={[0.08, 0.1, 1.4, 10]} />
            <meshStandardMaterial color={palette} />
          </mesh>
        ))}
      </group>
    )
  }

  if (kind === "statue") {
    return (
      <group>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.5, 0.6, 0.4, 8]} />
          <meshStandardMaterial color="#8aa0b8" />
        </mesh>
        <mesh position={[0, 1.05, 0]}>
          <capsuleGeometry args={[0.22, 1.1, 8, 16]} />
          <meshStandardMaterial color={palette} metalness={0.4} roughness={0.35} />
        </mesh>
        <mesh position={[0.35, 1.6, 0]} rotation={[0, 0, -0.6]}>
          <boxGeometry args={[0.12, 0.7, 0.12]} />
          <meshStandardMaterial color={palette} />
        </mesh>
        <mesh position={[0, 1.85, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color={palette} />
        </mesh>
      </group>
    )
  }

  if (kind === "wall") {
    return (
      <group>
        {[-1.4, -0.45, 0.5, 1.4].map((x, i) => (
          <mesh key={x} position={[x, 0.35 + i * 0.08, i * 0.12]}>
            <boxGeometry args={[0.95, 0.55, 0.35]} />
            <meshStandardMaterial color={palette} roughness={0.8} />
          </mesh>
        ))}
        {[-1.4, -0.45, 0.5, 1.4].map((x) => (
          <mesh key={`t-${x}`} position={[x, 0.72, 0]}>
            <boxGeometry args={[0.22, 0.28, 0.22]} />
            <meshStandardMaterial color="#a34b3a" />
          </mesh>
        ))}
      </group>
    )
  }

  if (kind === "mountain") {
    return (
      <group>
        <mesh position={[0, 0.8, 0]}>
          <coneGeometry args={[1.3, 2.0, 5]} />
          <meshStandardMaterial color="#8ea4b8" roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.55, 0]}>
          <coneGeometry args={[0.45, 0.7, 5]} />
          <meshStandardMaterial color="#f7fbff" />
        </mesh>
        <mesh position={[-0.9, 0.45, 0.3]}>
          <coneGeometry args={[0.7, 1.1, 5]} />
          <meshStandardMaterial color="#7b93a8" />
        </mesh>
      </group>
    )
  }

  if (kind === "lake") {
    return (
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <circleGeometry args={[1.4, 32]} />
          <meshStandardMaterial color={palette} metalness={0.3} roughness={0.15} emissive="#145c66" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[-1.1, 0.4, -0.4]}>
          <coneGeometry args={[0.5, 0.9, 5]} />
          <meshStandardMaterial color="#6d8b6a" />
        </mesh>
        <mesh position={[1.0, 0.35, 0.5]}>
          <coneGeometry args={[0.4, 0.8, 5]} />
          <meshStandardMaterial color="#5f7f63" />
        </mesh>
      </group>
    )
  }

  if (kind === "pagoda") {
    return (
      <group>
        {[0.4, 0.9, 1.35, 1.75].map((y, i) => (
          <mesh key={y} position={[0, y, 0]}>
            <cylinderGeometry args={[0.55 - i * 0.1, 0.6 - i * 0.1, 0.18, 6]} />
            <meshStandardMaterial color={palette} />
          </mesh>
        ))}
        <mesh position={[0, 2.05, 0]}>
          <coneGeometry args={[0.18, 0.35, 6]} />
          <meshStandardMaterial {...gold} />
        </mesh>
      </group>
    )
  }

  if (kind === "fire") {
    return (
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.2, 24]} />
          <meshStandardMaterial color="#5a3a28" />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <coneGeometry args={[0.45, 1.2, 8]} />
          <meshStandardMaterial color="#ff7a1a" emissive="#ff4d00" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <coneGeometry args={[0.22, 0.7, 8]} />
          <meshStandardMaterial color="#ffe08a" emissive="#ffd166" emissiveIntensity={0.9} />
        </mesh>
      </group>
    )
  }

  if (kind === "yurt") {
    return (
      <group>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.9, 1.0, 0.9, 16]} />
          <meshStandardMaterial color="#efe6d2" />
        </mesh>
        <mesh position={[0, 0.95, 0]}>
          <sphereGeometry args={[0.9, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#e8c547" />
        </mesh>
        <mesh position={[0, 0.35, 0.95]}>
          <boxGeometry args={[0.28, 0.5, 0.08]} />
          <meshStandardMaterial color="#6b3f24" />
        </mesh>
      </group>
    )
  }

  return (
    <group>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.6, 1.4, 0.4]} />
        <meshStandardMaterial color={palette} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <boxGeometry args={[1.2, 0.25, 0.5]} />
        <meshStandardMaterial color="#e8c547" />
      </mesh>
    </group>
  )
}
