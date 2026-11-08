export type Ring = number[][]

function ringContains(ring: Ring, lng: number, lat: number) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const xi = ring[i][0]
    const yi = ring[i][1]
    const xj = ring[j][0]
    const yj = ring[j][1]
    const hit = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi + 0.0000001) + xi
    if (hit) inside = !inside
  }
  return inside
}

export function polygonContains(rings: Ring[], lng: number, lat: number) {
  if (!rings[0] || !ringContains(rings[0], lng, lat)) return false
  for (let i = 1; i < rings.length; i += 1) {
    if (ringContains(rings[i], lng, lat)) return false
  }
  return true
}

export function featureContains(geometry: GeoJSON.Geometry, lng: number, lat: number): boolean {
  if (geometry.type === "Polygon") return polygonContains(geometry.coordinates as Ring[], lng, lat)
  if (geometry.type === "MultiPolygon") {
    return (geometry.coordinates as Ring[][]).some((poly) => polygonContains(poly, lng, lat))
  }
  return false
}
