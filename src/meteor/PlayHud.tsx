import type { Feedback, ProblemCount, Status } from "./types.ts"

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "back", "0"] as const

function BackspaceIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d="M8.2 5.5h10.3A1.8 1.8 0 0 1 20.3 7.3v9.4a1.8 1.8 0 0 1-1.8 1.8H8.2L3 12l5.2-6.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M11 9.5l4.5 5M15.5 9.5l-4.5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function TimerRing({
  remainingMs,
  limitMs,
  status,
}: {
  remainingMs: number
  limitMs: number
  status: Status
}) {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const running = status === "solving"
  const ratio = limitMs <= 0 ? 1 : Math.max(0, Math.min(1, remainingMs / limitMs))
  const seconds = running || status === "success" || status === "miss" ? Math.ceil(Math.max(0, remainingMs) / 1000) : Math.round(limitMs / 1000)
  const tone = !running ? "" : seconds <= 5 ? "is-urgent" : ratio <= 0.34 ? "is-low" : ratio <= 0.62 ? "is-mid" : ""
  return (
    <div
      className={tone ? `mm-timer ${tone}` : "mm-timer"}
      role="timer"
      data-testid="timer"
      data-running={running ? "true" : "false"}
      data-seconds={seconds}
      aria-label={`Осталось секунд: ${seconds}`}
    >
      <svg viewBox="0 0 52 52" aria-hidden="true">
        <circle className="mm-timer-track" cx="26" cy="26" r={radius} />
        <circle
          className="mm-timer-value"
          cx="26"
          cy="26"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - (running || status === "success" ? ratio : status === "miss" ? 0 : 1))}
        />
      </svg>
      <span>{seconds}</span>
    </div>
  )
}

export function PlayHud({
  score,
  count,
  currentNumber,
  correct,
  streak,
  status,
  feedback,
  entry,
  remainingMs,
  limitMs,
  revealedAnswer,
  onDigit,
  onBackspace,
  onSubmit,
  onStop,
}: {
  score: number
  count: ProblemCount
  currentNumber: number
  correct: number
  streak: number
  status: Status
  feedback: Feedback
  entry: string
  remainingMs: number
  limitMs: number
  revealedAnswer: number | null
  onDigit: (digit: string) => void
  onBackspace: () => void
  onSubmit: () => void
  onStop: () => void
}) {
  const locked = status !== "solving"
  const problemLabel = count === "infinite" ? String(currentNumber) : `${currentNumber}/${count}`

  return (
    <div className="mm-play">
      <div className="mm-top-left">
        <div className="mm-corner" data-testid="score">
          <span className="mm-kicker">Счёт</span>
          <strong className="mm-score">{score}</strong>
          {status === "success" ? <em className="mm-gain">+100</em> : null}
        </div>
        <div className="mm-corner" data-testid="problem-number">
          <span className="mm-kicker">Задача</span>
          <strong>{problemLabel}</strong>
        </div>
      </div>
      <div className="mm-corner mm-corner-time">
        <TimerRing remainingMs={remainingMs} limitMs={limitMs} status={status} />
      </div>
      <div className="mm-corner mm-corner-hits" data-testid="correct-count">
        <span className="mm-kicker">Верно</span>
        <strong>{correct}</strong>
        {streak >= 2 ? (
          <em className="mm-streak" data-testid="streak">
            серия {streak}
          </em>
        ) : null}
      </div>
      {count === "infinite" ? (
        <button type="button" className="mm-stop" onClick={onStop}>
          Завершить
        </button>
      ) : null}

      {status === "miss" ? (
        <div className="mm-timeout" data-testid="timeout" aria-live="polite">
          <p className="mm-timeout-title">Время вышло!</p>
          <p className="mm-timeout-answer">
            Ответ: <strong>{revealedAnswer}</strong>
          </p>
        </div>
      ) : (
        <div className="mm-solve" data-testid="answer-dock">
          {status === "approaching" ? <p className="mm-feedback">Метеор приближается…</p> : null}
          {feedback === "wrong" ? (
            <p className="mm-feedback is-wrong" data-testid="wrong" aria-live="polite">
              Неверно! Попробуй ещё раз
            </p>
          ) : null}
          {feedback === "correct" ? <p className="mm-feedback is-correct">Верно!</p> : null}
          {status === "solving" ? (
            <>
              <div className="mm-entry" aria-label="Твой ответ" data-testid="entry">
                <span className="mm-entry-label">Ответ</span>
                <span className="mm-entry-value">{entry || "–"}</span>
              </div>
              <button
                type="button"
                className="mm-submit"
                data-testid="submit"
                onClick={onSubmit}
                disabled={entry.length === 0}
              >
                ОТВЕТИТЬ
              </button>
            </>
          ) : null}
        </div>
      )}

      <footer className="mm-dock">
        <div className="mm-keys" aria-label="Клавиатура">
          {KEYS.map((key) => {
            const label = key === "back" ? <BackspaceIcon /> : key
            const name = key === "back" ? "Стереть" : `Цифра ${key}`
            return (
              <button
                key={key}
                type="button"
                className={key === "back" ? "mm-key mm-key-back" : "mm-key"}
                disabled={locked}
                aria-label={name}
                onClick={() => {
                  if (key === "back") onBackspace()
                  else onDigit(key)
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </footer>
    </div>
  )
}
