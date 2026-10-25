import type { CSSProperties } from "react"
import type { EquationView, Feedback, MeteorSpec, Status } from "./types.ts"
import { MeteorRock } from "./MeteorRock.tsx"
import { PALETTES } from "./rocks.ts"

export function MeteorField({
  meteors,
  focusId,
  prompt,
  status,
  feedback,
  wrongTries,
}: {
  meteors: readonly MeteorSpec[]
  focusId: string | null
  prompt: EquationView | null
  status: Status
  feedback: Feedback
  wrongTries: number
}) {
  return (
    <div className="mm-field">
      {meteors.map((meteor) => {
        const isFocus = meteor.id === focusId
        const colors = PALETTES[meteor.palette] ?? PALETTES[0]
        const showProblem = isFocus && prompt !== null && status === "solving"
        const className = [
          "mm-meteor",
          isFocus ? "is-focus" : "",
          isFocus && status === "success" ? "is-success" : "",
          isFocus && status === "miss" ? "is-miss" : "",
          isFocus && feedback === "wrong" ? "is-wrong" : "",
        ]
          .filter(Boolean)
          .join(" ")
        const style = {
          "--x": `${meteor.x}%`,
          "--y": `${meteor.y}%`,
          "--size": `${meteor.size}px`,
          "--scale": String(meteor.scale),
          "--drift": `${meteor.drift}s`,
          "--delay": `${meteor.delay}s`,
          "--dx": `${meteor.dx}px`,
          "--dy": `${meteor.dy}px`,
          "--z": String(meteor.z),
          "--glow": colors?.glow ?? "rgba(255,255,255,0.6)",
        } as CSSProperties
        return (
          <div
            key={meteor.id}
            className={className}
            style={style}
            data-focus={isFocus ? "true" : "false"}
            aria-hidden={showProblem ? undefined : true}
          >
            <div className="mm-drift">
              <div
                className="mm-spin-wrap"
                style={
                  {
                    "--spin": `${meteor.spin}s`,
                    "--spin-dir": meteor.reverse ? "reverse" : "normal",
                  } as CSSProperties
                }
              >
                <MeteorRock seed={meteor.seed} palette={meteor.palette} />
              </div>
              <div className="mm-glint" />
              {isFocus && !showProblem ? <div className="mm-reticle" /> : null}
              {showProblem && prompt ? (
                <div
                  className={feedback === "wrong" ? "mm-plaque is-shake" : "mm-plaque"}
                  key={wrongTries}
                  data-testid="problem"
                >
                  <span className="mm-plaque-kicker">Реши</span>
                  <p className="mm-eq">
                    <span>{prompt.left}</span>
                    <span className="mm-op">{prompt.op}</span>
                    <span>{prompt.right}</span>
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )
      })}
      {status === "success" || status === "miss" ? (
        <div
          className={status === "miss" ? "mm-burst is-boom" : "mm-burst"}
          style={{ "--step": status === "miss" ? "13.8deg" : "20deg" } as CSSProperties}
          aria-hidden="true"
        >
          {Array.from({ length: status === "miss" ? 26 : 18 }, (_, index) => (
            <span key={index} style={{ "--i": String(index) } as CSSProperties} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
