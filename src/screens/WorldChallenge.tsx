import { useMemo, useState } from "react"
import { pickMixed } from "../data/missions"
import { t } from "../i18n"
import { useGame } from "../store/gameStore"
import { SafeGlobe } from "../three/SafeGlobe"
import { BackBar, GoldButton, Panel } from "../ui/chrome"
import { QuizRun } from "./QuizRun"

export function WorldChallenge() {
  const copy = t()
  const go = useGame((s) => s.go)
  const difficulty = useGame((s) => s.progress.difficulty)
  const board = useGame((s) => s.progress.leaderboard)
  const addScore = useGame((s) => s.addScore)
  const [playing, setPlaying] = useState(false)
  const [seed, setSeed] = useState(7)
  const items = useMemo(() => pickMixed(12, seed), [seed])

  return (
    <div className="stage split">
      <div className="stage-globe">
        <SafeGlobe continent="europe" countryId={null} onPickCountry={() => undefined} />
      </div>
      <div className="side">
        <BackBar title={copy.challenge.title} onBack={() => go("menu")} />
        {playing ? (
          <QuizRun
            items={items}
            timed
            difficulty={difficulty}
            onDone={(score) => {
              addScore(score)
              setPlaying(false)
            }}
          />
        ) : (
          <Panel>
            <p>{copy.challenge.onlineSoon}</p>
            <GoldButton
              onClick={() => {
                setSeed(Date.now())
                setPlaying(true)
              }}
            >
              {copy.challenge.start}
            </GoldButton>
            <p className="kicker">{copy.challenge.board}</p>
            {board.length === 0 ? (
              <p className="hint">{copy.challenge.empty}</p>
            ) : (
              <ol className="board">
                {board.map((row, i) => (
                  <li key={`${row.at}-${i}`}>
                    <strong>{row.name}</strong>
                    <span>{row.score}</span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        )}
      </div>
    </div>
  )
}
