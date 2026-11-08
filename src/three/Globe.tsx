import { OrbitControls } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import { AdditiveBlending, BackSide, SRGBColorSpace, CanvasTexture, Vector3 } from "three"
import { COUNTRIES, type ContinentId } from "../data/world"
import { makeEarthTexture } from "./earthTexture"
import { latLngToVec, vecToLatLng } from "./geo"

type Props = {
  continent: ContinentId
  countryId: string | null
  onPickCountry: (id: string) => void
  interactive?: boolean
}

function Earth({
  continent,
  countryId,
  onPickCountry,
}: {
  continent: ContinentId
  countryId: string | null
  onPickCountry: (id: string) => void
}) {
  const texture = useMemo(() => {
    const map = new CanvasTexture(makeEarthTexture())
    map.colorSpace = SRGBColorSpace
    return map
  }, [])

  const { camera } = useThree()
  const target = useRef(new Vector3(0, 0, 4.6))
  const fly = useRef(0)

  useEffect(() => {
    const country = COUNTRIES.find((c) => c.id === countryId)
    if (country) {
      target.current.copy(latLngToVec(country.lat, country.lng, 4.2))
    } else {
      const table: Record<ContinentId, { lat: number; lng: number; z: number }> = {
        asia: { lat: 34, lng: 85, z: 4.4 },
        europe: { lat: 50, lng: 15, z: 3.8 },
        africa: { lat: 2, lng: 20, z: 4.4 },
        "north-america": { lat: 45, lng: -100, z: 4.6 },
        "south-america": { lat: -15, lng: -58, z: 4.4 },
        oceania: { lat: -25, lng: 135, z: 4.2 },
        antarctica: { lat: -78, lng: 0, z: 4.8 },
      }
      const aim = table[continent]
      target.current.copy(latLngToVec(aim.lat, aim.lng, aim.z))
    }
    fly.current = 1
  }, [continent, countryId])

  useFrame((_, dt) => {
    if (fly.current <= 0) return
    fly.current = Math.max(0, fly.current - dt * 0.85)
    camera.position.lerp(target.current, Math.min(1, dt * 2.4))
    camera.lookAt(0, 0, 0)
  })

  return (
    <group>
      <mesh
        onClick={(event) => {
          event.stopPropagation()
          const { lat, lng } = vecToLatLng(event.point)
          let best = COUNTRIES[0]
          let dist = Infinity
          for (const c of COUNTRIES) {
            const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2
            if (d < dist) {
              dist = d
              best = c
            }
          }
          if (dist < 400) onPickCountry(best.id)
        }}
      >
        <sphereGeometry args={[1.7, 64, 64]} />
        <meshStandardMaterial map={texture} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh scale={1.06}>
        <sphereGeometry args={[1.7, 48, 48]} />
        <meshBasicMaterial color="#5ce1d0" transparent opacity={0.12} blending={AdditiveBlending} side={BackSide} />
      </mesh>
      <group>
        {COUNTRIES.map((c) => {
          const p = latLngToVec(c.lat, c.lng, 1.74)
          const active = c.id === countryId
          return (
            <mesh
              key={c.id}
              position={p}
              onClick={(event) => {
                event.stopPropagation()
                onPickCountry(c.id)
              }}
            >
              <sphereGeometry args={[active ? 0.055 : 0.032, 12, 12]} />
              <meshStandardMaterial
                color={active ? "#e8c547" : "#2ec4b6"}
                emissive={active ? "#e8c547" : "#2ec4b6"}
                emissiveIntensity={active ? 0.8 : 0.35}
              />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

export function Globe({ continent, countryId, onPickCountry, interactive = true }: Props) {
  return (
    <Canvas camera={{ position: [0, 0.4, 4.6], fov: 42 }} dpr={[1, 2]}>
      <color attach="background" args={["#07162b"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 3, 2]} intensity={1.35} color="#fff4d2" />
      <directionalLight position={[-3, -1, -2]} intensity={0.45} color="#2ec4b6" />
      <Earth continent={continent} countryId={countryId} onPickCountry={onPickCountry} />
      <OrbitControls
        enablePan={false}
        enableZoom={interactive}
        minDistance={2.6}
        maxDistance={7.5}
        rotateSpeed={0.55}
        zoomSpeed={0.7}
      />
    </Canvas>
  )
}
