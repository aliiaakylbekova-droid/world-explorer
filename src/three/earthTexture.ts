export function makeEarthTexture(size = 1024): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) return canvas

  const g = ctx.createLinearGradient(0, 0, 0, size)
  g.addColorStop(0, "#d8f0ff")
  g.addColorStop(0.12, "#1a6fb5")
  g.addColorStop(0.5, "#0b4f93")
  g.addColorStop(0.88, "#1a6fb5")
  g.addColorStop(1, "#d8f0ff")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)

  function lonLat(lon: number, lat: number): [number, number] {
    const x = ((lon + 180) / 360) * size
    const y = ((90 - lat) / 180) * size
    return [x, y]
  }

  const land = [
    { lon: 90, lat: 45, rx: 0.28, ry: 0.18, color: "#3cb07a" },
    { lon: 70, lat: 28, rx: 0.16, ry: 0.1, color: "#4ecb88" },
    { lon: 20, lat: 55, rx: 0.12, ry: 0.1, color: "#45b978" },
    { lon: 15, lat: 8, rx: 0.12, ry: 0.2, color: "#d2b36a" },
    { lon: -100, lat: 50, rx: 0.18, ry: 0.14, color: "#3fa56f" },
    { lon: -100, lat: 28, rx: 0.08, ry: 0.08, color: "#c9a45c" },
    { lon: -60, lat: -15, rx: 0.1, ry: 0.18, color: "#2f9a62" },
    { lon: 135, lat: -25, rx: 0.1, ry: 0.08, color: "#d0b05e" },
    { lon: 80, lat: 62, rx: 0.22, ry: 0.08, color: "#2e8f68" },
    { lon: 0, lat: -80, rx: 0.42, ry: 0.08, color: "#f4fbff" },
    { lon: 0, lat: 82, rx: 0.28, ry: 0.06, color: "#f4fbff" },
  ]

  for (const blob of land) {
    const [x, y] = lonLat(blob.lon, blob.lat)
    ctx.fillStyle = blob.color
    ctx.beginPath()
    ctx.ellipse(x, y, blob.rx * size, blob.ry * size, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.strokeStyle = "rgba(232, 197, 71, 0.18)"
  ctx.lineWidth = 1
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = lonLat(0, lat)[1]
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(size, y)
    ctx.stroke()
  }
  for (let lon = -150; lon <= 180; lon += 30) {
    const x = lonLat(lon, 0)[0]
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, size)
    ctx.stroke()
  }

  return canvas
}
