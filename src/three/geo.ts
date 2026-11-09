import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three"

export const EARTH_R = 2

export function latLngToVec(lat: number, lng: number, radius = EARTH_R) {
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
  const lat = 90 - (Math.acos(Math.min(1, Math.max(-1, n.y))) * 180) / Math.PI
  const lng = (Math.atan2(n.z, -n.x) * 180) / Math.PI
  return { lat, lng }
}

export function cameraFor(lat: number, lng: number, dist: number) {
  return latLngToVec(lat, lng, dist)
}

function pushLine(positions: number[], coords: number[][], radius: number) {
  for (let i = 0; i < coords.length - 1; i += 1) {
    const a = latLngToVec(coords[i][1], coords[i][0], radius)
    const b = latLngToVec(coords[i + 1][1], coords[i + 1][0], radius)
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z)
  }
}

export function geometryFromGeoJSON(features: GeoJSON.Feature[], radius = EARTH_R + 0.008) {
  const positions: number[] = []
  for (const feature of features) {
    const g = feature.geometry
    if (!g) continue
    if (g.type === "LineString") pushLine(positions, g.coordinates as number[][], radius)
    else if (g.type === "MultiLineString") {
      for (const line of g.coordinates as number[][][]) pushLine(positions, line, radius)
    } else if (g.type === "Polygon") {
      for (const ring of g.coordinates) pushLine(positions, ring as number[][], radius)
    } else if (g.type === "MultiPolygon") {
      for (const poly of g.coordinates) {
        for (const ring of poly) pushLine(positions, ring as number[][], radius)
      }
    }
  }
  const geo = new BufferGeometry()
  geo.setAttribute("position", new Float32BufferAttribute(positions, 3))
  return geo
}
