import { useMemo, useState } from "react"
import { pickMission, type MissionType } from "../data/missions"
import { t } from "../i18n"
import { useGame } from "../store/gameStore"
import { SafeGlobe } from "../three/SafeGlobe"
import { BackBar, GoldButton, Panel } from "../ui/chrome"
import { QuizRun } from "./QuizRun"

const TYPES: MissionType[] = ["capitals", "flags", "landmarks", "locate", "facts"]

export function GeoMission() {
  const copy = t()
  const go = useGame((s) => s.go)
  const difficulty = useGame((s) => s.progress.difficulty)
  const setDifficulty = useGame((s) => s.setDifficulty)
  const missionType = useGame((s) => s.missionType)
  const setMissionType = useGame((s) => s.setMissionType)
  const unlock = useGame((s) => s.unlock)
  const [playing, setPlaying] = useState(false)
  const [seed, setSeed] = useState(1)
  const items = useMemo(() => pickMission(missionType, difficulty, 6, seed), [missionType, difficulty, seed])

  return (
    <div className="stage split">
      <div className="stage-globe">
        <SafeGlobe continent="asia" countryId={null} onPickCountry={() => undefined} />
      </div>
      <div className="side">
        <BackBar title={copy.mission.title} onBack={() => go("menu")} />
        {!playing ? (
          <Panel>
            <p className="kicker">{copy.mission.pickType}</p>
            <div className="chips">
              {TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={missionType === type ? "chip on" : "chip"}
                  onClick={() => setMissionType(type)}
                >
                  {copy.mission.types[type]}
                </button>
              ))}
            </div>
            <p className="kicker">{copy.mission.difficulty}</p>
            <div className="chips">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button key={d} type="button" className={difficulty === d ? "chip on" : "chip"} onClick={() => setDifficulty(d)}>
                  {copy.settings[d]}
                </button>
              ))}
            </div>
            <GoldButton
              onClick={() => {
                setSeed(Date.now())
                setPlaying(true)
              }}
            >
              {copy.mission.start}
            </GoldButton>
          </Panel>
        ) : (
          <QuizRun
            items={items}
            timed
            difficulty={difficulty}
            onDone={() => {
              unlock("first-mission")
              setPlaying(false)
            }}
          />
        )}
      </div>
    </div>
  )
}
