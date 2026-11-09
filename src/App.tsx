import { useEffect } from "react"
import { GameShell } from "./game/GameShell"
import { RegisterScreen } from "./screens/RegisterScreen"
import { useGame, type Stage } from "./store/gameStore"

export default function App() {
  const hydrate = useGame((s) => s.hydrate)
  const ready = useGame((s) => s.ready)
  const stage = useGame((s) => s.stage)
  const locale = useGame((s) => s.progress.locale)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  useEffect(() => {
    window.geoQuestDebug = {
      fly: (lat, lng, dist) => useGame.getState().fly(lat, lng, dist),
      stage: (s) => useGame.getState().setStage(s as Stage),
      landmark: (id) => useGame.getState().openLandmark(id),
      pick: (iso, lat, lng) => useGame.getState().pick({ iso, lat, lng }),
      continue: () => useGame.getState().continueCampaign(),
      retry: () => useGame.getState().retryLevel(),
      campaign: (index) => useGame.getState().startCampaign(index),
      flag: () => {
        const btn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Флаги") || b.textContent?.includes("FLAGS"))
        btn?.click()
      },
    }
  }, [])

  void locale

  if (!ready) {
    return (
      <div className="boot">
        <p>GEO QUEST</p>
      </div>
    )
  }

  if (stage === "register") return <RegisterScreen />
  return <GameShell />
}
