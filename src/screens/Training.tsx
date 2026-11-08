import { useMemo, useState } from "react"
import { pickMixed } from "../data/missions"
import { t } from "../i18n"
import { useGame } from "../store/gameStore"
import { SafeGlobe } from "../three/SafeGlobe"
import { BackBar, GoldButton, Panel } from "../ui/chrome"
import { QuizRun } from "./QuizRun"

export function Training() {
  const copy = t()
  const go = useGame((s) => s.go)
  const difficulty = useGame((s) => s.progress.difficulty)
  const [playing, setPlaying] = useState(false)
  const [seed, setSeed] = useState(3)
  const items = useMemo(() => pickMixed(8, seed), [seed])

  return (
    <div className="stage split">
      <div className="stage-globe">
        <SafeGlobe continent="africa" countryId={null} onPickCountry={() => undefined} />
      </div>
      <div className="side">
        <BackBar title={copy.training.title} onBack={() => go("menu")} />
        {playing ? (
          <QuizRun items={items} timed={false} difficulty={difficulty} onDone={() => setPlaying(false)} />
        ) : (
          <Panel>
            <p>{copy.menu.trainingHint}</p>
            <GoldButton
              onClick={() => {
                setSeed(Date.now())
                setPlaying(true)
              }}
            >
              {copy.training.start}
            </GoldButton>
          </Panel>
        )}
      </div>
    </div>
  )
}
