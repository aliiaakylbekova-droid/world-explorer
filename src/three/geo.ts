import { Vector3 } from "three"

export function latLngToVec(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

export function vecToLatLng(v: Vector3) {
  const n = v.clone().normalize()
  const lat = 90 - (Math.acos(n.y) * 180) / Math.PI
  const lng = (Math.atan2(n.z, -n.x) * 180) / Math.PI
  return { lat, lng }
}
