import { useEffect, useRef, useState } from "react"
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
} from "react-leaflet"
import type { Camera, LatLngTuple, Reveal } from "../data/questions.ts"
import { countryFeature } from "../map/countries.ts"

type BasemapId = "streets" | "physical"

const ATTRIBUTION =
  '<a href="https://www.esri.com" title="Sources: Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, Esri (Thailand), NGCC, OpenStreetMap contributors, and the GIS User Community">© Esri</a>, <a href="https://www.openstreetmap.org/copyright">OSM</a>'

const BASEMAPS: Record<BasemapId, { url: string; attribution: string }> = {
  streets: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: ATTRIBUTION,
  },
  physical: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: ATTRIBUTION,
  },
}

const ORDER: BasemapId[] = ["streets", "physical"]

function Basemap() {
  const [index, setIndex] = useState(0)
  const errors = useRef(0)
  const id = ORDER[index] ?? "streets"
  const source = BASEMAPS[id]

  return (
    <TileLayer
      key={id}
      url={source.url}
      attribution={source.attribution}
      eventHandlers={{
        tileload: () => {
          errors.current = 0
        },
        tileerror: () => {
          errors.current += 1
          if (errors.current >= 6 && index < ORDER.length - 1) {
            errors.current = 0
            setIndex((current) => current + 1)
          }
        },
      }}
    />
  )
}

function FlyTo({ camera }: { camera: Camera }) {
  const map = useMap()
  const { center, zoom } = camera
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    map.flyTo(center, zoom, { duration: reduce ? 0 : 1.05 })
  }, [map, center, zoom])
  return null
}

function CountryShade({ name }: { name: string }) {
  const feature = countryFeature(name)
  if (!feature) return null
  return (
    <GeoJSON
      key={name}
      data={feature}
      style={{
        color: "#6f7348",
        weight: 2,
        fillColor: "#c5d4b4",
        fillOpacity: 0.35,
      }}
    />
  )
}

function RevealLayer({ reveal }: { reveal: Reveal }) {
  if (reveal.kind === "marker") {
    return (
      <CircleMarker
        center={reveal.at}
        radius={8}
        pathOptions={{
          color: "#6f7348",
          weight: 2,
          fillColor: "#8a9160",
          fillOpacity: 0.95,
        }}
      >
        <Tooltip permanent direction="top" offset={[0, -6]} className="map-tip">
          {reveal.label}
        </Tooltip>
      </CircleMarker>
    )
  }
  if (reveal.kind === "line") {
    const points = reveal.points.map((point) => point) as LatLngTuple[]
    return (
      <Polyline
        positions={points}
        pathOptions={{ color: "#6f7348", weight: 4, opacity: 0.95 }}
      >
        <Tooltip permanent direction="center" className="map-tip">
          {reveal.label}
        </Tooltip>
      </Polyline>
    )
  }
  return null
}

export function WorldMap({
  camera,
  country,
  reveal,
}: {
  camera: Camera
  country: string | null
  reveal: Reveal | null
}) {
  return (
    <div className="map-fill" data-testid="map">
      <MapContainer
        center={[18, 12]}
        zoom={2}
        minZoom={2}
        maxZoom={12}
        worldCopyJump
        zoomControl={false}
        className="map-canvas"
      >
        <Basemap />
        <ZoomControl position="topright" />
        <FlyTo camera={camera} />
        {country ? <CountryShade name={country} /> : null}
        {reveal ? <RevealLayer reveal={reveal} /> : null}
      </MapContainer>
    </div>
  )
}
