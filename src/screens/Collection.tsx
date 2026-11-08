import { ACHIEVEMENTS } from "../data/achievements"
import { COUNTRIES } from "../data/world"
import { t } from "../i18n"
import { useGame } from "../store/gameStore"
import { BackBar, Panel } from "../ui/chrome"

export function Collection() {
  const copy = t()
  const go = useGame((s) => s.go)
  const progress = useGame((s) => s.progress)
  const stamps = COUNTRIES.flatMap((c) => c.landmarks).filter((lm) => progress.stamps.includes(lm.id))

  return (
    <div className="stage pad">
      <BackBar title={copy.collection.title} onBack={() => go("menu")} />
      <div className="pills">
        <span>
          {copy.collection.xp} {progress.xp}
        </span>
        <span>
          {copy.collection.coins} {progress.coins}
        </span>
      </div>
      <Panel>
        <p className="kicker">{copy.collection.achievements}</p>
        <ul className="achievements">
          {ACHIEVEMENTS.map((a) => (
            <li key={a.id} className={progress.achievements.includes(a.id) ? "got" : ""}>
              <strong>{a.title}</strong>
              <span>{a.hint}</span>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel>
        <p className="kicker">{copy.collection.stamps}</p>
        {stamps.length === 0 ? (
          <p className="hint">{copy.collection.empty}</p>
        ) : (
          <div className="chips">
            {stamps.map((s) => (
              <span key={s.id} className="chip on">
                {s.name}
              </span>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
