export const QUIZ_MS = 20 * 60 * 1000
export const QUESTION_COUNT = 15
export const POINTS_CORRECT = 100

export type Outcome = "correct" | "wrong" | "skipped"
export type Phase = "ready" | "play" | "results" | "review"

export type AnswerRecord = {
  questionId: number
  outcome: Outcome
  selectedIndex: number | null
  points: number
}

export type Tally = {
  correct: number
  wrong: number
  skipped: number
  score: number
  percent: number
}

export function withSkips(records: readonly AnswerRecord[], questionIds: readonly number[]): AnswerRecord[] {
  const seen = new Set(records.map((record) => record.questionId))
  const extra: AnswerRecord[] = []
  for (const questionId of questionIds) {
    if (!seen.has(questionId)) {
      extra.push({
        questionId,
        outcome: "skipped",
        selectedIndex: null,
        points: 0,
      })
    }
  }
  return extra.length === 0 ? [...records] : [...records, ...extra]
}

export function tally(records: readonly AnswerRecord[]): Tally {
  let correct = 0
  let wrong = 0
  let skipped = 0
  let score = 0
  for (const record of records) {
    score += record.points
    if (record.outcome === "correct") correct += 1
    else if (record.outcome === "wrong") wrong += 1
    else skipped += 1
  }
  return {
    correct,
    wrong,
    skipped,
    score,
    percent: Math.round((correct / QUESTION_COUNT) * 100),
  }
}

export function formatClock(ms: number, mode: "remaining" | "elapsed"): string {
  const safe = Math.max(0, ms)
  const seconds =
    mode === "remaining" ? Math.ceil(safe / 1000) : Math.floor(safe / 1000)
  const capped = Math.min(20 * 60, seconds)
  const minutes = Math.floor(capped / 60)
  const rest = capped % 60
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
}

export function resultCopy(correct: number): { title: string; text: string } {
  if (correct >= 12) {
    return {
      title: "Отличный результат",
      text: "Ты уверенно читаешь карту мира и хорошо помнишь географию 7 класса.",
    }
  }
  if (correct >= 8) {
    return {
      title: "Хороший результат",
      text: "Основа уже есть. Пройди маршрут ещё раз и сверь места, которые пока спорные.",
    }
  }
  return {
    title: "Продолжай исследование",
    text: "Многие ответы лежат прямо на карте. Открой объяснения и пройди квиз ещё раз.",
  }
}
