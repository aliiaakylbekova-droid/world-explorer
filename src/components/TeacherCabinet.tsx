import { useState, type FormEvent } from "react"
import { formatClock } from "../game/logic.ts"
import { loadTeacherAuth, saveTeacherAuth } from "../session/credentials.ts"
import { formatAttemptWhen, type Attempt } from "../session/results.ts"
import { ReviewCard } from "./Overlays.tsx"

export function TeacherCabinet({
  attempts,
  onRefresh,
}: {
  attempts: readonly Attempt[]
  onRefresh: () => void
}) {
  const [opened, setOpened] = useState<Attempt | null>(null)
  const [code, setCode] = useState(() => loadTeacherAuth().code)
  const [pin, setPin] = useState(() => loadTeacherAuth().pin)
  const [savedNote, setSavedNote] = useState("")

  const saveAuth = (event: FormEvent) => {
    event.preventDefault()
    const nextCode = code.trim()
    const nextPin = pin.trim()
    if (nextCode.length < 2 || nextPin.length < 4) {
      setSavedNote("Код — от двух символов, PIN — от четырёх.")
      return
    }
    saveTeacherAuth({ code: nextCode, pin: nextPin })
    setSavedNote("Новый код и PIN сохранены на этом устройстве.")
  }

  if (opened) {
    return (
      <ReviewCard
        records={opened.records}
        onClose={() => setOpened(null)}
        eyebrow={`${opened.studentName}${opened.className ? ` · ${opened.className}` : ""}`}
        title={`${opened.score} из 1500`}
      />
    )
  }

  return (
    <div className="overlay-anchor">
      <section className="card teacher-card" data-testid="teacher-cabinet">
        <div className="review-head">
          <div>
            <p className="eyebrow">Кабинет учителя</p>
            <h2>Попытки учеников</h2>
          </div>
          <button type="button" className="advance ghost" onClick={onRefresh} data-testid="refresh-attempts">
            Обновить
          </button>
        </div>
        <p className="lede">
          Результаты хранятся в этом браузере (localStorage). Если ученик прошёл квиз на другом
          компьютере, здесь его не будет. Нажми «Обновить», если открыт второй вкладкой.
        </p>
        {attempts.length === 0 ? (
          <p className="empty-attempts" data-testid="empty-attempts">
            Пока нет попыток. Пусть ученик войдёт на этом же устройстве и пройдёт квиз.
          </p>
        ) : (
          <ul className="attempt-list">
            {attempts.map((attempt) => (
              <li key={attempt.id}>
                <button
                  type="button"
                  className="attempt-row"
                  onClick={() => setOpened(attempt)}
                  data-testid="attempt-row"
                >
                  <span className="attempt-who">
                    <strong>{attempt.studentName}</strong>
                    {attempt.className ? <span className="attempt-class">{attempt.className}</span> : null}
                  </span>
                  <span className="attempt-score">
                    {attempt.score}
                    <small> / 1500</small>
                  </span>
                  <span className="attempt-meta">{attempt.percent}%</span>
                  <span className="attempt-meta">верно {attempt.correct}/15</span>
                  <span className="attempt-meta">{formatClock(attempt.elapsedMs, "elapsed")}</span>
                  <span className="attempt-when">{formatAttemptWhen(attempt.finishedAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <form className="auth-edit" onSubmit={saveAuth}>
          <p className="eyebrow">Сменить вход учителя</p>
          <div className="auth-fields">
            <label className="field">
              <span>Код</span>
              <input value={code} onChange={(event) => setCode(event.target.value)} />
            </label>
            <label className="field">
              <span>PIN</span>
              <input value={pin} onChange={(event) => setPin(event.target.value)} />
            </label>
            <button type="submit" className="advance ghost">
              Сохранить
            </button>
          </div>
          {savedNote ? <p className="form-note">{savedNote}</p> : null}
        </form>
      </section>
    </div>
  )
}
