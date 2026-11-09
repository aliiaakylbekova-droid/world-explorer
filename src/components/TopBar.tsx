import { formatClock, type Outcome, type Phase } from "../game/logic.ts"

const PIP_COUNT = 15

export function TopBar({
  phase,
  questionNumber,
  remainingMs,
  elapsedMs,
  score,
  outcomes,
  sessionLabel,
  onExit,
}: {
  phase: Phase | "gate" | "teacher"
  questionNumber: number
  remainingMs: number
  elapsedMs: number
  score: number
  outcomes: readonly (Outcome | "current" | "upcoming")[]
  sessionLabel: string
  onExit: (() => void) | null
}) {
  const playing = phase === "play" || phase === "ready" || phase === "gate"
  const clock = playing
    ? formatClock(remainingMs, "remaining")
    : formatClock(elapsedMs, "elapsed")
  const danger = playing && remainingMs <= 30_000
  const warn = playing && !danger && remainingMs <= 120_000
  const counter =
    phase === "play"
      ? `${String(questionNumber).padStart(2, "0")} / ${PIP_COUNT}`
      : phase === "teacher"
        ? "Кабинет учителя"
        : phase === "gate"
          ? "15 вопросов"
          : "15 вопросов"

  return (
    <header className="topbar">
      <div className="brand">
        <p className="brand-title">WORLD EXPLORER</p>
        <p className="brand-sub">{sessionLabel ? `${sessionLabel} · ${counter}` : counter}</p>
      </div>
      <div className="pips" aria-label="Прогресс по вопросам">
        {outcomes.slice(0, PIP_COUNT).map((state, index) => (
          <span key={index} className={`pip pip-${state}`} />
        ))}
      </div>
      <div className="hud-stats">
        {phase !== "gate" && phase !== "teacher" ? (
          <>
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
          </>
        ) : null}
        {onExit && phase !== "play" ? (
          <button type="button" className="exit-link" onClick={onExit} data-testid="exit-session">
            Выйти
          </button>
        ) : null}
      </div>
    </header>
  )
}
