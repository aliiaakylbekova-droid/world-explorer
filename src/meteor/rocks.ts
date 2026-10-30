import * as THREE from "three"

export const GLOW = ["#ff8a3d", "#ffc15a", "#ff5c32", "#7ad7ff", "#d2a6ff"] as const

const PALETTES = [
  { lo: [0.2, 0.18, 0.16], hi: [0.46, 0.4, 0.34], hot: [1, 0.46, 0.12] },
  { lo: [0.18, 0.16, 0.15], hi: [0.4, 0.32, 0.26], hot: [1, 0.74, 0.3] },
  { lo: [0.3, 0.14, 0.1], hi: [0.55, 0.26, 0.16], hot: [1, 0.34, 0.08] },
  { lo: [0.18, 0.22, 0.28], hi: [0.42, 0.48, 0.54], hot: [0.5, 0.86, 1] },
  { lo: [0.16, 0.14, 0.2], hi: [0.34, 0.3, 0.4], hot: [0.8, 0.5, 1] },
]

const geometryCache = new Map<string, THREE.BufferGeometry>()
let glowMap: THREE.Texture | null = null
let starMap: THREE.Texture | null = null
let gasMap: THREE.Texture | null = null
let terraMap: THREE.Texture | null = null
let moonMap: THREE.Texture | null = null
let rustMap: THREE.Texture | null = null

function fade(t: number): number {
  return t * t * (3 - 2 * t)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function hash(ix: number, iy: number, iz: number): number {
  let n = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(iz, 1274126177)
  n = Math.imul(n ^ (n >>> 13), 1274126177)
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295
}

function noise3(x: number, y: number, z: number): number {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const z0 = Math.floor(z)
  const u = fade(x - x0)
  const v = fade(y - y0)
  const w = fade(z - z0)
  let value = 0
  for (let dz = 0; dz <= 1; dz += 1) {
    for (let dy = 0; dy <= 1; dy += 1) {
      for (let dx = 0; dx <= 1; dx += 1) {
        const weight = (dx === 1 ? u : 1 - u) * (dy === 1 ? v : 1 - v) * (dz === 1 ? w : 1 - w)
        value += hash(x0 + dx, y0 + dy, z0 + dz) * weight
      }
    }
  }
  return value
}

function fbm(x: number, y: number, z: number): number {
  let sum = 0
  let amp = 0.5
  let freq = 1
  for (let octave = 0; octave < 5; octave += 1) {
    sum += amp * noise3(x * freq, y * freq, z * freq)
    freq *= 2
    amp *= 0.5
  }
  return sum
}

function srgbToLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}

export function rockGeometry(seed: number, palette: number): THREE.BufferGeometry {
  const key = `${seed}:${palette}`
  const cached = geometryCache.get(key)
  if (cached) return cached

  const geo = new THREE.IcosahedronGeometry(1, 5)
  const pos = geo.attributes.position
  if (!pos) return geo
  const colors = new Float32Array(pos.count * 3)
  const embers = new Float32Array(pos.count * 3)
  const heat = new Float32Array(pos.count)
  const pal = PALETTES[palette % PALETTES.length]!
  const sx = 1.05 + (seed % 4) * 0.035
  const sy = 0.8 + (seed % 3) * 0.06
  const sz = 0.92 + (seed % 5) * 0.03

  for (let index = 0; index < pos.count; index += 1) {
    const x = pos.getX(index)
    const y = pos.getY(index)
    const z = pos.getZ(index)
    const len = Math.hypot(x, y, z) || 1
    const ux = x / len
    const uy = y / len
    const uz = z / len
    const broad = fbm(ux * 1.55 + seed, uy * 1.55, uz * 1.55)
    const fine = fbm(ux * 4.4 + seed * 0.17, uy * 4.4, uz * 4.4)
    const ridge = 1 - Math.abs(fbm(ux * 2.3 + 2.2, uy * 2.3, uz * 2.3 + seed) * 2 - 1)
    const craterField = noise3(ux * 2.7 + seed, uy * 2.7 + 1.4, uz * 2.7)
    const crater = smoothstep(0.6, 0.82, craterField)
    const radius = 0.76 + (broad - 0.42) * 0.72 + (fine - 0.45) * 0.1 + ridge * 0.05 - crater * 0.3
    pos.setXYZ(index, ux * radius * sx, uy * radius * sy, uz * radius * sz)

    const mix = Math.min(1, Math.max(0, (broad - 0.28) * 1.5))
    const grain = (fine - 0.5) * 0.08
    const cr = lerp(pal.lo[0], pal.hi[0], mix) + grain
    const cg = lerp(pal.lo[1], pal.hi[1], mix) + grain
    const cb = lerp(pal.lo[2], pal.hi[2], mix) + grain
    const shade = 1 - crater * 0.55
    colors[index * 3] = srgbToLinear(Math.min(1, Math.max(0, cr * shade)))
    colors[index * 3 + 1] = srgbToLinear(Math.min(1, Math.max(0, cg * shade)))
    colors[index * 3 + 2] = srgbToLinear(Math.min(1, Math.max(0, cb * shade)))

    const crack = smoothstep(0.68, 0.92, ridge) * (1 - crater * 0.85)
    const core = crater * smoothstep(0.72, 0.9, craterField)
    const glow = Math.min(1, crack * 0.95 + core * 0.75)
    heat[index] = glow
    embers[index * 3] = srgbToLinear(pal.hot[0]) * glow
    embers[index * 3 + 1] = srgbToLinear(pal.hot[1]) * glow
    embers[index * 3 + 2] = srgbToLinear(pal.hot[2]) * glow
  }

  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))
  geo.setAttribute("ember", new THREE.BufferAttribute(embers, 3))
  geo.setAttribute("heat", new THREE.BufferAttribute(heat, 1))
  geo.computeVertexNormals()
  geometryCache.set(key, geo)
  return geo
}

const rockVertex = /* glsl */ `
attribute float heat;
attribute vec3 ember;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vWorld;
varying float vHeat;
varying vec3 vEmber;
void main() {
  vColor = color;
  vHeat = heat;
  vEmber = ember;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`

const rockFragment = /* glsl */ `
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vWorld;
varying float vHeat;
varying vec3 vEmber;
void main() {
  vec3 n = normalize(vNormal);
  vec3 viewDir = normalize(cameraPosition - vWorld);
  float wrap = clamp(dot(n, normalize(vec3(0.42, 0.82, 0.38))) * 0.55 + 0.5, 0.0, 1.0);
  float rim = pow(1.0 - max(dot(n, viewDir), 0.0), 2.15);
  vec3 col = vColor * (0.34 + wrap * 1.2);
  col += vec3(0.16, 0.07, 0.03) * (1.0 - wrap);
  col += vEmber * (1.35 + rim * 1.8);
  col += vec3(1.0, 0.78, 0.5) * rim * (0.12 + vHeat * 0.55);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

export const rockMaterial = new THREE.ShaderMaterial({
  vertexShader: rockVertex,
  fragmentShader: rockFragment,
  vertexColors: true,
})

function canvasTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

export function glowTexture(): THREE.Texture {
  if (glowMap) return glowMap
  const canvas = document.createElement("canvas")
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext("2d")
  if (!ctx) return new THREE.Texture()
  const grd = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  grd.addColorStop(0, "rgba(255,255,255,0.95)")
  grd.addColorStop(0.22, "rgba(255,255,255,0.45)")
  grd.addColorStop(0.55, "rgba(255,255,255,0.12)")
  grd.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, 128, 128)
  glowMap = canvasTexture(canvas)
  return glowMap
}

export function starTexture(): THREE.Texture {
  if (starMap) return starMap
  const canvas = document.createElement("canvas")
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext("2d")
  if (!ctx) return new THREE.Texture()
  const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  grd.addColorStop(0, "rgba(255,255,255,1)")
  grd.addColorStop(0.12, "rgba(255,255,255,0.95)")
  grd.addColorStop(0.28, "rgba(255,255,255,0.25)")
  grd.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, 64, 64)
  starMap = canvasTexture(canvas)
  return starMap
}

export function gasTexture(): THREE.Texture {
  if (gasMap) return gasMap
  const canvas = document.createElement("canvas")
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext("2d")
  if (!ctx) return new THREE.Texture()
  const image = ctx.createImageData(512, 512)
  for (let y = 0; y < 512; y += 1) {
    for (let x = 0; x < 512; x += 1) {
      const bands = Math.sin(y * 0.085 + Math.sin(y * 0.02) * 3)
      const streak = Math.sin(x * 0.04 + y * 0.11)
      const mix = bands * 0.5 + 0.5
      const i = (y * 512 + x) * 4
      image.data[i] = 168 + mix * 70 + streak * 12
      image.data[i + 1] = 104 + mix * 48 + streak * 8
      image.data[i + 2] = 62 + (1 - mix) * 28
      image.data[i + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
  ctx.fillStyle = "rgba(255, 214, 170, 0.18)"
  ctx.beginPath()
  ctx.ellipse(300, 250, 70, 28, 0.4, 0, Math.PI * 2)
  ctx.fill()
  gasMap = canvasTexture(canvas)
  return gasMap
}

export function terraTexture(): THREE.Texture {
  if (terraMap) return terraMap
  const canvas = document.createElement("canvas")
  canvas.width = 384
  canvas.height = 384
  const ctx = canvas.getContext("2d")
  if (!ctx) return new THREE.Texture()
  const image = ctx.createImageData(384, 384)
  for (let y = 0; y < 384; y += 1) {
    for (let x = 0; x < 384; x += 1) {
      const n = fbm(x * 0.02, y * 0.02, 2.2)
      const land = n > 0.52
      const i = (y * 384 + x) * 4
      image.data[i] = land ? 70 + n * 40 : 28 + n * 20
      image.data[i + 1] = land ? 110 + n * 50 : 78 + n * 40
      image.data[i + 2] = land ? 72 + n * 20 : 150 + n * 40
      image.data[i + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
  terraMap = canvasTexture(canvas)
  return terraMap
}

export function moonTexture(): THREE.Texture {
  if (moonMap) return moonMap
  const canvas = document.createElement("canvas")
  canvas.width = 384
  canvas.height = 384
  const ctx = canvas.getContext("2d")
  if (!ctx) return new THREE.Texture()
  ctx.fillStyle = "#b7bdc6"
  ctx.fillRect(0, 0, 384, 384)
  for (let index = 0; index < 48; index += 1) {
    const radius = 4 + ((index * 37) % 22)
    const cx = (index * 97) % 384
    const cy = (index * 53) % 384
    ctx.fillStyle = index % 2 === 0 ? "rgba(70,76,86,0.55)" : "rgba(210,216,224,0.35)"
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  moonMap = canvasTexture(canvas)
  return moonMap
}

export function rustTexture(): THREE.Texture {
  if (rustMap) return rustMap
  const canvas = document.createElement("canvas")
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext("2d")
  if (!ctx) return new THREE.Texture()
  const image = ctx.createImageData(256, 256)
  for (let y = 0; y < 256; y += 1) {
    for (let x = 0; x < 256; x += 1) {
      const n = fbm(x * 0.03, y * 0.03, 8.5)
      const i = (y * 256 + x) * 4
      image.data[i] = 120 + n * 90
      image.data[i + 1] = 48 + n * 30
      image.data[i + 2] = 36 + n * 16
      image.data[i + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
  rustMap = canvasTexture(canvas)
  return rustMap
}
