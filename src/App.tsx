import { useCallback, useMemo, useState } from "react"
import { QUESTIONS, type Camera } from "./data/questions.ts"
import { Gate } from "./components/Gate.tsx"
import { QuestionSheet } from "./components/QuestionSheet.tsx"
import { ResultsCard, ReviewCard, StartCard } from "./components/Overlays.tsx"
import { TeacherCabinet } from "./components/TeacherCabinet.tsx"
import { TopBar } from "./components/TopBar.tsx"
import { WorldMap } from "./components/WorldMap.tsx"
import type { AnswerRecord, Outcome } from "./game/logic.ts"
import { QUIZ_MS } from "./game/logic.ts"
import { useQuiz } from "./game/useQuiz.ts"
import { clearSession, loadSession, saveSession, type Session } from "./session/session.ts"
import { attemptsForStudent, saveAttempt } from "./session/results.ts"
import { useAttempts } from "./session/useAttempts.ts"

const WORLD: Camera = { center: [18, 12], zoom: 2 }

export default function App() {
  const { attempts, refresh } = useAttempts()
  const [session, setSession] = useState<Session | null>(() => loadSession())
  const [historyTick, setHistoryTick] = useState(0)

  const onFinished = useCallback(
    (payload: { records: AnswerRecord[]; elapsedMs: number }) => {
      if (!session || session.role !== "student") return
      saveAttempt({
        studentName: session.name,
        className: session.className,
        elapsedMs: payload.elapsedMs,
        records: payload.records,
      })
      setHistoryTick((value) => value + 1)
    },
    [session],
  )

  const quiz = useQuiz(onFinished)

  const studentHistory = useMemo(() => {
    if (!session || session.role !== "student") return []
    return attemptsForStudent(session.name, session.className)
  }, [session, attempts, historyTick])

  const question = QUESTIONS[quiz.index] ?? QUESTIONS[0]
  const playing = session?.role === "student" && quiz.phase === "play"
  const showReveal = playing && quiz.picked !== null
  const camera = !playing ? WORLD : showReveal ? question.reveal.camera : question.camera
  const country = playing ? (question.focusCountry ?? null) : null
  const reveal = showReveal ? question.reveal : null

  const outcomes = QUESTIONS.map((item, index) => {
    if (!session || session.role !== "student") return "upcoming" as const
    const record = quiz.records.find((entry) => entry.questionId === item.id)
    if (record) return record.outcome
    if (playing && index === quiz.index) return "current" as const
    return "upcoming" as const
  })

  const barPhase = !session ? "gate" : session.role === "teacher" ? "teacher" : quiz.phase
  const sessionLabel =
    session?.role === "student" ? session.name : session?.role === "teacher" ? "Учитель" : ""

  const exit = session
    ? () => {
        clearSession()
        setSession(null)
      }
    : null

  const enterStudent = (name: string, className: string) => {
    const next: Session = { role: "student", name, className }
    saveSession(next)
    setSession(next)
  }

  const enterTeacher = () => {
    const next: Session = { role: "teacher" }
    saveSession(next)
    setSession(next)
    refresh()
  }

  return (
    <div className="game">
      <WorldMap camera={camera} country={country} reveal={reveal} />
      <TopBar
        phase={barPhase}
        questionNumber={quiz.index + 1}
        remainingMs={session?.role === "student" ? quiz.remainingMs : QUIZ_MS}
        elapsedMs={quiz.elapsedMs}
        score={quiz.stats.score}
        outcomes={outcomes as (Outcome | "current" | "upcoming")[]}
        sessionLabel={sessionLabel}
        onExit={exit}
      />
      {!session ? <Gate onStudent={enterStudent} onTeacher={enterTeacher} /> : null}
      {session?.role === "teacher" ? <TeacherCabinet attempts={attempts} onRefresh={refresh} /> : null}
      {session?.role === "student" && quiz.phase === "ready" ? (
        <StartCard
          onStart={quiz.start}
          studentName={session.name}
          className={session.className}
          pastAttempts={studentHistory}
        />
      ) : null}
      {playing ? (
        <QuestionSheet
          question={question}
          number={quiz.index + 1}
          picked={quiz.picked}
          onChoose={quiz.choose}
          onSkip={quiz.skip}
          onNext={quiz.next}
        />
      ) : null}
      {session?.role === "student" && quiz.phase === "results" ? (
        <ResultsCard
          stats={quiz.stats}
          elapsedMs={quiz.elapsedMs}
          onReplay={quiz.start}
          onReview={quiz.review}
        />
      ) : null}
      {session?.role === "student" && quiz.phase === "review" ? (
        <ReviewCard records={quiz.records} onClose={quiz.closeReview} />
      ) : null}
    </div>
  )
}
