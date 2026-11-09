import { useState } from "react"
import { audio } from "../audio/AudioManager"
import { useGame } from "../store/gameStore"

export function LandmarkQuiz() {
  const quest = useGame((s) => s.landmarkQuest)
  const phase = useGame((s) => s.landmarkPhase)
  const submit = useGame((s) => s.submitLandmarkGuess)
  const next = useGame((s) => s.nextLandmarkQuest)
  const progress = useGame((s) => s.progress)
  const [guess, setGuess] = useState("")
  if (!quest || phase === "off") return null

  return (
    <div className={`gq-quiz ${phase}`} data-quiz="height" data-quest={quest.id} data-phase={phase}>
      <p className="kicker">
        {quest.speaker} · {quest.title}
      </p>
      {phase === "speaking" ? <h2>{quest.spoken}</h2> : <h2>{quest.prompt}</h2>}
      {phase === "quiz" || phase === "wrong" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit(guess)
          }}
        >
          <input
            className="field height-input"
            inputMode="numeric"
            value={guess}
            placeholder={`${quest.unit}`}
            onChange={(e) => {
              setGuess(e.target.value)
              audio.play("type")
            }}
            autoFocus
          />
          <button type="submit" className="btn">
            CHECK
          </button>
          {phase === "wrong" ? <p className="bad">{quest.hint}</p> : <p className="tiny">{quest.hint}</p>}
        </form>
      ) : null}
      {phase === "correct" ? (
        <>
          <p className="ok">GREAT JOB · {quest.answer} {quest.unit}</p>
          <p>{quest.fact}</p>
          <p className="xp-line">+{quest.xp} XP · {progress.xp} XP</p>
          <button type="button" className="btn" onClick={() => next()}>
            {quest.next ? "NEXT LANDMARK" : "CONTINUE"}
          </button>
        </>
      ) : null}
    </div>
  )
}
