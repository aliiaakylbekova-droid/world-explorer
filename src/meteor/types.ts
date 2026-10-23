export const TIME_OPTIONS = [15, 30, 45, 60] as const
export const COUNT_OPTIONS = [5, 10, 20, "infinite"] as const

export type TimeLimit = (typeof TIME_OPTIONS)[number]
export type ProblemCount = (typeof COUNT_OPTIONS)[number]
export type Difficulty = "easy" | "medium" | "hard"
export type Phase = "menu" | "play" | "results"
export type Status = "idle" | "approaching" | "solving" | "success" | "miss"
export type Feedback = "correct" | "wrong" | "timeout" | null
export type Ending = "clear" | "stop"

export type Settings = {
  time: TimeLimit
  difficulty: Difficulty
  count: ProblemCount
}

export type EquationView = {
  left: string
  op: string
  right: string
}

export type MeteorSpec = {
  id: string
  x: number
  y: number
  size: number
  scale: number
  drift: number
  delay: number
  spin: number
  reverse: boolean
  dx: number
  dy: number
  seed: number
  palette: number
  z: number
}
