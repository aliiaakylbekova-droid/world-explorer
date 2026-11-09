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
  type Group,
  type LineBasicMaterial,
  type Mesh,
} from "three"
import { useGame } from "../store/gameStore"
import type { CountryRecord, NamedLine } from "../geo/catalog"
import { isoOf, type Place } from "../geo/catalog"
import { getCatalog, pickCountry } from "../geo/catalog"
import { EARTH_R, cameraFor, geometryFromGeoJSON, vecToLatLng } from "./geo"
import { GlobePick } from "./GlobePick"

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
    <mesh raycast={() => undefined}>
      <sphereGeometry args={[EARTH_R + 0.012, 64, 48]} />
      <meshBasicMaterial map={tex} transparent opacity={0.28} depthWrite={false} />
    </mesh>
  )
}

function Atmosphere() {
  return (
    <mesh scale={1.045} raycast={() => undefined}>
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
  const introPhase = useGame((s) => s.introPhase)
  const finishIntro = useGame((s) => s.finishIntro)
  const hitTint = useGame((s) => s.hitTint)
  const spinBoost = useGame((s) => s.spinBoost)
  const campaignPhase = useGame((s) => s.campaignPhase)
  const earth = useRef<Group>(null)
  const globeMesh = useRef<Mesh>(null)
  const fly = useRef(0)
  const target = useRef(new Vector3(0, 0.4, 6.2))
  const look = useRef(new Vector3(0, 0, 0))
  const far = useRef(new Vector3(0, 0.55, 11.2))
  const near = useRef(new Vector3(0, 0.42, 6.35))
  const introClock = useRef(0)
  const introDone = useRef(false)
  const boost = useRef(0)
  const outline = useRef(new Color("#5ee7ff"))
  const outlineMat = useRef<LineBasicMaterial>(null)
  const flying = useRef(false)

  useEffect(() => {
    if (!flyTo || introPhase !== "ready") return
    target.current.copy(cameraFor(flyTo.lat, flyTo.lng, flyTo.dist))
    fly.current = 1
    flying.current = true
  }, [flyTo, introPhase])

  useEffect(() => {
    boost.current = spinBoost
  }, [spinBoost])

  useFrame((_, dt) => {
    const playing = introPhase === "ready"
    const easeStop = campaignPhase === "correct" || campaignPhase === "success"
    const spin = playing ? (easeStop ? boost.current * 0.35 : 0) : 0.09
    boost.current = Math.max(0, boost.current - dt * (easeStop ? 0.55 : 0.12))
    if (earth.current && spin > 0.0001) earth.current.rotation.y += dt * spin
    if (sun.current) sun.current.position.copy(camera.position)

    const want =
      hitTint === "gold" ? "#e8c547" : hitTint === "red" ? "#ff6a3d" : hitTint === "orange" ? "#ff9a4a" : "#5ee7ff"
    outline.current.lerp(new Color(want), 1 - Math.exp(-dt * 8))
    if (outlineMat.current) outlineMat.current.color.copy(outline.current)

    if (introPhase !== "ready") {
      const goal = introPhase === "approach" ? near.current : far.current
      camera.position.lerp(goal, 1 - Math.exp(-dt * (introPhase === "approach" ? 0.62 : 1.05)))
      camera.lookAt(look.current)
      if (introPhase === "approach") {
        introClock.current += dt
        if (!introDone.current && (introClock.current > 3.05 || camera.position.distanceTo(goal) < 0.14)) {
          introDone.current = true
          finishIntro()
        }
      }
      return
    }

    if (fly.current > 0) {
      camera.position.lerp(target.current, 1 - Math.exp(-dt * 0.85))
      camera.lookAt(look.current)
      if (camera.position.distanceTo(target.current) < 0.04) {
        fly.current = 0
        flying.current = false
      }
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
      <color attach="background" args={["#050814"]} />
      <ambientLight intensity={0.62} />
      <hemisphereLight args={[new Color("#9ec9ff"), new Color("#1a120c"), 0.35]} />
      <directionalLight ref={sun} intensity={2.15} color="#fff4d6" castShadow position={[8, 3, 4]} />
      <Stars radius={48} depth={24} count={1600} factor={2.2} fade speed={0.25} />
      <GlobePick
        mesh={globeMesh}
        features={features}
        onPick={onPick}
        enabled={introPhase === "ready" && campaignPhase !== "transition" && campaignPhase !== "correct" && campaignPhase !== "success"}
      />
      <group ref={earth}>
      <mesh
        ref={globeMesh}
        onPointerMove={(e) => {
          const local = e.object.worldToLocal(e.point.clone())
          const { lat, lng } = vecToLatLng(local)
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
          <lineBasicMaterial ref={outlineMat} color="#5ee7ff" transparent opacity={0.98} />
        </lineSegments>
      ) : null}
      </group>
      <OrbitControls
        enablePan={false}
        enabled={introPhase === "ready" && campaignPhase !== "transition" && campaignPhase !== "correct" && campaignPhase !== "success"}
        minDistance={2.45}
        maxDistance={12}
        zoomSpeed={0.45}
        rotateSpeed={0.55}
        enableDamping
        dampingFactor={0.078}
      />
    </group>
  )
}
