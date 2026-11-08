import { useEffect } from "react"
import { GameShell } from "./game/GameShell"
import { RegisterScreen } from "./screens/RegisterScreen"
import { useGame } from "./store/gameStore"

export default function App() {
  const hydrate = useGame((s) => s.hydrate)
  const ready = useGame((s) => s.ready)
  const stage = useGame((s) => s.stage)
  const locale = useGame((s) => s.progress.locale)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

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
