import { OrbitControls, Stars } from "@react-three/drei"
import { useFrame, useLoader, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import {
  AdditiveBlending,
  BackSide,
  CanvasTexture,
  Color,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  type DirectionalLight,
} from "three"
import type { CountryRecord, NamedLine } from "../geo/catalog"
import { isoOf, type Place } from "../geo/catalog"
import { getCatalog, pickCountry } from "../geo/catalog"
import { EARTH_R, cameraFor, geometryFromGeoJSON, vecToLatLng } from "./geo"

export type Layers = {
  relief: boolean
  rivers: boolean
  borders: boolean
  capitals: boolean
  climate: boolean
}

type Props = {
  features: GeoJSON.Feature[]
  countries: CountryRecord[]
  cities: Place[]
  rivers: NamedLine[]
  lakes: NamedLine[]
  marine: NamedLine[]
  mountains: NamedLine[]
  selectedIso: string | null
  highlightIso: string | null
  layers: Layers
  flyTo: { lat: number; lng: number; dist: number } | null
  lod: number
  onPick: (hit: { iso: string | null; lat: number; lng: number }) => void
  onHover?: (hit: { iso: string | null; name: string | null; x: number; y: number } | null) => void
}

function ClimateShell({ on }: { on: boolean }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 1024
    c.height = 512
    const ctx = c.getContext("2d")
    if (!ctx) return null
    const bands = [
      [0, "#d8ecff"],
      [0.12, "#7eb3e8"],
      [0.28, "#8fce7a"],
      [0.42, "#e3c96a"],
      [0.5, "#d9894a"],
      [0.58, "#e3c96a"],
      [0.72, "#8fce7a"],
      [0.88, "#7eb3e8"],
      [1, "#d8ecff"],
    ]
    const g = ctx.createLinearGradient(0, 0, 0, 512)
    for (const [s, col] of bands) g.addColorStop(s as number, col as string)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 1024, 512)
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    return t
  }, [])
  if (!on || !tex) return null
  return (
    <mesh>
      <sphereGeometry args={[EARTH_R + 0.012, 64, 48]} />
      <meshBasicMaterial map={tex} transparent opacity={0.28} depthWrite={false} />
    </mesh>
  )
}

function Atmosphere() {
  return (
    <mesh scale={1.045}>
      <sphereGeometry args={[EARTH_R, 64, 48]} />
      <meshBasicMaterial color="#7ec8ff" transparent opacity={0.14} blending={AdditiveBlending} side={BackSide} />
    </mesh>
  )
}

export function EarthScene({
  features,
  countries: _countries,
  cities: _cities,
  rivers,
  lakes: _lakes,
  marine: _marine,
  mountains: _mountains,
  selectedIso,
  highlightIso,
  layers,
  flyTo,
  lod: _lod,
  onPick,
  onHover,
}: Props) {
  const day = useLoader(TextureLoader, `${import.meta.env.BASE_URL}textures/earth-day.jpg`)
  const bump = useLoader(TextureLoader, `${import.meta.env.BASE_URL}textures/earth-bump.jpg`)
  day.colorSpace = SRGBColorSpace
  const sun = useRef<DirectionalLight>(null)
  const { camera } = useThree()
  const fly = useRef(0)
  const target = useRef(new Vector3(0, 0.4, 6.2))
  const look = useRef(new Vector3(0, 0, 0))

  useEffect(() => {
    if (!flyTo) return
    target.current.copy(cameraFor(flyTo.lat, flyTo.lng, flyTo.dist))
    fly.current = 1
  }, [flyTo])

  useFrame((_, dt) => {
    if (sun.current) sun.current.position.copy(camera.position)
    if (fly.current > 0) {
      fly.current = Math.max(0, fly.current - dt * 0.7)
      camera.position.lerp(target.current, Math.min(1, dt * 1.8))
      camera.lookAt(look.current)
    }
  })

  const borderGeo = useMemo(() => geometryFromGeoJSON(features, EARTH_R + 0.006), [features])
  const riverGeo = useMemo(() => {
    const fake: GeoJSON.Feature[] = rivers
      .filter((r) => r.coords && r.coords.length > 1)
      .map((r) => ({
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: r.coords! },
      }))
    return geometryFromGeoJSON(fake, EARTH_R + 0.01)
  }, [rivers])

  const selectedFeature = features.find((f) => isoOf(f) === (highlightIso || selectedIso))
  const selectedGeo = useMemo(
    () => (selectedFeature ? geometryFromGeoJSON([selectedFeature], EARTH_R + 0.011) : null),
    [selectedFeature],
  )

  const lastHover = useRef<string | null>(null)

  return (
    <group>
      <color attach="background" args={["#07101c"]} />
      <ambientLight intensity={0.62} />
      <hemisphereLight args={[new Color("#9ec9ff"), new Color("#1a120c"), 0.35]} />
      <directionalLight ref={sun} intensity={2.15} color="#fff4d6" castShadow position={[8, 3, 4]} />
      <Stars radius={40} depth={20} count={1200} factor={2} fade speed={0.4} />
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          const { lat, lng } = vecToLatLng(e.point)
          const iso = pickCountry(lng, lat, features)
          onPick({ iso, lat, lng })
        }}
        onPointerMove={(e) => {
          const { lat, lng } = vecToLatLng(e.point)
          const iso = pickCountry(lng, lat, features)
          lastHover.current = iso
          const rec = iso ? getCatalog()?.byIso.get(iso) : undefined
          const ne = e.nativeEvent as PointerEvent
          const x = e.clientX || ne.clientX || 0
          const y = e.clientY || ne.clientY || 0
          onHover?.(rec ? { iso, name: rec.name, x, y } : null)
        }}
        onPointerOut={() => {
          lastHover.current = null
          onHover?.(null)
        }}
      >
        <sphereGeometry args={[EARTH_R, 96, 64]} />
        <meshStandardMaterial
          map={day}
          bumpMap={layers.relief ? bump : null}
          bumpScale={layers.relief ? 0.045 : 0}
          roughness={0.72}
          metalness={0.04}
          color="#ffffff"
        />
      </mesh>
      <Atmosphere />
      <ClimateShell on={layers.climate} />
      {layers.borders ? (
        <lineSegments geometry={borderGeo}>
          <lineBasicMaterial color="#f2e6c2" transparent opacity={0.55} />
        </lineSegments>
      ) : null}
      {layers.rivers ? (
        <lineSegments geometry={riverGeo}>
          <lineBasicMaterial color="#7ad7ff" transparent opacity={0.85} />
        </lineSegments>
      ) : null}
      {selectedGeo ? (
        <lineSegments geometry={selectedGeo}>
          <lineBasicMaterial color="#5ee7ff" transparent opacity={0.95} />
        </lineSegments>
      ) : null}
      <OrbitControls
        enablePan={false}
        minDistance={2.35}
        maxDistance={10}
        zoomSpeed={0.7}
        rotateSpeed={0.42}
        enableDamping
        dampingFactor={0.06}
      />
    </group>
  )
}
