import { useEffect, useMemo, useRef, useState } from "react"
import { loadCatalog, loadHiResCountries, type CountryRecord } from "../geo/catalog"
import { EarthScene } from "../three/EarthScene"
import { CameraRig } from "../three/CameraRig"
import { ErrorBoundary } from "../three/ErrorBoundary"
import { WorldCanvas } from "../three/WorldCanvas"
import { useGame } from "../store/gameStore"
import { useFrame, useThree } from "@react-three/fiber"

function LodTracker({ onLod }: { onLod: (lod: number) => void }) {
  const { camera } = useThree()
  const last = useRef(-1)
  useFrame(() => {
    const d = camera.position.length()
    const lod = d > 7.2 ? 0 : d > 4.4 ? 1 : 2
    if (lod !== last.current) {
      last.current = lod
      onLod(lod)
    }
  })
  return null
}

export function EarthBundle({
  onPick,
  onHover,
}: {
  onPick: (hit: { iso: string | null; lat: number; lng: number }) => void
  onHover?: (hit: { iso: string | null; name: string | null; x: number; y: number } | null) => void
}) {
  const layers = useGame((s) => s.layers)
  const selectedIso = useGame((s) => s.selectedIso)
  const highlightIso = useGame((s) => s.highlightIso)
  const flyTo = useGame((s) => s.flyTo)
  const [lod, setLod] = useState(1)
  const [countries, setCountries] = useState<CountryRecord[]>([])
  const [pack, setPack] = useState<Awaited<ReturnType<typeof loadCatalog>> | null>(null)

  useEffect(() => {
    void loadCatalog().then((c) => {
      setPack(c)
      setCountries(c.countries)
    })
  }, [])

  useEffect(() => {
    if (lod >= 2) void loadHiResCountries().then((c) => setPack({ ...c }))
  }, [lod])

  const features = useMemo(() => {
    if (!pack) return []
    return lod >= 2 && pack.features50 ? pack.features50 : pack.features
  }, [pack, lod])

  if (!pack) return null

  return (
    <>
      <LodTracker onLod={setLod} />
      <EarthScene
        features={features}
        countries={lod === 0 ? countries.filter((c) => (c.pop ?? 0) > 80_000_000) : lod === 1 ? countries.filter((c) => (c.pop ?? 0) > 20_000_000) : countries}
        cities={pack.cities}
        rivers={pack.rivers}
        lakes={pack.lakes}
        marine={pack.marine}
        mountains={pack.mountains}
        selectedIso={selectedIso}
        highlightIso={highlightIso}
        layers={layers}
        flyTo={flyTo}
        lod={lod}
        onPick={onPick}
        onHover={onHover}
      />
    </>
  )
}

export function GlobeMap({ onPick }: { onPick: (hit: { iso: string | null; lat: number; lng: number }) => void }) {
  return (
    <ErrorBoundary>
      <WorldCanvas cameraZ={11.2}>
        <CameraRig mode="earth" />
        <EarthBundle onPick={onPick} />
      </WorldCanvas>
    </ErrorBoundary>
  )
}
