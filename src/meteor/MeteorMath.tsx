import { Canvas, type RootState } from "@react-three/fiber"
import { useCallback, useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { formatRemaining, TIME_CHOICES, type TimeChoice } from "./field.ts"
import SpaceScene from "./SpaceScene.tsx"
import { useMeteorGame } from "./useMeteorGame.ts"
import "./meteor.css"

function timerTone(phase: string, ms: number): "calm" | "blink" | "danger" {
  if (phase !== "solve" && phase !== "blast") return "calm"
  if (ms <= 5000) return "danger"
  if (ms <= 10000) return "blink"
  return "calm"
}

export function MeteorMath() {
  const game = useMeteorGame()
  const inputRef = useRef<HTMLInputElement>(null)
  const customRef = useRef<HTMLInputElement>(null)
  const camera = useMemo(() => ({ position: [0, 0.15, 8.7] as [number, number, number], fov: 46, near: 0.1, far: 220 }), [])
  const gl = useMemo(() => ({ antialias: true, alpha: false, powerPreference: "high-performance" as const }), [])
  const dpr = useMemo(() => [1, 1.75] as [number, number], [])
  const onCreated = useCallback((state: RootState) => {
    state.gl.setClearColor("#050714")
    state.gl.toneMapping = THREE.ACESFilmicToneMapping
    state.gl.toneMappingExposure = 1.08
  }, [])
  const showHud = game.phase !== "menu"
  const solving = game.phase === "solve"
  const tone = timerTone(game.phase, game.clockMs)
  const clock = formatRemaining(game.clockMs)

  useEffect(() => {
    if (!solving) return
    inputRef.current?.focus()
  }, [solving, game.problem, game.feedback])

  const launch = game.launch
  const phase = game.phase
  useEffect(() => {
    if (phase !== "arming") return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        launch()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [launch, phase])

  useEffect(() => {
    if (game.timeChoice === "custom") customRef.current?.focus()
  }, [game.timeChoice])

  return (
    <div className="mm" data-phase={game.phase}>
      <Canvas className="mm-canvas" dpr={dpr} camera={camera} gl={gl} onCreated={onCreated}>
        <SpaceScene
          meteors={game.meteors}
          focusId={game.focusId}
          effect={game.effect}
          effectToken={game.effectToken}
        />
      </Canvas>
      <div className="mm-vignette" />
      <div className={`mm-flash ${game.effect === "blast" ? "is-blast" : game.effect === "break" ? "is-break" : ""}`} key={game.effectToken} />

      {showHud ? (
        <div className="hud">
          <div className="hud-left">
            <div className="hud-stat" data-testid="score">
              <span className="hud-label">SCORE</span>
              <strong className="hud-value" key={game.score}>
                {game.score}
              </strong>
            </div>
            <div className="hud-stat" data-testid="lives" data-lives={game.lives}>
              <span className="hud-label">LIVES</span>
              <span className="life-row" aria-label={`${game.lives} lives`}>
                {[0, 1, 2].map((index) => (
                  <span key={index} className={index < game.lives ? "life on" : "life"} />
                ))}
              </span>
            </div>
          </div>
          <div className={`timer ${tone}`} data-testid="timer" data-tone={tone}>
            <span className="hud-label">TIMER</span>
            <strong className="timer-value">{clock}</strong>
          </div>
        </div>
      ) : null}

      {game.phase === "menu" ? (
        <form
          className="mm-menu"
          onSubmit={(event) => {
            event.preventDefault()
            game.start()
          }}
        >
          <p className="mm-kicker">Deep space arithmetic</p>
          <h1 className="mm-title">METEOR MATH</h1>
          <div className="time-block">
            <p className="hud-label" id="time-label">
              Seconds per problem
            </p>
            <div className="time-row" role="group" aria-labelledby="time-label">
              {TIME_CHOICES.map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  className={game.timeChoice === seconds ? "time-chip is-on" : "time-chip"}
                  aria-pressed={game.timeChoice === seconds}
                  data-testid={`time-${seconds}`}
                  onClick={() => game.chooseTime(seconds)}
                >
                  {seconds}
                </button>
              ))}
              <button
                type="button"
                className={game.timeChoice === "custom" ? "time-chip is-on" : "time-chip"}
                aria-pressed={game.timeChoice === "custom"}
                data-testid="time-custom"
                onClick={() => game.chooseTime("custom" as TimeChoice)}
              >
                Custom
              </button>
              {game.timeChoice === "custom" ? (
                <input
                  ref={customRef}
                  className={game.customError ? "custom-time is-bad" : "custom-time"}
                  data-testid="custom-seconds"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-label="Custom seconds"
                  placeholder="sec"
                  value={game.customText}
                  onChange={(event) => game.setCustomText(event.target.value)}
                />
              ) : null}
            </div>
            {game.customError ? <p className="time-error">Enter 1–600 seconds</p> : null}
          </div>
          <button type="submit" className="pulse-btn" data-testid="start-game">
            START GAME
          </button>
        </form>
      ) : null}

      {game.phase === "arming" ? (
        <div className="mm-launch">
          <button type="button" className="pulse-btn" data-testid="launch" onClick={game.launch}>
            LAUNCH
          </button>
          <p className="launch-note">A meteor locks on</p>
        </div>
      ) : null}

      {solving && game.problem ? (
        <div className="problem-layer">
          <p className="equation" data-testid="equation">
            {game.problem.text}
          </p>
          <form
            className="answer-form"
            onSubmit={(event) => {
              event.preventDefault()
              game.submit()
            }}
          >
            <input
              ref={inputRef}
              className="answer"
              data-testid="answer"
              inputMode="numeric"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Answer"
              maxLength={6}
              value={game.entry}
              onChange={(event) => game.onEntry(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return
                event.preventDefault()
                game.submit()
              }}
            />
            <button type="submit" className="pulse-btn submit-btn" data-testid="submit">
              SUBMIT
            </button>
          </form>
          {game.feedback === "wrong" ? (
            <p className="try-again" data-testid="feedback" role="status">
              TRY AGAIN!
            </p>
          ) : null}
        </div>
      ) : null}

      {game.phase === "breakup" ? (
        <p className="banner good" data-testid="feedback" role="status">
          CORRECT!
        </p>
      ) : null}
      {game.phase === "blast" ? (
        <p className="banner bad" data-testid="feedback" role="status">
          TIME'S UP!
        </p>
      ) : null}

      {game.phase === "over" ? (
        <div className="finale">
          <h2>GAME OVER</h2>
          <p className="finale-score">
            <span className="hud-label">SCORE</span>
            <strong data-testid="final-score">{game.score}</strong>
          </p>
          <button type="button" className="pulse-btn" data-testid="play-again" onClick={game.playAgain}>
            PLAY AGAIN
          </button>
        </div>
      ) : null}
    </div>
  )
}
