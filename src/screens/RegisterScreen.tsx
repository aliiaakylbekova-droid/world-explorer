import { useState } from "react"
import { t } from "../i18n"
import { useGame } from "../store/gameStore"
import { SafeGlobe } from "../three/SafeGlobe"
import { GoldButton, Panel } from "../ui/chrome"

const AVATARS = [
  { id: "ocean", color: "#0A4D8C" },
  { id: "gold", color: "#E8C547" },
  { id: "teal", color: "#2EC4B6" },
  { id: "navy", color: "#061428" },
]

export function RegisterScreen() {
  const copy = t()
  const register = useGame((s) => s.register)
  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState("ocean")

  return (
    <div className="stage">
      <div className="stage-globe">
        <SafeGlobe continent="asia" countryId={null} onPickCountry={() => undefined} />
      </div>
      <Panel className="register">
        <p className="kicker">{copy.register.kicker}</p>
        <h1>{copy.title}</h1>
        <p className="subtitle">{copy.subtitle}</p>
        <h2>{copy.register.heading}</h2>
        <input
          className="field"
          value={name}
          maxLength={40}
          placeholder={copy.register.placeholder}
          onChange={(e) => setName(e.target.value)}
        />
        <p className="muted">{copy.register.avatar}</p>
        <div className="avatars">
          {AVATARS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={avatar === item.id ? "avatar on" : "avatar"}
              style={{ background: item.color }}
              onClick={() => setAvatar(item.id)}
              aria-label={item.id}
            />
          ))}
        </div>
        <GoldButton disabled={name.trim().length < 2} onClick={() => void register(name, avatar)}>
          {copy.register.start}
        </GoldButton>
        <p className="hint">{copy.register.hint}</p>
      </Panel>
    </div>
  )
}
