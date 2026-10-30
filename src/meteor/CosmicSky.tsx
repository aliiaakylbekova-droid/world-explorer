import { useEffect, useRef } from "react"

type Star = {
  x: number
  y: number
  r: number
  phase: number
  speed: number
  alpha: number
  tint: string
  flare: boolean
}

function makeStars(): Star[] {
  const tints = ["#ffffff", "#d7e6ff", "#ffe6c2", "#c9d4ff", "#fff6ea"]
  return Array.from({ length: 210 }, (_, index) => ({
    x: Math.random(),
    y: Math.random(),
    r: index < 18 ? 1.3 + Math.random() * 1.1 : 0.3 + Math.random() * 1.05,
    phase: Math.random() * Math.PI * 2,
    speed: 0.45 + Math.random() * 1.6,
    alpha: 0.35 + Math.random() * 0.65,
    tint: tints[index % tints.length] ?? "#fff",
    flare: index < 10,
  }))
}

export function CosmicSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    if (!context) return
    const stars = makeStars()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let frame = 0
    let running = true

    const draw = (time: number) => {
      if (!running) return
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (width === 0 || height === 0) {
        frame = requestAnimationFrame(draw)
        return
      }
      const pixelWidth = Math.floor(width * dpr)
      const pixelHeight = Math.floor(height * dpr)
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth
        canvas.height = pixelHeight
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)
      for (const star of stars) {
        const twinkle = 0.4 + Math.sin(time * 0.002 * star.speed + star.phase) * 0.6
        const x = star.x * width
        const y = star.y * height
        context.globalAlpha = Math.max(0.08, star.alpha * twinkle)
        context.fillStyle = star.tint
        context.beginPath()
        context.arc(x, y, star.r, 0, Math.PI * 2)
        context.fill()
        if (star.flare) {
          context.globalAlpha = 0.35 * twinkle
          context.strokeStyle = star.tint
          context.lineWidth = 1
          context.beginPath()
          context.moveTo(x - star.r * 5, y)
          context.lineTo(x + star.r * 5, y)
          context.moveTo(x, y - star.r * 5)
          context.lineTo(x, y + star.r * 5)
          context.stroke()
        }
      }
      context.globalAlpha = 1
      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)
    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(frame)
        return
      }
      if (!running) {
        running = true
        frame = requestAnimationFrame(draw)
      }
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      running = false
      cancelAnimationFrame(frame)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return (
    <div className="mm-sky" aria-hidden="true">
      <div className="mm-nebula mm-nebula-a" />
      <div className="mm-nebula mm-nebula-b" />
      <div className="mm-nebula mm-nebula-c" />
      <div className="mm-nebula mm-nebula-d" />
      <div className="mm-sun" />
      <canvas ref={canvasRef} className="mm-stars" />
      <div className="mm-planet mm-planet-ice" />
      <div className="mm-moon" />
      <div className="mm-planet-system">
        <div className="mm-ring" />
        <div className="mm-planet mm-planet-saturn" />
      </div>
      <div className="mm-galaxy" />
      <div className="mm-shoot" />
      <div className="mm-shoot mm-shoot-b" />
      <div className="mm-vignette" />
    </div>
  )
}
