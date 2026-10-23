import type { Feedback, ProblemCount, Status } from "./types.ts"

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "back", "0", "ok"] as const

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
  const solving = status === "solving" || status === "success" || status === "miss"
  const ratio = !solving || limitMs <= 0 ? 1 : Math.max(0, Math.min(1, remainingMs / limitMs))
  const seconds = solving ? Math.ceil(Math.max(0, remainingMs) / 1000) : Math.round(limitMs / 1000)
  const urgent = status === "solving" && seconds <= 5
  return (
    <div className={urgent ? "mm-timer is-urgent" : "mm-timer"} role="timer" aria-label={`Осталось секунд: ${seconds}`}>
      <svg viewBox="0 0 52 52" aria-hidden="true">
        <circle className="mm-timer-track" cx="26" cy="26" r={radius} />
        <circle
          className="mm-timer-value"
          cx="26"
          cy="26"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
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
  finished,
  status,
  feedback,
  entry,
  remainingMs,
  limitMs,
  onDigit,
  onBackspace,
  onSubmit,
  onStop,
}: {
  score: number
  count: ProblemCount
  currentNumber: number
  finished: number
  status: Status
  feedback: Feedback
  entry: string
  remainingMs: number
  limitMs: number
  onDigit: (digit: string) => void
  onBackspace: () => void
  onSubmit: () => void
  onStop: () => void
}) {
  const locked = status !== "solving"
  const message =
    feedback === "correct"
      ? "Верно!"
      : feedback === "wrong"
        ? "Неверно. Попробуй ещё раз"
        : feedback === "timeout"
          ? "Время вышло"
          : status === "approaching"
            ? "Метеор приближается…"
            : "Введи ответ"
  const progress = count === "infinite" ? 0 : Math.min(100, (finished / count) * 100)

  return (
    <div className="mm-play">
      <header className="mm-hud">
        <div className="mm-hud-block">
          <span className="mm-kicker">Счёт</span>
          <strong className="mm-score">{score}</strong>
          {status === "success" ? <em className="mm-gain">+100</em> : null}
        </div>
        <div className="mm-hud-block mm-hud-mid">
          <span className="mm-kicker">{count === "infinite" ? "Бесконечно" : "Прогресс"}</span>
          <strong>{count === "infinite" ? `Задача ${currentNumber}` : `${currentNumber}/${count}`}</strong>
          {count === "infinite" ? null : (
            <div className="mm-bar" aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
        <TimerRing remainingMs={remainingMs} limitMs={limitMs} status={status} />
        {count === "infinite" ? (
          <button type="button" className="mm-stop" onClick={onStop}>
            Завершить
          </button>
        ) : null}
      </header>

      <footer className="mm-dock">
        <p className={`mm-feedback is-${feedback ?? status}`} aria-live="polite">
          {message}
        </p>
        <div className="mm-entry" aria-label="Твой ответ" data-testid="entry">
          <span className="mm-entry-label">Ответ</span>
          <span className="mm-entry-value">{entry || "–"}</span>
        </div>
        <div className="mm-keys" aria-label="Клавиатура">
          {KEYS.map((key) => {
            const okDisabled = key === "ok" && (locked || entry.length === 0)
            const label = key === "back" ? <BackspaceIcon /> : key === "ok" ? "ОК" : key
            const name = key === "back" ? "Стереть" : key === "ok" ? "Ответить" : `Цифра ${key}`
            return (
              <button
                key={key}
                type="button"
                className={key === "ok" ? "mm-key mm-key-go" : key === "back" ? "mm-key mm-key-back" : "mm-key"}
                disabled={locked || okDisabled}
                aria-label={name}
                onClick={() => {
                  if (key === "back") onBackspace()
                  else if (key === "ok") onSubmit()
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
