import { useEffect } from "react"
import { Campaign } from "./screens/Campaign"
import { Collection } from "./screens/Collection"
import { CountryView } from "./screens/CountryView"
import { GeoMission } from "./screens/GeoMission"
import { MainMenu } from "./screens/MainMenu"
import { RegisterScreen } from "./screens/RegisterScreen"
import { Settings } from "./screens/Settings"
import { Training } from "./screens/Training"
import { WorldChallenge } from "./screens/WorldChallenge"
import { WorldExplorer } from "./screens/WorldExplorer"
import { useGame } from "./store/gameStore"

export default function App() {
  const hydrate = useGame((s) => s.hydrate)
  const ready = useGame((s) => s.ready)
  const screen = useGame((s) => s.screen)
  const locale = useGame((s) => s.progress.locale)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  if (!ready) {
    return (
      <div className="boot">
        <p>GEO QUEST</p>
      </div>
    )
  }

  void locale

  if (screen === "register") return <RegisterScreen />
  if (screen === "explorer") return <WorldExplorer />
  if (screen === "country") return <CountryView />
  if (screen === "mission") return <GeoMission />
  if (screen === "challenge") return <WorldChallenge />
  if (screen === "campaign" || screen === "campaign-country") return <Campaign />
  if (screen === "training") return <Training />
  if (screen === "collection") return <Collection />
  if (screen === "settings") return <Settings />
  return <MainMenu />
}
