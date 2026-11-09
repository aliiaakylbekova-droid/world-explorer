import { useEffect, useRef } from "react"
import { COUNTRIES, type ContinentId } from "../data/world"
import { makeEarthTexture } from "./earthTexture"

type Props = {
  continent: ContinentId
  countryId: string | null
  onPickCountry: (id: string) => void
}

export function Globe2D({ continent, countryId, onPickCountry }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const rot = useRef(0)
  const scale = useRef(1)
  const drag = useRef<{ x: number; active: boolean }>({ x: 0, active: false })

  useEffect(() => {
    const table: Record<ContinentId, number> = {
      asia: 0.35,
      europe: 0.05,
      africa: 0.08,
      "north-america": 1.15,
      "south-america": 1.05,
      oceania: 0.7,
      antarctica: 0,
    }
    rot.current = table[continent] ?? 0
  }, [continent])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const map = makeEarthTexture(1024)
    let frame = 0

    const draw = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      ctx.clearRect(0, 0, w, h)
      const cx = w / 2
      const cy = h / 2
      const r = Math.min(w, h) * 0.38 * scale.current
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.clip()
      const shift = ((rot.current % 1) + 1) % 1
      const sx = shift * map.width
      ctx.drawImage(map, -sx, 0, map.width, map.height, cx - r, cy - r, r * 2, r * 2)
      ctx.drawImage(map, map.width - sx, 0, map.width, map.height, cx - r, cy - r, r * 2, r * 2)
      for (const country of COUNTRIES) {
        const lon = (country.lng + 180) / 360 - shift
        const wrapped = ((lon % 1) + 1) % 1
        const latN = (90 - country.lat) / 180
        const x = cx - r + wrapped * r * 2
        const y = cy - r + latN * r * 2
        const dx = x - cx
        const dy = y - cy
        if (dx * dx + dy * dy > r * r) continue
        ctx.beginPath()
        ctx.fillStyle = country.id === countryId ? "#e8c547" : "#2ec4b6"
        ctx.arc(x, y, country.id === countryId ? 6 : 4, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
      ctx.beginPath()
      ctx.strokeStyle = "rgba(232,197,71,0.45)"
      ctx.lineWidth = 3
      ctx.arc(cx, cy, r + 4, 0, Math.PI * 2)
      ctx.stroke()
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [countryId])

  return (
    <canvas
      ref={ref}
      className="globe2d"
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, active: true }
        ;(e.target as HTMLCanvasElement).setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!drag.current.active) return
        rot.current += (e.clientX - drag.current.x) / 700
        drag.current.x = e.clientX
      }}
      onPointerUp={() => {
        drag.current.active = false
      }}
      onWheel={(e) => {
        e.preventDefault()
        scale.current = Math.min(1.8, Math.max(0.7, scale.current - e.deltaY * 0.001))
      }}
      onClick={(e) => {
        if (drag.current.active) return
        const canvas = ref.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const cx = canvas.clientWidth / 2
        const cy = canvas.clientHeight / 2
        const r = Math.min(canvas.clientWidth, canvas.clientHeight) * 0.38 * scale.current
        const dx = x - cx
        const dy = y - cy
        if (dx * dx + dy * dy > r * r) return
        const u = (x - (cx - r)) / (r * 2)
        const v = (y - (cy - r)) / (r * 2)
        const shift = ((rot.current % 1) + 1) % 1
        const lng = ((u + shift) % 1) * 360 - 180
        const lat = 90 - v * 180
        let best = COUNTRIES[0]
        let dist = Infinity
        for (const c of COUNTRIES) {
          const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2
          if (d < dist) {
            dist = d
            best = c
          }
        }
        onPickCountry(best.id)
      }}
    />
  )
}
