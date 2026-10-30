import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { playBoom, playChime, primeAudio, setAlarm } from "./audio.ts"
import {
  makeMeteors,
  pickMeteor,
  resolveSeconds,
  type MeteorSpec,
  type TimeChoice,
} from "./field.ts"
import { createProblemSource, type Problem } from "./problems.ts"

export type Phase = "menu" | "arming" | "approach" | "solve" | "breakup" | "blast" | "over"
export type Feedback = "correct" | "wrong" | "timeout" | null
export type EffectKind = "none" | "break" | "blast"

const APPROACH_MS = 1100
const BREAK_MS = 1150
const BLAST_MS = 1550

export function useMeteorGame() {
  const [phase, setPhase] = useState<Phase>("menu")
  const [timeChoice, setTimeChoice] = useState<TimeChoice>(30)
  const [customText, setCustomTextState] = useState("")
  const [customError, setCustomError] = useState(false)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [problem, setProblem] = useState<Problem | null>(null)
  const [entry, setEntry] = useState("")
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [remainingMs, setRemainingMs] = useState(30_000)
  const [limitMs, setLimitMs] = useState(30_000)
  const [focusId, setFocusId] = useState<number | null>(null)
  const [effect, setEffect] = useState<EffectKind>("none")
  const [effectToken, setEffectToken] = useState(0)
  const [fieldSeed, setFieldSeed] = useState(1)

  const meteors = useMemo(() => makeMeteors(fieldSeed), [fieldSeed])
  const sourceRef = useRef(createProblemSource())
  const livesRef = useRef(3)
  const solvedRef = useRef(0)
  const focusRef = useRef<number | null>(null)
  const lockRef = useRef(false)
  const limitRef = useRef(30_000)
  const deadlineRef = useRef(0)
  const problemRef = useRef<Problem | null>(null)
  useEffect(() => {
    problemRef.current = problem
  }, [problem])

  const chooseTime = useCallback((choice: TimeChoice) => {
    setTimeChoice(choice)
    setCustomError(false)
  }, [])

  const setCustomText = useCallback((value: string) => {
    setCustomTextState(value.replace(/\D/g, "").slice(0, 3))
    setCustomError(false)
    setTimeChoice("custom")
  }, [])

  const start = useCallback(() => {
    const seconds = resolveSeconds(timeChoice, customText)
    if (seconds == null) {
      setCustomError(true)
      return
    }
    primeAudio()
    const ms = seconds * 1000
    limitRef.current = ms
    setLimitMs(ms)
    setRemainingMs(ms)
    setScore(0)
    setLives(3)
    livesRef.current = 3
    solvedRef.current = 0
    sourceRef.current.reset()
    setProblem(null)
    setEntry("")
    setFeedback(null)
    setFocusId(null)
    focusRef.current = null
    setEffect("none")
    lockRef.current = false
    setCustomError(false)
    setPhase("arming")
  }, [customText, timeChoice])

  const launch = useCallback(() => {
    if (phase !== "arming") return
    primeAudio()
    const id = pickMeteor(null, meteors.length)
    focusRef.current = id
    setFocusId(id)
    setFeedback(null)
    setProblem(null)
    setEntry("")
    setEffect("none")
    setRemainingMs(limitRef.current)
    setPhase("approach")
  }, [meteors.length, phase])

  useEffect(() => {
    if (phase !== "approach") return
    const limit = limitRef.current
    const timer = window.setTimeout(() => {
      const next = sourceRef.current.next(solvedRef.current)
      setProblem(next)
      setEntry("")
      setFeedback(null)
      deadlineRef.current = performance.now() + limit
      setRemainingMs(limit)
      lockRef.current = false
      setPhase("solve")
    }, APPROACH_MS)
    return () => window.clearTimeout(timer)
  }, [phase, focusId])

  const fail = useCallback(() => {
    if (lockRef.current) return
    lockRef.current = true
    setAlarm(false)
    playBoom()
    const left = Math.max(0, livesRef.current - 1)
    livesRef.current = left
    setLives(left)
    setRemainingMs(0)
    setFeedback("timeout")
    setEffect("blast")
    setEffectToken((token) => token + 1)
    setPhase("blast")
  }, [])

  useEffect(() => {
    if (phase !== "solve") return
    let frame = 0
    const tick = () => {
      const left = Math.max(0, deadlineRef.current - performance.now())
      setRemainingMs(left)
      if (left <= 0) {
        fail()
        return
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [fail, phase])

  const alarm = phase === "solve" && remainingMs > 0 && remainingMs <= 5000
  useEffect(() => {
    setAlarm(alarm)
    return () => setAlarm(false)
  }, [alarm])

  const submit = useCallback(() => {
    if (phase !== "solve" || lockRef.current) return
    const current = problemRef.current
    if (!current) return
    if (!/^\d+$/.test(entry) || Number(entry) !== current.answer) {
      setFeedback("wrong")
      return
    }
    lockRef.current = true
    setAlarm(false)
    playChime()
    solvedRef.current += 1
    setScore((value) => value + 100)
    setFeedback("correct")
    setEffect("break")
    setEffectToken((token) => token + 1)
    setPhase("breakup")
  }, [entry, phase])

  const onEntry = useCallback((value: string) => {
    setEntry(value.replace(/\D/g, "").slice(0, 6))
    setFeedback((current) => (current === "wrong" ? null : current))
  }, [])

  useEffect(() => {
    if (phase !== "breakup" && phase !== "blast") return
    const ending = phase
    const timer = window.setTimeout(() => {
      if (ending === "blast" && livesRef.current <= 0) {
        setEffect("none")
        setFocusId(null)
        focusRef.current = null
        setPhase("over")
        return
      }
      const id = pickMeteor(focusRef.current, meteors.length)
      focusRef.current = id
      setFocusId(id)
      setEffect("none")
      setFeedback(null)
      setProblem(null)
      setEntry("")
      setRemainingMs(limitRef.current)
      lockRef.current = false
      setPhase("approach")
    }, ending === "blast" ? BLAST_MS : BREAK_MS)
    return () => window.clearTimeout(timer)
  }, [meteors.length, phase])

  const playAgain = useCallback(() => {
    setAlarm(false)
    sourceRef.current.reset()
    livesRef.current = 3
    solvedRef.current = 0
    lockRef.current = false
    focusRef.current = null
    limitRef.current = 30_000
    setScore(0)
    setLives(3)
    setProblem(null)
    setEntry("")
    setFeedback(null)
    setFocusId(null)
    setEffect("none")
    setTimeChoice(30)
    setCustomTextState("")
    setCustomError(false)
    setLimitMs(30_000)
    setRemainingMs(30_000)
    setFieldSeed((seed) => seed + 1)
    setPhase("menu")
  }, [])

  useEffect(() => {
    return () => setAlarm(false)
  }, [])

  const clockMs =
    phase === "solve" || phase === "breakup" || phase === "blast" || phase === "over"
      ? remainingMs
      : limitMs

  return {
    phase,
    timeChoice,
    customText,
    customError,
    score,
    lives,
    problem,
    entry,
    feedback,
    clockMs,
    focusId,
    effect,
    effectToken,
    meteors,
    chooseTime,
    setCustomText,
    start,
    launch,
    submit,
    onEntry,
    playAgain,
  }
}

export type MeteorGame = ReturnType<typeof useMeteorGame>
export type { MeteorSpec, Problem }
