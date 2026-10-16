import { QUESTIONS } from "../data/questions.ts"
import { formatClock, resultCopy, type AnswerRecord, type Tally } from "../game/logic.ts"

export function StartCard({ onStart }: { onStart: () => void }) {
  return (
    <div className="overlay-anchor">
      <section className="card start-card">
        <p className="eyebrow">География · 7 класс</p>
        <h1>WORLD EXPLORER</h1>
        <p className="lede">
          Пятнадцать вопросов и двадцать минут. Карта остаётся на экране: её можно двигать и
          приближать, пока ищешь ответ.
        </p>
        <ul className="rules">
          <li>Верный ответ — 100 очков</li>
          <li>Ошибка или пропуск — 0</li>
          <li>Максимум — 1500</li>
        </ul>
        <button type="button" className="advance" onClick={onStart} data-testid="start">
          Начать
        </button>
      </section>
    </div>
  )
}

export function ResultsCard({
  stats,
  elapsedMs,
  onReplay,
  onReview,
}: {
  stats: Tally
  elapsedMs: number
  onReplay: () => void
  onReview: () => void
}) {
  const message = resultCopy(stats.correct)
  return (
    <div className="overlay-anchor">
      <section className="card results-card" data-testid="results">
        <p className="eyebrow">{message.title}</p>
        <h2 className="score-hero">
          {stats.score}
          <span> из 1500</span>
        </h2>
        <dl className="stats">
          <div>
            <dt>Верно</dt>
            <dd>
              {stats.correct} / 15
            </dd>
          </div>
          <div>
            <dt>Ошибки</dt>
            <dd>{stats.wrong}</dd>
          </div>
          <div>
            <dt>Пропуски</dt>
            <dd>{stats.skipped}</dd>
          </div>
          <div>
            <dt>Время</dt>
            <dd>{formatClock(elapsedMs, "elapsed")}</dd>
          </div>
          <div>
            <dt>Точность</dt>
            <dd>{stats.percent}%</dd>
          </div>
        </dl>
        <p className="lede">{message.text}</p>
        <div className="card-actions">
          <button type="button" className="advance" onClick={onReplay} data-testid="replay">
            Пройти ещё раз
          </button>
          <button type="button" className="advance ghost" onClick={onReview} data-testid="review">
            Посмотреть ответы
          </button>
        </div>
      </section>
    </div>
  )
}

export function ReviewCard({
  records,
  onClose,
}: {
  records: readonly AnswerRecord[]
  onClose: () => void
}) {
  const byId = new Map(records.map((record) => [record.questionId, record]))
  return (
    <div className="overlay-anchor">
      <section className="card review-card" data-testid="review-list">
        <div className="review-head">
          <div>
            <p className="eyebrow">Разбор</p>
            <h2>Ответы</h2>
          </div>
          <button type="button" className="advance ghost" onClick={onClose} data-testid="close-review">
            Закрыть
          </button>
        </div>
        <ol className="review-list">
          {QUESTIONS.map((question, index) => {
            const record = byId.get(question.id)
            const outcome = record?.outcome ?? "skipped"
            const selected =
              record?.selectedIndex != null ? question.options[record.selectedIndex] : null
            return (
              <li key={question.id} className={`review-item review-${outcome}`}>
                <p className="q-meta">
                  <span className="q-num">{String(index + 1).padStart(2, "0")}</span>
                  <span className="q-cat">{question.category}</span>
                  <span className="review-tag">
                    {outcome === "correct" ? "+100" : outcome === "wrong" ? "Ошибка" : "Пропущен"}
                  </span>
                </p>
                <p className="review-q">{question.question}</p>
                {outcome === "skipped" ? (
                  <p className="review-your">Вопрос пропущен</p>
                ) : (
                  <p className="review-your">Ваш ответ: {selected}</p>
                )}
                <p className="review-correct">
                  Правильный ответ: {question.options[question.correctAnswer]}
                </p>
                <p className="review-why">{question.explanation}</p>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
