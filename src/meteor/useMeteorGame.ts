import { useEffect, useRef, useState } from "react"
import { generateEquation } from "./problems.ts"
import { METEOR_FIELD } from "./rocks.ts"
import type {
  Difficulty,
  Ending,
  EquationView,
  Feedback,
  Phase,
  ProblemCount,
  Settings,
  Status,
  TimeLimit,
} from "./types.ts"

const APPROACH_MS = 1040
const RESOLVE_MS = 880
const POINTS = 100

const INITIAL: Settings = {
  time: 30,
  difficulty: "medium",
  count: 10,
}

function pickMeteor(current: string | null, used: string[]): { id: string; used: string[] } {
  const ids = METEOR_FIELD.map((meteor) => meteor.id)
  let pool = ids.filter((id) => id !== current && !used.includes(id))
  let nextUsed = used
  if (pool.length === 0) {
    nextUsed = []
    pool = ids.filter((id) => id !== current)
  }
  const id = pool[Math.floor(Math.random() * pool.length)] ?? ids[0] ?? "m1"
  return { id, used: [...nextUsed, id] }
}

export function useMeteorGame() {
  const [settings, setSettings] = useState<Settings>(INITIAL)
  const [phase, setPhase] = useState<Phase>("menu")
  const [status, setStatus] = useState<Status>("idle")
  const [ending, setEnding] = useState<Ending>("clear")
  const [focusId, setFocusId] = useState<string | null>(null)
  const [prompt, setPrompt] = useState<EquationView | null>(null)
  const [entry, setEntry] = useState("")
  const [remainingMs, setRemainingMs] = useState(INITIAL.time * 1000)
  const [limitMs, setLimitMs] = useState(INITIAL.time * 1000)
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [missed, setMissed] = useState(0)
  const [wrongTries, setWrongTries] = useState(0)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [round, setRound] = useState(0)

  const settingsRef = useRef(settings)
  const statusRef = useRef<Status>("idle")
  const focusRef = useRef<string | null>(null)
  const entryRef = useRef("")
  const answerRef = useRef(0)
  const usedRef = useRef<string[]>([])
  const deadlineRef = useRef(0)
  const advanceTimer = useRef(0)
  const wrongTimer = useRef(0)
  const statsRef = useRef({ correct: 0, missed: 0, wrong: 0, score: 0 })

  function clearPending() {
    window.clearTimeout(advanceTimer.current)
    window.clearTimeout(wrongTimer.current)
    advanceTimer.current = 0
    wrongTimer.current = 0
  }

  function approachNext() {
    const picked = pickMeteor(focusRef.current, usedRef.current)
    usedRef.current = picked.used
    focusRef.current = picked.id
    setFocusId(picked.id)
    setPrompt(null)
    entryRef.current = ""
    setEntry("")
    setFeedback(null)
    statusRef.current = "approaching"
    setStatus("approaching")
    setRound((value) => value + 1)
  }

  function finishToResults(kind: Ending) {
    statusRef.current = "idle"
    setStatus("idle")
    focusRef.current = null
    setFocusId(null)
    setPrompt(null)
    setEnding(kind)
    setPhase("results")
  }

  function scheduleNext() {
    window.clearTimeout(advanceTimer.current)
    advanceTimer.current = window.setTimeout(() => {
      const finished = statsRef.current.correct + statsRef.current.missed
      const count = settingsRef.current.count
      if (count !== "infinite" && finished >= count) {
        finishToResults("clear")
        return
      }
      approachNext()
    }, RESOLVE_MS)
  }

  function succeed() {
    if (statusRef.current !== "solving") return
    statusRef.current = "success"
    statsRef.current.correct += 1
    statsRef.current.score += POINTS
    setCorrect(statsRef.current.correct)
    setScore(statsRef.current.score)
    setFeedback("correct")
    setStatus("success")
    scheduleNext()
  }

  function miss() {
    if (statusRef.current !== "solving") return
    statusRef.current = "miss"
    statsRef.current.missed += 1
    setMissed(statsRef.current.missed)
    setRemainingMs(0)
    setFeedback("timeout")
    setStatus("miss")
    scheduleNext()
  }

  function markWrong() {
    if (statusRef.current !== "solving") return
    statsRef.current.wrong += 1
    setWrongTries(statsRef.current.wrong)
    entryRef.current = ""
    setEntry("")
    setFeedback("wrong")
    window.clearTimeout(wrongTimer.current)
    wrongTimer.current = window.setTimeout(() => {
      setFeedback((current) => (current === "wrong" ? null : current))
    }, 1100)
  }

  const actions = useRef({
    typeDigit(digit: string) {
      if (statusRef.current !== "solving") return
      const current = entryRef.current
      if (current.length >= 4) return
      const next = current === "0" ? digit : current + digit
      entryRef.current = next
      setEntry(next)
    },
    backspace() {
      if (statusRef.current !== "solving") return
      const next = entryRef.current.slice(0, -1)
      entryRef.current = next
      setEntry(next)
    },
    submit() {
      if (statusRef.current !== "solving") return
      if (entryRef.current.length === 0) return
      const value = Number(entryRef.current)
      if (!Number.isFinite(value)) return
      if (value === answerRef.current) succeed()
      else markWrong()
    },
  })

  useEffect(() => {
    if (phase !== "play" || status !== "approaching") return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const id = window.setTimeout(() => {
      if (statusRef.current !== "approaching") return
      const equation = generateEquation(settingsRef.current.difficulty)
      answerRef.current = equation.answer
      setPrompt({ left: equation.left, op: equation.op, right: equation.right })
      const limit = settingsRef.current.time * 1000
      deadlineRef.current = performance.now() + limit
      setLimitMs(limit)
      setRemainingMs(limit)
      statusRef.current = "solving"
      setStatus("solving")
    }, reduced ? 220 : APPROACH_MS)
    return () => window.clearTimeout(id)
  }, [phase, status, round])

  useEffect(() => {
    if (status !== "solving") return
    const id = window.setInterval(() => {
      const left = deadlineRef.current - performance.now()
      if (left <= 0) {
        window.clearInterval(id)
        setRemainingMs(0)
        miss()
        return
      }
      setRemainingMs(left)
    }, 100)
    return () => window.clearInterval(id)
  }, [status, round])

  useEffect(() => {
    if (phase !== "play") return
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return
      const target = event.target
      if (target instanceof HTMLElement && target.closest("button, a, input, textarea")) {
        if (event.key === "Enter" || event.key === " ") return
      }
      if (event.key >= "0" && event.key <= "9") {
        event.preventDefault()
        actions.current.typeDigit(event.key)
        return
      }
      if (event.key === "Backspace") {
        event.preventDefault()
        actions.current.backspace()
        return
      }
      if (event.key === "Enter") {
        event.preventDefault()
        actions.current.submit()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [phase])

  useEffect(() => () => clearPending(), [])

  const finished = correct + missed
  const currentNumber = status === "success" || status === "miss" ? Math.max(finished, 1) : finished + 1
  const accuracy = finished === 0 ? 0 : Math.round((correct / finished) * 100)

  function start() {
    clearPending()
    statsRef.current = { correct: 0, missed: 0, wrong: 0, score: 0 }
    usedRef.current = []
    settingsRef.current = settings
    setScore(0)
    setCorrect(0)
    setMissed(0)
    setWrongTries(0)
    setFeedback(null)
    setPrompt(null)
    entryRef.current = ""
    setEntry("")
    setLimitMs(settings.time * 1000)
    setRemainingMs(settings.time * 1000)
    setPhase("play")
    focusRef.current = null
    const picked = pickMeteor(null, [])
    usedRef.current = picked.used
    focusRef.current = picked.id
    setFocusId(picked.id)
    statusRef.current = "approaching"
    setStatus("approaching")
    setRound((value) => value + 1)
  }

  function stop() {
    clearPending()
    finishToResults("stop")
  }

  return {
    settings,
    setTime(time: TimeLimit) {
      setSettings((current) => ({ ...current, time }))
    },
    setDifficulty(difficulty: Difficulty) {
      setSettings((current) => ({ ...current, difficulty }))
    },
    setCount(count: ProblemCount) {
      setSettings((current) => ({ ...current, count }))
    },
    phase,
    status,
    ending,
    meteors: METEOR_FIELD,
    focusId,
    prompt,
    entry,
    remainingMs,
    limitMs,
    score,
    correct,
    missed,
    wrongTries,
    feedback,
    currentNumber,
    accuracy,
    start,
    replay: start,
    menu() {
      clearPending()
      statusRef.current = "idle"
      setStatus("idle")
      focusRef.current = null
      setFocusId(null)
      setPrompt(null)
      setFeedback(null)
      setPhase("menu")
    },
    stop,
    typeDigit: (digit: string) => actions.current.typeDigit(digit),
    backspace: () => actions.current.backspace(),
    submit: () => actions.current.submit(),
  }
}
