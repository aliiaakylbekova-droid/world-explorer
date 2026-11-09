import { useThree } from "@react-three/fiber"
import { useEffect, useRef, type RefObject } from "react"
import { Raycaster, Vector2, type Mesh } from "three"
import { audio } from "../audio/AudioManager"
import { pickCountry } from "../geo/catalog"
import { vecToLatLng } from "./geo"

const DRAG_PX = 10

export function GlobePick({
  mesh,
  features,
  onPick,
  enabled,
}: {
  mesh: RefObject<Mesh | null>
  features: GeoJSON.Feature[]
  onPick: (hit: { iso: string | null; lat: number; lng: number }) => void
  enabled: boolean
}) {
  const { camera, gl } = useThree()
  const raycaster = useRef(new Raycaster())
  const down = useRef<{ x: number; y: number } | null>(null)
  const featuresRef = useRef(features)
  const pickRef = useRef(onPick)
  const globeRef = useRef<Mesh | null>(null)
  const enabledRef = useRef(enabled)
  featuresRef.current = features
  pickRef.current = onPick
  globeRef.current = mesh.current
  enabledRef.current = enabled

  useEffect(() => {
    const el = gl.domElement
    el.style.touchAction = "none"
    el.style.cursor = "grab"

    const onDown = (e: PointerEvent) => {
      if (!enabledRef.current || e.button !== 0) return
      audio.unlock()
      down.current = { x: e.clientX, y: e.clientY }
      el.style.cursor = "grabbing"
    }

    const onUp = (e: PointerEvent) => {
      el.style.cursor = "grab"
      const start = down.current
      down.current = null
      if (!enabledRef.current || !start) return
      const dx = e.clientX - start.x
      const dy = e.clientY - start.y
      if (dx * dx + dy * dy > DRAG_PX * DRAG_PX) return
      const globe = mesh.current ?? globeRef.current
      if (!globe) return
      const rect = el.getBoundingClientRect()
      const ndc = new Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.current.setFromCamera(ndc, camera)
      const hits = raycaster.current.intersectObject(globe, false)
      if (!hits.length) return
      const local = globe.worldToLocal(hits[0].point.clone())
      const { lat, lng } = vecToLatLng(local)
      const iso = pickCountry(lng, lat, featuresRef.current)
      pickRef.current({ iso, lat, lng })
    }

    const onLeave = () => {
      down.current = null
      el.style.cursor = "grab"
    }

    el.addEventListener("pointerdown", onDown)
    el.addEventListener("pointerup", onUp)
    el.addEventListener("pointercancel", onLeave)
    el.addEventListener("pointerleave", onLeave)
    return () => {
      el.removeEventListener("pointerdown", onDown)
      el.removeEventListener("pointerup", onUp)
      el.removeEventListener("pointercancel", onLeave)
      el.removeEventListener("pointerleave", onLeave)
    }
  }, [camera, gl])

  return null
}
