import { useEffect, useState } from "react"
import { useGame } from "../store/gameStore"

function AnimatedXp({ target }: { target: number }) {
  const [shown, setShown] = useState(target)
  useEffect(() => {
    let frame = 0
    const start = shown
    const diff = target - start
    if (diff === 0) return
    const t0 = performance.now()
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 700)
      const ease = 1 - Math.pow(1 - k, 3)
      setShown(Math.round(start + diff * ease))
      if (k < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target])
  return <b className="xp-pop">{shown} XP</b>
}

export function CampaignOverlay() {
  const campaign = useGame((s) => s.campaign)
  const phase = useGame((s) => s.campaignPhase)
  const lastCountryName = useGame((s) => s.lastCountryName)
  const progress = useGame((s) => s.progress)
  const continueCampaign = useGame((s) => s.continueCampaign)
  const retryLevel = useGame((s) => s.retryLevel)
  const lastFeedback = useGame((s) => s.lastFeedback)

  const stage = useGame((s) => s.stage)
  if (stage === "discover") return null
  if (!campaign) return null
  if (phase === "play" || phase === "correct" || phase === "transition") return null

  if (phase === "wrong") {
    return (
      <div className="gq-result is-wrong" data-result="wrong">
        <p className="kicker">TRY AGAIN</p>
        <h2>Not this place</h2>
        <p>
          {lastCountryName ? `${lastCountryName} is not the target.` : "That click is not the objective."} {campaign.hint}
        </p>
      </div>
    )
  }

  if (phase === "timeout") {
    return (
      <div className="gq-result is-timeout" data-result="timeout">
        <p className="kicker">TIME'S UP</p>
        <h2>{campaign.title}</h2>
        <p>{campaign.hint}</p>
        <button type="button" className="btn" onClick={() => retryLevel()}>
          RETRY
        </button>
      </div>
    )
  }

  if (phase === "success") {
    return (
      <div className="gq-result is-ok" data-result="success">
        <p className="kicker">{lastFeedback?.text === "GREAT JOB" ? "GREAT JOB" : "CORRECT LOCATION"}</p>
        <h2>CORRECT LOCATION</h2>
        <p className="place">{lastCountryName || campaign.title}</p>
        <p>{campaign.fact}</p>
        <p className="xp-line">
          +{campaign.reward} XP · LEVEL {campaign.number}
        </p>
        <AnimatedXp target={progress.xp} />
        <button type="button" className="btn" onClick={() => continueCampaign()}>
          CONTINUE
        </button>
      </div>
    )
  }

  if (phase === "levelComplete") {
    return (
      <div className="gq-result is-ok" data-result="level">
        <p className="kicker">LEVEL COMPLETED</p>
        <h2>{campaign.title}</h2>
        <button type="button" className="btn" onClick={() => continueCampaign()}>
          CONTINUE
        </button>
      </div>
    )
  }

  if (phase === "campaignComplete") {
    return (
      <div className="gq-result is-ok" data-result="campaign">
        <p className="kicker">CAMPAIGN COMPLETED</p>
        <h2>GEO GAME</h2>
        <p>You mapped Asia, Kyrgyzstan, France, Egypt, the Nile, Tian Shan, and Issyk-Kul.</p>
        <AnimatedXp target={progress.xp} />
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            useGame.setState({ campaign: null, campaignPhase: "play", hitTint: null, missionEndsAt: null })
            useGame.getState().setStage("explore")
          }}
        >
          EXPLORE THE WORLD
        </button>
      </div>
    )
  }

  return null
}
