import type { AnswerRecord, Tally } from "../game/logic.ts"
import { tally } from "../game/logic.ts"

export const ATTEMPTS_KEY = "world-explorer-attempts"
export const ATTEMPTS_EVENT = "world-explorer-attempts"

export type Attempt = {
  id: string
  studentName: string
  className: string
  score: number
  percent: number
  correct: number
  wrong: number
  skipped: number
  elapsedMs: number
  finishedAt: number
  records: AnswerRecord[]
}

function isRecord(value: unknown): value is AnswerRecord {
  if (typeof value !== "object" || value === null) return false
  const item = value as AnswerRecord
  return (
    typeof item.questionId === "number" &&
    (item.outcome === "correct" || item.outcome === "wrong" || item.outcome === "skipped") &&
    (item.selectedIndex === null || typeof item.selectedIndex === "number") &&
    typeof item.points === "number"
  )
}

function isAttempt(value: unknown): value is Attempt {
  if (typeof value !== "object" || value === null) return false
  const item = value as Attempt
  return (
    typeof item.id === "string" &&
    typeof item.studentName === "string" &&
    typeof item.className === "string" &&
    typeof item.score === "number" &&
    typeof item.percent === "number" &&
    typeof item.correct === "number" &&
    typeof item.wrong === "number" &&
    typeof item.skipped === "number" &&
    typeof item.elapsedMs === "number" &&
    typeof item.finishedAt === "number" &&
    Array.isArray(item.records) &&
    item.records.every(isRecord)
  )
}

export function loadAttempts(): Attempt[] {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isAttempt).sort((a, b) => b.finishedAt - a.finishedAt)
  } catch {
    return []
  }
}

function persist(attempts: Attempt[]): void {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts))
  window.dispatchEvent(new Event(ATTEMPTS_EVENT))
}

export function saveAttempt(input: {
  studentName: string
  className: string
  elapsedMs: number
  records: readonly AnswerRecord[]
  stats?: Tally
}): Attempt {
  const stats = input.stats ?? tally(input.records)
  const attempt: Attempt = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    studentName: input.studentName.trim(),
    className: input.className.trim(),
    score: stats.score,
    percent: stats.percent,
    correct: stats.correct,
    wrong: stats.wrong,
    skipped: stats.skipped,
    elapsedMs: input.elapsedMs,
    finishedAt: Date.now(),
    records: [...input.records],
  }
  persist([attempt, ...loadAttempts()])
  return attempt
}

export function attemptsForStudent(name: string, className: string): Attempt[] {
  const studentName = name.trim()
  const klass = className.trim()
  return loadAttempts().filter(
    (attempt) => attempt.studentName === studentName && attempt.className === klass,
  )
}

export function formatAttemptWhen(ms: number): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(ms)
}
