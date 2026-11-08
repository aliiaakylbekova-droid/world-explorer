import { t } from "../i18n"
import { useGame, type Screen } from "../store/gameStore"
import { SafeGlobe } from "../three/SafeGlobe"
import { Panel } from "../ui/chrome"

const ITEMS: { screen: Screen; label: "explorer" | "mission" | "challenge" | "campaign" | "training" | "collection" | "settings" }[] = [
  { screen: "explorer", label: "explorer" },
  { screen: "mission", label: "mission" },
  { screen: "challenge", label: "challenge" },
  { screen: "campaign", label: "campaign" },
  { screen: "training", label: "training" },
  { screen: "collection", label: "collection" },
  { screen: "settings", label: "settings" },
]

export function MainMenu() {
  const copy = t()
  const go = useGame((s) => s.go)
  const profile = useGame((s) => s.profile)
  const progress = useGame((s) => s.progress)
  const openCountry = useGame((s) => s.openCountry)

  return (
    <div className="stage">
      <div className="stage-globe">
        <SafeGlobe continent="asia" countryId={null} onPickCountry={openCountry} />
      </div>
      <div className="menu-col">
        <Panel className="hero">
          <p className="kicker">
            {copy.menu.greet} · {profile?.name}
          </p>
          <h1>{copy.title}</h1>
          <p className="subtitle">{copy.subtitle}</p>
          <div className="pills">
            <span>XP {progress.xp}</span>
            <span>◆ {progress.coins}</span>
          </div>
        </Panel>
        <div className="menu-grid">
          {ITEMS.map((item) => (
            <button key={item.screen} type="button" className="menu-card" onClick={() => go(item.screen)}>
              <strong>{copy.menu[item.label]}</strong>
              <span>{copy.menu[`${item.label}Hint`]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
