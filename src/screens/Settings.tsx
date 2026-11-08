import { useState } from "react"
import { t } from "../i18n"
import { useGame } from "../store/gameStore"
import { BackBar, GoldButton, Panel } from "../ui/chrome"

export function Settings() {
  const copy = t()
  const go = useGame((s) => s.go)
  const progress = useGame((s) => s.progress)
  const setDifficulty = useGame((s) => s.setDifficulty)
  const setVolume = useGame((s) => s.setVolume)
  const setLocalePref = useGame((s) => s.setLocalePref)
  const resetProgress = useGame((s) => s.resetProgress)
  const [msg, setMsg] = useState("")

  return (
    <div className="stage pad">
      <BackBar title={copy.settings.title} onBack={() => go("menu")} />
      <Panel>
        <p className="kicker">{copy.settings.language}</p>
        <div className="chips">
          <button type="button" className={progress.locale === "ru" ? "chip on" : "chip"} onClick={() => setLocalePref("ru")}>
            Русский
          </button>
          <button type="button" className={progress.locale === "en" ? "chip on" : "chip"} onClick={() => setLocalePref("en")}>
            English
          </button>
        </div>
        <p className="hint">{copy.settings.languageHint}</p>
        <p className="kicker">{copy.settings.difficulty}</p>
        <div className="chips">
          {(["easy", "medium", "hard"] as const).map((d) => (
            <button key={d} type="button" className={progress.difficulty === d ? "chip on" : "chip"} onClick={() => setDifficulty(d)}>
              {copy.settings[d]}
            </button>
          ))}
        </div>
        <p className="kicker">{copy.settings.volume}</p>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={progress.volume}
          onChange={(e) => setVolume(Number(e.target.value))}
        />
        <p className="hint">{copy.settings.fullscreen}</p>
        <GoldButton
          ghost
          onClick={() => {
            void resetProgress().then(() => setMsg(copy.settings.resetDone))
          }}
        >
          {copy.settings.reset}
        </GoldButton>
        {msg ? <p className="hint">{msg}</p> : null}
      </Panel>
    </div>
  )
}
