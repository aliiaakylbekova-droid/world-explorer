import { useEffect, useState } from "react"
import { t } from "../i18n"
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
  const mission = useGame((s) => s.mission)
  const stage = useGame((s) => s.stage)
  const ui = t().play
  void useGame((s) => s.progress.locale)

  if (stage === "discover") return null
  if (stage === "flag" && lastFeedback) {
    if (lastFeedback.ok) {
      return (
        <div className="gq-result is-ok" data-result="success">
          <p className="kicker">{ui.greatJob}</p>
          <h2>{ui.correctLocation}</h2>
          <p className="place">{lastCountryName || mission?.targetName}</p>
          <p>{mission?.recap}</p>
        </div>
      )
    }
    return (
      <div className="gq-result is-wrong" data-result="wrong">
        <p className="kicker">{ui.tryAgain}</p>
        <h2>{ui.notThisPlace}</h2>
        <p>{lastFeedback.text}</p>
      </div>
    )
  }
  if (!campaign && lastFeedback) {
    if (lastFeedback.ok) {
      return (
        <div className="gq-result is-ok" data-result="success">
          <p className="kicker">{ui.greatJob}</p>
          <h2>{ui.correctLocation}</h2>
          <p className="place">{lastCountryName || mission?.targetName}</p>
          <p>{mission?.recap}</p>
        </div>
      )
    }
    return (
      <div className="gq-result is-wrong" data-result="wrong">
        <p className="kicker">{ui.tryAgain}</p>
        <h2>{ui.notThisPlace}</h2>
        <p>{lastFeedback.text}</p>
      </div>
    )
  }
  if (!campaign) return null
  if (phase === "play" || phase === "correct" || phase === "transition") return null

  if (phase === "wrong") {
    return (
      <div className="gq-result is-wrong" data-result="wrong">
        <p className="kicker">{ui.tryAgain}</p>
        <h2>{ui.notThisPlace}</h2>
        <p>
          {lastCountryName ? `${lastCountryName} ${ui.notTarget}` : ui.missClick} {lastFeedback?.text || campaign.hint}
        </p>
      </div>
    )
  }

  if (phase === "timeout") {
    return (
      <div className="gq-result is-timeout" data-result="timeout">
        <p className="kicker">{ui.timesUp}</p>
        <h2>{campaign.title}</h2>
        <p>{campaign.hint}</p>
        <button type="button" className="btn" onClick={() => retryLevel()}>
          {ui.retry}
        </button>
      </div>
    )
  }

  if (phase === "success") {
    return (
      <div className="gq-result is-ok" data-result="success">
        <p className="kicker">{ui.greatJob}</p>
        <h2>{ui.correctLocation}</h2>
        <p className="place">{lastCountryName || campaign.title}</p>
        <p>{campaign.fact}</p>
        <p className="xp-line">
          +{campaign.reward} XP · {ui.level} {campaign.number}
        </p>
        <AnimatedXp target={progress.xp} />
        <button type="button" className="btn" onClick={() => continueCampaign()}>
          {ui.continue}
        </button>
      </div>
    )
  }

  if (phase === "levelComplete") {
    return (
      <div className="gq-result is-ok" data-result="level">
        <p className="kicker">{ui.levelDone}</p>
        <h2>{campaign.title}</h2>
        <button type="button" className="btn" onClick={() => continueCampaign()}>
          {ui.continue}
        </button>
      </div>
    )
  }

  if (phase === "campaignComplete") {
    return (
      <div className="gq-result is-ok" data-result="campaign">
        <p className="kicker">{ui.campaignDone}</p>
        <h2>{ui.geoGame}</h2>
        <p>{ui.campaignWrap}</p>
        <AnimatedXp target={progress.xp} />
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            useGame.setState({ campaign: null, campaignPhase: "play", hitTint: null, missionEndsAt: null })
            useGame.getState().setStage("explore")
          }}
        >
          {ui.exploreWorld}
        </button>
      </div>
    )
  }

  return null
}
