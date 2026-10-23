import { QUESTIONS, type Camera } from "./data/questions.ts"
import { QuestionSheet } from "./components/QuestionSheet.tsx"
import { ResultsCard, ReviewCard, StartCard } from "./components/Overlays.tsx"
import { TopBar } from "./components/TopBar.tsx"
import { WorldMap } from "./components/WorldMap.tsx"
import type { Outcome } from "./game/logic.ts"
import { useQuiz } from "./game/useQuiz.ts"

const WORLD: Camera = { center: [18, 12], zoom: 2 }

export function ExplorerApp() {
  const quiz = useQuiz()
  const question = QUESTIONS[quiz.index] ?? QUESTIONS[0]

  const playing = quiz.phase === "play"
  const showReveal = playing && quiz.picked !== null
  const camera = !playing ? WORLD : showReveal ? question.reveal.camera : question.camera
  const country = playing ? (question.focusCountry ?? null) : null
  const reveal = showReveal ? question.reveal : null

  const outcomes = QUESTIONS.map((item, index) => {
    const record = quiz.records.find((entry) => entry.questionId === item.id)
    if (record) return record.outcome
    if (playing && index === quiz.index) return "current" as const
    return "upcoming" as const
  })

  return (
    <div className="game">
      <WorldMap camera={camera} country={country} reveal={reveal} />
      <TopBar
        phase={quiz.phase}
        questionNumber={quiz.index + 1}
        remainingMs={quiz.remainingMs}
        elapsedMs={quiz.elapsedMs}
        score={quiz.stats.score}
        outcomes={outcomes as (Outcome | "current" | "upcoming")[]}
      />
      {quiz.phase === "ready" ? <StartCard onStart={quiz.start} /> : null}
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
      {quiz.phase === "results" ? (
        <ResultsCard
          stats={quiz.stats}
          elapsedMs={quiz.elapsedMs}
          onReplay={quiz.start}
          onReview={quiz.review}
        />
      ) : null}
      {quiz.phase === "review" ? (
        <ReviewCard records={quiz.records} onClose={quiz.closeReview} />
      ) : null}
    </div>
  )
}
