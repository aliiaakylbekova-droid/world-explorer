import type { MeteorSpec } from "./types.ts"

export type RockPalette = {
  light: string
  mid: string
  dark: string
  crater: string
  craterRim: string
  glow: string
  facet: string
}

export const PALETTES: RockPalette[] = [
  {
    light: "#f0e2cf",
    mid: "#b89a7e",
    dark: "#5c4638",
    crater: "#2b211b",
    craterRim: "#a08068",
    glow: "rgba(255, 196, 140, 0.85)",
    facet: "#d7c2a6",
  },
  {
    light: "#f0c2b0",
    mid: "#c26a52",
    dark: "#5a2c24",
    crater: "#2a1412",
    craterRim: "#e09880",
    glow: "rgba(255, 140, 110, 0.8)",
    facet: "#e8a090",
  },
  {
    light: "#d5e4f2",
    mid: "#7f93ab",
    dark: "#2c3848",
    crater: "#151c28",
    craterRim: "#b7c8dc",
    glow: "rgba(150, 200, 255, 0.85)",
    facet: "#c5d4e6",
  },
  {
    light: "#e4e6c4",
    mid: "#8c9468",
    dark: "#3a4030",
    crater: "#1c2218",
    craterRim: "#c6c89a",
    glow: "rgba(210, 230, 140, 0.75)",
    facet: "#d5d6ae",
  },
  {
    light: "#f6d7b0",
    mid: "#d4894a",
    dark: "#6a3a1c",
    crater: "#32180c",
    craterRim: "#f0c090",
    glow: "rgba(255, 180, 90, 0.85)",
    facet: "#f2c48a",
  },
  {
    light: "#f7f1ff",
    mid: "#b7a4cc",
    dark: "#4a3c5c",
    crater: "#241c30",
    craterRim: "#ddd0f0",
    glow: "rgba(220, 190, 255, 0.8)",
    facet: "#e6daf6",
  },
  {
    light: "#d8d2c8",
    mid: "#7a7268",
    dark: "#2a2724",
    crater: "#121110",
    craterRim: "#c4b49a",
    glow: "rgba(255, 214, 140, 0.7)",
    facet: "#b7aa9a",
  },
]

export type Crater = { cx: number; cy: number; rx: number; ry: number; rot: number }
export type Speck = { cx: number; cy: number; r: number; light: boolean }
export type Facet = { cx: number; cy: number; rx: number; ry: number; rot: number }

export type RockGeometry = {
  path: string
  craters: Crater[]
  specks: Speck[]
  facets: Facet[]
}

function mulberry32(seed: number) {
  let state = seed >>> 0
  return function next() {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function buildRock(seed: number): RockGeometry {
  const rand = mulberry32(seed)
  const count = 15
  const points: { x: number; y: number }[] = []
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2 - Math.PI / 2
    const wobble = 0.74 + rand() * 0.32
    const radius = 76 * wobble
    points.push({
      x: 100 + Math.cos(angle) * radius * (0.9 + rand() * 0.18),
      y: 100 + Math.sin(angle) * radius * (0.86 + rand() * 0.16),
    })
  }

  let path = ""
  for (let index = 0; index < count; index += 1) {
    const p0 = points[(index - 1 + count) % count]!
    const p1 = points[index]!
    const p2 = points[(index + 1) % count]!
    const p3 = points[(index + 2) % count]!
    if (index === 0) path += `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} `
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    path += `C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} `
  }
  path += "Z"

  const craters: Crater[] = []
  const craterCount = 6 + Math.floor(rand() * 3)
  for (let index = 0; index < craterCount; index += 1) {
    const angle = rand() * Math.PI * 2
    const dist = 6 + rand() * 34
    craters.push({
      cx: 100 + Math.cos(angle) * dist,
      cy: 100 + Math.sin(angle) * dist * 0.92,
      rx: 5 + rand() * 13,
      ry: 4 + rand() * 10,
      rot: rand() * 180,
    })
  }

  const specks: Speck[] = []
  for (let index = 0; index < 22; index += 1) {
    const angle = rand() * Math.PI * 2
    const dist = rand() * 52
    specks.push({
      cx: 100 + Math.cos(angle) * dist,
      cy: 100 + Math.sin(angle) * dist * 0.9,
      r: 0.6 + rand() * 1.8,
      light: rand() > 0.45,
    })
  }

  const facets: Facet[] = []
  for (let index = 0; index < 3; index += 1) {
    const angle = rand() * Math.PI * 2
    const dist = 8 + rand() * 24
    facets.push({
      cx: 100 + Math.cos(angle) * dist,
      cy: 100 + Math.sin(angle) * dist,
      rx: 14 + rand() * 18,
      ry: 8 + rand() * 10,
      rot: rand() * 180,
    })
  }

  return { path, craters, specks, facets }
}

const FOCUS = 300

const LAYOUT: Omit<MeteorSpec, "scale" | "z">[] = [
  { id: "m1", x: 16, y: 22, size: 132, drift: 16, delay: -2, spin: 22, reverse: false, dx: "52vw", dy: "10vh", dx2: "16vw", dy2: "42vh", seed: 4, palette: 0 },
  { id: "m2", x: 80, y: 16, size: 98, drift: 18, delay: -6, spin: 18, reverse: true, dx: "-46vw", dy: "26vh", dx2: "-12vw", dy2: "48vh", seed: 12, palette: 1 },
  { id: "m3", x: 90, y: 56, size: 154, drift: 20, delay: -3, spin: 28, reverse: false, dx: "-38vw", dy: "-30vh", dx2: "-62vw", dy2: "8vh", seed: 21, palette: 2 },
  { id: "m4", x: 18, y: 70, size: 116, drift: 15, delay: -8, spin: 20, reverse: true, dx: "44vw", dy: "-34vh", dx2: "18vw", dy2: "-52vh", seed: 33, palette: 3 },
  { id: "m5", x: 68, y: 76, size: 86, drift: 13, delay: -4, spin: 16, reverse: false, dx: "-32vw", dy: "-40vh", dx2: "14vw", dy2: "-16vh", seed: 41, palette: 4 },
  { id: "m6", x: 48, y: 12, size: 108, drift: 17, delay: -7, spin: 24, reverse: true, dx: "8vw", dy: "50vh", dx2: "-36vw", dy2: "24vh", seed: 52, palette: 5 },
  { id: "m7", x: 32, y: 44, size: 78, drift: 14, delay: -1, spin: 15, reverse: false, dx: "40vw", dy: "18vh", dx2: "6vw", dy2: "-32vh", seed: 63, palette: 6 },
]

export const METEOR_FIELD: MeteorSpec[] = LAYOUT.map((meteor) => ({
  ...meteor,
  scale: Number((FOCUS / meteor.size).toFixed(3)),
  z: Math.round(meteor.size / 30),
}))
