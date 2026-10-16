import type { Question } from "../data/questions.ts"

const LETTERS = ["А", "Б", "В", "Г"] as const

export function QuestionSheet({
  question,
  number,
  picked,
  onChoose,
  onSkip,
  onNext,
}: {
  question: Question
  number: number
  picked: number | null
  onChoose: (index: number) => void
  onSkip: () => void
  onNext: () => void
}) {
  return (
    <section className="sheet" aria-live="polite" data-testid="sheet">
      <div className="q-body" key={question.id}>
        <div className="q-meta">
          <span className="q-num">{String(number).padStart(2, "0")}</span>
          <span className="q-cat">{question.category}</span>
        </div>
        <h2 className="q-text" data-testid="question">
          {question.question}
        </h2>
        <div className="answers">
          {question.options.map((text, index) => {
            const locked = picked !== null
            const correct = locked && index === question.correctAnswer
            const wrong = locked && index === picked && index !== question.correctAnswer
            const idle = locked && !correct && !wrong
            const className = [
              "option",
              correct ? "option-correct" : "",
              wrong ? "option-wrong" : "",
              idle ? "option-idle" : "",
            ]
              .filter(Boolean)
              .join(" ")
            return (
              <button
                key={text}
                type="button"
                className={className}
                disabled={locked}
                onClick={() => onChoose(index)}
                data-testid="option"
              >
                <span className="opt-letter">{LETTERS[index]}</span>
                <span>{text}</span>
              </button>
            )
          })}
        </div>
        {picked !== null ? <p className="explain" data-testid="explain">{question.explanation}</p> : null}
        <div className="sheet-actions">
          {picked === null ? (
            <button type="button" className="advance ghost" onClick={onSkip} data-testid="skip">
              Пропустить
            </button>
          ) : (
            <button type="button" className="advance" onClick={onNext} data-testid="next">
              Следующий вопрос
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
