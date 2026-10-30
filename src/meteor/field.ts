export const TIME_CHOICES = [15, 30, 45, 60] as const

export type PresetTime = (typeof TIME_CHOICES)[number]
export type TimeChoice = PresetTime | "custom"

export type MeteorSpec = {
  id: number
  position: [number, number, number]
  scale: number
  spin: [number, number, number]
  drift: number
  seed: number
  palette: number
}

const HOMES: readonly [number, number, number][] = [
  [-4.7, 1.45, -0.8],
  [-2.55, -1.7, 0.35],
  [-0.15, 2.2, -2.15],
  [1.55, -1.9, -0.15],
  [3.45, 1.35, -1.15],
  [4.9, -0.4, -1.9],
  [-5.2, -0.45, -2.45],
]

const SCALES = [0.78, 1.12, 0.62, 0.96, 1.24, 0.7, 0.88]

export function resolveSeconds(choice: TimeChoice, customText: string): number | null {
  if (choice !== "custom") return choice
  const trimmed = customText.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const seconds = Number(trimmed)
  if (seconds < 1 || seconds > 600) return null
  return seconds
}

export function formatRemaining(ms: number): string {
  const total = ms <= 0 ? 0 : Math.ceil(ms / 1000)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function makeMeteors(seed: number): MeteorSpec[] {
  return HOMES.map((home, index) => {
    const jiggle = ((seed * 13 + index * 17) % 9) / 9
    return {
      id: index,
      position: [
        home[0] + (jiggle - 0.5) * 0.45,
        home[1] + (((seed + index * 3) % 7) - 3) * 0.05,
        home[2],
      ],
      scale: SCALES[index] ?? 0.8,
      spin: [
        0.16 + (index % 3) * 0.07,
        (index % 2 === 0 ? 1 : -1) * (0.22 + (index % 4) * 0.06),
        0.03 + (index % 3) * 0.02,
      ],
      drift: 0.28 + (index % 5) * 0.07,
      seed: 11 + index * 29,
      palette: (index + seed) % 5,
    }
  })
}

export function pickMeteor(current: number | null, count: number): number {
  const pool: number[] = []
  for (let index = 0; index < count; index += 1) {
    if (index !== current) pool.push(index)
  }
  return pool[Math.floor(Math.random() * pool.length)] ?? 0
}
