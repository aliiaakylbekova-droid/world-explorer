import { COUNTRIES } from "./world"
import { QUESTIONS } from "./questions"

export type MissionType = "capitals" | "flags" | "landmarks" | "locate" | "facts"
export type Difficulty = "easy" | "medium" | "hard"

export type QuizItem = {
  id: string
  type: MissionType
  difficulty: Difficulty
  prompt: string
  options: readonly [string, string, string, string]
  correct: 0 | 1 | 2 | 3
  explanation: string
  countryId?: string
  locateId?: string
}

function shuffle<T>(items: readonly T[], seed: number): T[] {
  const copy = [...items]
  let s = seed || 1
  for (let i = copy.length - 1; i > 0; i -= 1) {
    s = (s * 16807) % 2147483647
    const j = s % (i + 1)
    const tmp = copy[i]
    copy[i] = copy[j]
    copy[j] = tmp
  }
  return copy
}

function others(id: string) {
  return COUNTRIES.filter((c) => c.id !== id && c.capital !== "—")
}

export const MISSIONS: QuizItem[] = [
  ...COUNTRIES.filter((c) => c.capital !== "—").map((c, i) => {
    const decoys = shuffle(others(c.id), 11 + i)
      .slice(0, 3)
      .map((x) => x.capital)
    const options = shuffle([c.capital, ...decoys], 21 + i) as unknown as [string, string, string, string]
    return {
      id: `cap-${c.id}`,
      type: "capitals" as const,
      difficulty: (i % 3 === 0 ? "easy" : i % 3 === 1 ? "medium" : "hard") as Difficulty,
      prompt: `Какая столица у страны ${c.name}?`,
      options,
      correct: options.indexOf(c.capital) as 0 | 1 | 2 | 3,
      explanation: `Столица ${c.name} — ${c.capital}.`,
      countryId: c.id,
    }
  }),
  ...COUNTRIES.filter((c) => c.capital !== "—").map((c, i) => {
    const decoys = shuffle(others(c.id), 31 + i)
      .slice(0, 3)
      .map((x) => `${x.flag}  ${x.name}`)
    const right = `${c.flag}  ${c.name}`
    const options = shuffle([right, ...decoys], 41 + i) as unknown as [string, string, string, string]
    return {
      id: `flg-${c.id}`,
      type: "flags" as const,
      difficulty: "easy" as const,
      prompt: "Какой флагу соответствует эта страна?",
      options,
      correct: options.indexOf(right) as 0 | 1 | 2 | 3,
      explanation: `${c.flag} — флаг страны ${c.name}.`,
      countryId: c.id,
    }
  }),
  ...COUNTRIES.flatMap((c) =>
    c.landmarks.map((lm, i) => {
      const decoys = COUNTRIES.filter((x) => x.id !== c.id)
        .flatMap((x) => x.landmarks)
        .map((x) => x.name)
      const pool = shuffle(decoys, 51 + i + c.id.charCodeAt(0)).slice(0, 3)
      const options = shuffle([lm.name, ...pool], 61 + i) as unknown as [string, string, string, string]
      return {
        id: `lm-${lm.id}`,
        type: "landmarks" as const,
        difficulty: "medium" as const,
        prompt: `Какая достопримечательность находится в стране ${c.name}?`,
        options,
        correct: options.indexOf(lm.name) as 0 | 1 | 2 | 3,
        explanation: `${lm.name}: ${lm.fact}`,
        countryId: c.id,
      }
    }),
  ),
  ...COUNTRIES.filter((c) => c.capital !== "—").map((c, i) => {
    const decoys = shuffle(others(c.id), 71 + i)
      .slice(0, 3)
      .map((x) => x.name)
    const options = shuffle([c.name, ...decoys], 81 + i) as unknown as [string, string, string, string]
    return {
      id: `loc-${c.id}`,
      type: "locate" as const,
      difficulty: "medium" as const,
      prompt: `Где на глобусе находится ${c.name}? Выбери страну.`,
      options,
      correct: options.indexOf(c.name) as 0 | 1 | 2 | 3,
      explanation: `${c.name} лежит примерно на ${c.lat.toFixed(0)}° ш., ${c.lng.toFixed(0)}° д.`,
      countryId: c.id,
      locateId: c.id,
    }
  }),
  ...QUESTIONS.map((q) => ({
    id: `fact-${q.id}`,
    type: "facts" as const,
    difficulty: q.difficulty,
    prompt: q.question,
    options: q.options,
    correct: q.correctAnswer,
    explanation: q.explanation,
  })),
]

export const TIMER_MS: Record<Difficulty, number> = {
  easy: 45_000,
  medium: 25_000,
  hard: 15_000,
}

export const POINTS: Record<Difficulty, number> = {
  easy: 80,
  medium: 120,
  hard: 180,
}

export function pickMission(type: MissionType, difficulty: Difficulty, count: number, seed = Date.now()) {
  const pool = MISSIONS.filter((m) => m.type === type)
  const prefer = pool.filter((m) => m.difficulty === difficulty)
  const source = prefer.length >= count ? prefer : pool
  return shuffle(source, seed).slice(0, count)
}

export function pickMixed(count: number, seed = Date.now()) {
  return shuffle(MISSIONS, seed).slice(0, count)
}
