import { useCallback, useEffect, useRef, useState } from "react"
import { QUESTIONS } from "../data/questions.ts"
import {
  QUIZ_MS,
  tally,
  withSkips,
  type AnswerRecord,
  type Phase,
} from "./logic.ts"

const QUESTION_IDS = QUESTIONS.map((question) => question.id)

export function useQuiz() {
  const [phase, setPhase] = useState<Phase>("ready")
  const [index, setIndex] = useState(0)
  const [records, setRecords] = useState<AnswerRecord[]>([])
  const [picked, setPicked] = useState<number | null>(null)
  const [remainingMs, setRemainingMs] = useState(QUIZ_MS)
  const [elapsedMs, setElapsedMs] = useState(0)

  const deadlineRef = useRef<number | null>(null)
  const startedAtRef = useRef<number | null>(null)
  const recordsRef = useRef<AnswerRecord[]>([])
  const finishedRef = useRef(false)
  const lockedRef = useRef(false)

  const endGame = useCallback((reason: "done" | "time") => {
    if (finishedRef.current) return
    finishedRef.current = true
    const started = startedAtRef.current
    const elapsed = started == null ? 0 : Math.min(QUIZ_MS, Math.max(0, Date.now() - started))
    setElapsedMs(reason === "time" ? QUIZ_MS : elapsed)
    setRemainingMs(reason === "time" ? 0 : Math.max(0, (deadlineRef.current ?? Date.now()) - Date.now()))
    const closed = withSkips(recordsRef.current, QUESTION_IDS)
    recordsRef.current = closed
    setRecords(closed)
    setPhase("results")
  }, [])

  useEffect(() => {
    if (phase !== "play" || deadlineRef.current == null) return
    const tick = () => {
      const deadline = deadlineRef.current
      if (deadline == null) return
      const left = deadline - Date.now()
      if (left <= 0) {
        setRemainingMs(0)
        endGame("time")
        return
      }
      setRemainingMs(left)
    }
    tick()
    const id = window.setInterval(tick, 200)
    return () => window.clearInterval(id)
  }, [phase, endGame])

  const start = useCallback(() => {
    finishedRef.current = false
    lockedRef.current = false
    const now = Date.now()
    startedAtRef.current = now
    deadlineRef.current = now + QUIZ_MS
    recordsRef.current = []
    setRecords([])
    setIndex(0)
    setPicked(null)
    setRemainingMs(QUIZ_MS)
    setElapsedMs(0)
    setPhase("play")
  }, [])

  const choose = useCallback(
    (option: number) => {
      if (finishedRef.current || lockedRef.current) return
      const question = QUESTIONS[index]
      if (!question) return
      if (recordsRef.current.some((record) => record.questionId === question.id)) return
      lockedRef.current = true
      const correct = option === question.correctAnswer
      const next: AnswerRecord = {
        questionId: question.id,
        outcome: correct ? "correct" : "wrong",
        selectedIndex: option,
        points: correct ? 100 : 0,
      }
      const updated = [...recordsRef.current, next]
      recordsRef.current = updated
      setRecords(updated)
      setPicked(option)
    },
    [index],
  )

  const skip = useCallback(() => {
    if (finishedRef.current || lockedRef.current) return
    const question = QUESTIONS[index]
    if (!question) return
    if (recordsRef.current.some((record) => record.questionId === question.id)) return
    lockedRef.current = true
    const next: AnswerRecord = {
      questionId: question.id,
      outcome: "skipped",
      selectedIndex: null,
      points: 0,
    }
    const updated = [...recordsRef.current, next]
    recordsRef.current = updated
    setRecords(updated)
    if (index >= QUESTIONS.length - 1) {
      endGame("done")
      return
    }
    lockedRef.current = false
    setPicked(null)
    setIndex(index + 1)
  }, [endGame, index])

  const next = useCallback(() => {
    if (finishedRef.current || picked === null) return
    if (index >= QUESTIONS.length - 1) {
      endGame("done")
      return
    }
    lockedRef.current = false
    setPicked(null)
    setIndex(index + 1)
  }, [endGame, index, picked])

  const review = useCallback(() => {
    if (phase === "results") setPhase("review")
  }, [phase])

  const closeReview = useCallback(() => {
    if (phase === "review") setPhase("results")
  }, [phase])

  return {
    phase,
    index,
    picked,
    records,
    remainingMs,
    elapsedMs,
    stats: tally(records),
    start,
    choose,
    skip,
    next,
    review,
    closeReview,
  }
}
