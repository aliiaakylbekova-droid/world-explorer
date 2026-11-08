import { featureContains } from "./pip"

export type CountryRecord = {
  iso: string
  a3: string
  name: string
  nameEn: string
  continent: string
  subregion: string
  lat: number
  lng: number
  capital: string
  pop: number | null
}

export type Place = {
  name: string
  nameEn: string
  iso: string
  lat: number
  lng: number
  rank: number
  kind: string
}

export type NamedLine = {
  name: string
  kind: "river" | "lake" | "sea" | "ocean" | "mountain"
  lat: number
  lng: number
  coords?: [number, number][]
}

type Catalog = {
  countries: CountryRecord[]
  byIso: Map<string, CountryRecord>
  features: GeoJSON.Feature[]
  features50: GeoJSON.Feature[] | null
  cities: Place[]
  rivers: NamedLine[]
  lakes: NamedLine[]
  marine: NamedLine[]
  mountains: NamedLine[]
}

const base = import.meta.env.BASE_URL

async function loadJson<T>(path: string): Promise<T> {
  const res = await fetch(`${base}${path}`)
  if (!res.ok) throw new Error(path)
  return (await res.json()) as T
}

function centroid(coords: number[][]): [number, number] {
  let x = 0
  let y = 0
  const n = coords.length || 1
  for (const p of coords) {
    x += p[0]
    y += p[1]
  }
  return [x / n, y / n]
}

let catalog: Catalog | null = null
let pending: Promise<Catalog> | null = null

export function getCatalog() {
  return catalog
}

export function loadCatalog() {
  if (catalog) return Promise.resolve(catalog)
  if (pending) return pending
  pending = (async () => {
    const [c110, places, rivers110, rivers50, lakes, marine, elev, index] = await Promise.all([
      loadJson<GeoJSON.FeatureCollection>("geo/ne_110m_admin_0_countries.geojson"),
      loadJson<GeoJSON.FeatureCollection>("geo/ne_110m_populated_places.geojson"),
      loadJson<GeoJSON.FeatureCollection>("geo/ne_110m_rivers_lake_centerlines.geojson"),
      loadJson<GeoJSON.FeatureCollection>("geo/ne_50m_rivers_lake_centerlines.geojson").catch(() => ({ features: [] })),
      loadJson<GeoJSON.FeatureCollection>("geo/ne_110m_lakes.geojson"),
      loadJson<GeoJSON.FeatureCollection>("geo/ne_110m_geography_marine_polys.geojson"),
      loadJson<GeoJSON.FeatureCollection>("geo/ne_110m_geography_regions_elevation_points.geojson"),
      loadJson<{ countries: CountryRecord[]; cities: Place[] }>("geo/index.json"),
    ])

    const byIso = new Map<string, CountryRecord>(index.countries.map((c) => [c.iso, c]))
    const riverSrc = rivers50.features.length > 20 ? rivers50 : rivers110
    const rivers: NamedLine[] = riverSrc.features.flatMap((f) => {
      const name = String(f.properties?.name_ru || f.properties?.name || f.properties?.NAME || "")
      if (!name) return []
      const geom = f.geometry
      if (!geom) return []
      const line =
        geom.type === "LineString"
          ? (geom.coordinates as [number, number][])
          : geom.type === "MultiLineString"
            ? (geom.coordinates as [number, number][][])[0]
            : []
      if (!line?.length) return []
      const [lng, lat] = line[Math.floor(line.length / 2)]
      return [{ name, kind: "river" as const, lat, lng, coords: line }]
    })

    const lakeLines: NamedLine[] = lakes.features.map((f) => {
      const name = String(f.properties?.name_ru || f.properties?.NAME || f.properties?.name || "Озеро")
      const geom = f.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon
      const ring =
        geom.type === "Polygon" ? geom.coordinates[0] : geom.type === "MultiPolygon" ? geom.coordinates[0][0] : [[0, 0]]
      const [lng, lat] = centroid(ring as number[][])
      return { name, kind: "lake" as const, lat, lng, coords: ring as [number, number][] }
    })

    const marineLines: NamedLine[] = marine.features.map((f) => {
      const name = String(f.properties?.name_ru || f.properties?.name || f.properties?.NAME || "")
      const kind = String(f.properties?.featurecla || "").includes("ocean") ? "ocean" : "sea"
      const geom = f.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon
      const ring =
        geom.type === "Polygon" ? geom.coordinates[0] : geom.coordinates[0][0]
      const [lng, lat] = centroid(ring as number[][])
      return { name, kind: kind as "ocean" | "sea", lat, lng }
    })

    const mountains: NamedLine[] = elev.features
      .filter((f) => String(f.properties?.featurecla || "").includes("mountain") && f.geometry?.type === "Point")
      .map((f) => {
        const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates
        return {
          name: String(f.properties?.name_ru || f.properties?.name || f.properties?.NAME || "Гора"),
          kind: "mountain" as const,
          lat,
          lng,
        }
      })

    const cities: Place[] = places.features
      .filter((f) => f.geometry?.type === "Point")
      .map((f) => {
        const p = f.properties || {}
        const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates
        return {
          name: String(p.NAME_RU || p.NAME),
          nameEn: String(p.NAME || ""),
          iso: String(p.ISO_A2 || "").toUpperCase(),
          lat,
          lng,
          rank: Number(p.SCALERANK ?? 9),
          kind: String(p.FEATURECLA || ""),
        }
      })

    catalog = {
      countries: index.countries,
      byIso,
      features: c110.features,
      features50: null,
      cities,
      rivers,
      lakes: lakeLines,
      marine: marineLines,
      mountains,
    }
    return catalog
  })()
  return pending
}

export async function loadHiResCountries() {
  const cat = await loadCatalog()
  if (cat.features50) return cat
  const hi = await loadJson<GeoJSON.FeatureCollection>("geo/ne_50m_admin_0_countries.geojson")
  cat.features50 = hi.features
  return cat
}

export function isoOf(feature: GeoJSON.Feature) {
  const p = feature.properties || {}
  const raw = p.ISO_A2 !== "-99" ? p.ISO_A2 : p.ISO_A2_EH
  return String(raw || p.ADM0_A3 || "").toUpperCase()
}

export function pickCountry(lng: number, lat: number, features: GeoJSON.Feature[]) {
  for (const feature of features) {
    if (feature.geometry && featureContains(feature.geometry, lng, lat)) return isoOf(feature)
  }
  return null
}

export function pickNearestNamed(items: NamedLine[], lat: number, lng: number, maxD = 8) {
  let best: NamedLine | null = null
  let dist = maxD * maxD
  for (const item of items) {
    const d = (item.lat - lat) ** 2 + (item.lng - lng) ** 2
    if (d < dist) {
      dist = d
      best = item
    }
  }
  return best
}

export const NEIGHBORS: Record<string, string[]> = {
  KG: ["KZ", "UZ", "TJ", "CN"],
  KZ: ["RU", "CN", "KG", "UZ", "TM"],
  UZ: ["KZ", "KG", "TJ", "TM", "AF"],
  TJ: ["KG", "UZ", "CN", "AF"],
  TM: ["KZ", "UZ", "AF", "IR"],
  FR: ["BE", "LU", "DE", "CH", "IT", "ES"],
  EG: ["LY", "SD", "IL"],
  CN: ["RU", "MN", "KZ", "KG", "TJ", "IN", "PK", "MM", "VN", "KP"],
  US: ["CA", "MX"],
  RU: ["NO", "FI", "EE", "LV", "LT", "PL", "BY", "UA", "GE", "AZ", "KZ", "CN", "MN", "KP"],
  IN: ["PK", "CN", "NP", "BT", "BD", "MM"],
  DE: ["FR", "NL", "BE", "LU", "CH", "AT", "CZ", "PL", "DK"],
}

export const LANDMARKS = [
  {
    id: "issyk",
    country: "KG",
    name: "Иссык-Куль и Тянь-Шань",
    lat: 42.45,
    lng: 77.2,
    scene: "tian-shan" as const,
    fact: "Высокогорное солоноватое озеро. Глубина до 668 м, почти не замерзает.",
    points: [
      { title: "Зеркало озера", text: "Соль и глубина не дают льду покрыть всю акваторию." },
      { title: "Хребты Тянь-Шаня", text: "Снеговые вершины окружают котловину с севера и юга." },
      { title: "Шёлковый путь", text: "Через долины шли караваны между Китаем и Ферганой." },
    ],
  },
  {
    id: "eiffel",
    country: "FR",
    name: "Эйфелева башня",
    lat: 48.8584,
    lng: 2.2945,
    scene: "eiffel" as const,
    fact: "324 м. Решётчатая железная башня Гюстава Эйфеля, 1889 год.",
    points: [
      { title: "Решётка", text: "Ажур снижает парусность ветра — башня «дышит» в шторм." },
      { title: "Сены нет случайно", text: "Башня стоит у Марсова поля, на левом берегу Сены." },
      { title: "Париж", text: "Столица Франции — узел Западной Европы." },
    ],
  },
  {
    id: "giza",
    country: "EG",
    name: "Пирамиды Гизы и Сфинкс",
    lat: 29.9792,
    lng: 31.1342,
    scene: "giza" as const,
    fact: "Комплекс Древнего царства на плато Гиза у Каира, долина Нила.",
    points: [
      { title: "Хеопс", text: "Самая высокая: около 146 м изначально, единственное чудо света, что уцелело." },
      { title: "Сфинкс", text: "Лев с лицом фараона смотрит на восток, к восходу." },
      { title: "Нил", text: "Без реки пустыня не кормила бы царство. Цивилизация — дар Нила." },
    ],
  },
]
