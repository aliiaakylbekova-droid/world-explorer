import { useThree } from "@react-three/fiber"
import { useEffect, useRef, type RefObject } from "react"
import { Raycaster, Vector2, type Camera, type Mesh } from "three"
import { audio } from "../audio/AudioManager"
import { getCatalog, pickCountry } from "../geo/catalog"
import { vecToLatLng } from "./geo"

const DRAG_PX = 10

function hitGlobe(mesh: Mesh, camera: Camera, raycaster: Raycaster, clientX: number, clientY: number, el: HTMLElement) {
  mesh.updateMatrixWorld(true)
  const rect = el.getBoundingClientRect()
  const ndc = new Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1)
  raycaster.setFromCamera(ndc, camera)
  const hits = raycaster.intersectObject(mesh, false)
  if (!hits.length) return null
  const local = mesh.worldToLocal(hits[0].point.clone())
  return vecToLatLng(local)
}

export function GlobePick({
  mesh,
  features,
  onPick,
  onHover,
  enabled,
}: {
  mesh: RefObject<Mesh | null>
  features: GeoJSON.Feature[]
  onPick: (hit: { iso: string | null; lat: number; lng: number }) => void
  onHover?: (hit: { iso: string | null; name: string | null; x: number; y: number } | null) => void
  enabled: boolean
}) {
  const { camera, gl } = useThree()
  const raycaster = useRef(new Raycaster())
  const down = useRef<{ x: number; y: number } | null>(null)
  const featuresRef = useRef(features)
  const pickRef = useRef(onPick)
  const hoverRef = useRef(onHover)
  const globeRef = useRef<Mesh | null>(null)
  const enabledRef = useRef(enabled)
  featuresRef.current = features
  pickRef.current = onPick
  hoverRef.current = onHover
  globeRef.current = mesh.current
  enabledRef.current = enabled

  useEffect(() => {
    const el = gl.domElement
    el.style.touchAction = "none"
    el.style.cursor = "grab"

    const countryAt = (clientX: number, clientY: number) => {
      const globe = mesh.current ?? globeRef.current
      if (!globe) return null
      const ll = hitGlobe(globe, camera, raycaster.current, clientX, clientY, el)
      if (!ll) return null
      const iso = pickCountry(ll.lng, ll.lat, featuresRef.current)
      return { ...ll, iso }
    }

    const onDown = (e: PointerEvent) => {
      if (!enabledRef.current || e.button !== 0) return
      audio.unlock()
      down.current = { x: e.clientX, y: e.clientY }
      el.style.cursor = "grabbing"
    }

    const onMove = (e: PointerEvent) => {
      if (!enabledRef.current) return
      const hit = countryAt(e.clientX, e.clientY)
      if (!hit?.iso) {
        hoverRef.current?.(null)
        return
      }
      const rec = getCatalog()?.byIso.get(hit.iso)
      hoverRef.current?.({ iso: hit.iso, name: rec?.name ?? hit.iso, x: e.clientX, y: e.clientY })
    }

    const onUp = (e: PointerEvent) => {
      el.style.cursor = "grab"
      const start = down.current
      down.current = null
      if (!enabledRef.current || !start) return
      const dx = e.clientX - start.x
      const dy = e.clientY - start.y
      if (dx * dx + dy * dy > DRAG_PX * DRAG_PX) return
      const hit = countryAt(e.clientX, e.clientY)
      if (!hit) return
      pickRef.current({ iso: hit.iso, lat: hit.lat, lng: hit.lng })
    }

    const onLeave = () => {
      down.current = null
      el.style.cursor = "grab"
      hoverRef.current?.(null)
    }

    el.addEventListener("pointerdown", onDown)
    el.addEventListener("pointermove", onMove)
    el.addEventListener("pointerup", onUp)
    el.addEventListener("pointercancel", onLeave)
    el.addEventListener("pointerleave", onLeave)
    return () => {
      el.removeEventListener("pointerdown", onDown)
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerup", onUp)
      el.removeEventListener("pointercancel", onLeave)
      el.removeEventListener("pointerleave", onLeave)
    }
  }, [camera, gl, mesh])

  return null
}
