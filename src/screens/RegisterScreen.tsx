import { useState } from "react"
import { audio } from "../audio/AudioManager"
import { GlobeMap } from "../game/GlobeMap"
import { t } from "../i18n"
import { useGame } from "../store/gameStore"

export function RegisterScreen() {
  const register = useGame((s) => s.register)
  const [name, setName] = useState("")
  const [leaving, setLeaving] = useState(false)
  const canStart = name.trim().length >= 2

  function start() {
    if (!canStart || leaving) return
    audio.unlock()
    audio.play("startClick")
    setLeaving(true)
    window.setTimeout(() => {
      void register(name, "ocean")
    }, 520)
  }

  return (
    <div className="intro-root" data-intro="card">
      <div className="hud-center">
        <GlobeMap onPick={() => undefined} />
      </div>
      <form
        className={leaving ? "intro-card is-out" : "intro-card"}
        onSubmit={(e) => {
          e.preventDefault()
          start()
        }}
      >
        <h1>{t().play.geoGame}</h1>
        <input
          className="intro-nick"
          value={name}
          maxLength={40}
          placeholder={t().play.nickname}
          autoComplete="nickname"
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="intro-start" disabled={!canStart}>
          {t().play.start}
        </button>
      </form>
    </div>
  )
}
