import { formatClock, type Outcome, type Phase } from "../game/logic.ts"

const PIP_COUNT = 15

export function TopBar({
  phase,
  questionNumber,
  remainingMs,
  elapsedMs,
  score,
  outcomes,
}: {
  phase: Phase
  questionNumber: number
  remainingMs: number
  elapsedMs: number
  score: number
  outcomes: readonly (Outcome | "current" | "upcoming")[]
}) {
  const playing = phase === "play" || phase === "ready"
  const clock = playing
    ? formatClock(remainingMs, "remaining")
    : formatClock(elapsedMs, "elapsed")
  const danger = playing && remainingMs <= 30_000
  const warn = playing && !danger && remainingMs <= 120_000
  const counter =
    phase === "play" ? `${String(questionNumber).padStart(2, "0")} / ${PIP_COUNT}` : "15 вопросов"

  return (
    <header className="topbar">
      <div className="brand">
        <p className="brand-title">WORLD EXPLORER</p>
        <p className="brand-sub">{counter}</p>
      </div>
      <div className="pips" aria-label="Прогресс по вопросам">
        {outcomes.slice(0, PIP_COUNT).map((state, index) => (
          <span key={index} className={`pip pip-${state}`} />
        ))}
      </div>
      <div className="hud-stats">
        <div className="stat">
          <span className="stat-label">{playing ? "осталось" : "прошло"}</span>
          <span
            className={`timer${warn ? " warn" : ""}${danger ? " danger" : ""}`}
            data-testid="timer"
          >
            {clock}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">очки</span>
          <span className="score" data-testid="score">
            {score}
          </span>
        </div>
      </div>
    </header>
  )
}
