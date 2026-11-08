import { useMemo, useState } from "react"
import { CAMPAIGN_ORDER, CAMPAIGN_TASKS } from "../data/campaign"
import { COUNTRY_BY_ID } from "../data/world"
import type { QuizItem } from "../data/missions"
import { t } from "../i18n"
import { useGame } from "../store/gameStore"
import { SafeLandmark } from "../three/SafeLandmark"
import { BackBar, GoldButton, Panel } from "../ui/chrome"
import { QuizRun } from "./QuizRun"

export function Campaign() {
  const copy = t()
  const go = useGame((s) => s.go)
  const progress = useGame((s) => s.progress)
  const selectCountry = useGame((s) => s.selectCountry)
  const setLandmark = useGame((s) => s.setLandmark)
  const countryId = useGame((s) => s.countryId)
  const screen = useGame((s) => s.screen)
  const markCampaign = useGame((s) => s.markCampaign)
  const collectStamp = useGame((s) => s.collectStamp)
  const difficulty = progress.difficulty
  const [playing, setPlaying] = useState(false)

  if (screen === "campaign-country") {
    return (
      <CampaignCountry
        countryId={countryId}
        playing={playing}
        setPlaying={setPlaying}
        difficulty={difficulty}
        onBack={() => {
          setPlaying(false)
          go("campaign")
        }}
        markCampaign={markCampaign}
        collectStamp={collectStamp}
        setLandmark={setLandmark}
      />
    )
  }

  return (
    <div className="stage pad">
      <BackBar title={copy.campaign.title} onBack={() => go("menu")} />
      <p className="lede">{copy.campaign.intro}</p>
      <div className="campaign-grid">
        {CAMPAIGN_ORDER.map((id) => {
          const country = COUNTRY_BY_ID.get(id)
          if (!country) return null
          const done = progress.campaignDone.includes(id)
          return (
            <button
              key={id}
              type="button"
              className="menu-card"
              onClick={() => {
                selectCountry(id)
                go("campaign-country")
              }}
            >
              <strong>
                {country.flag} {country.name}
              </strong>
              <span>
                {country.capital} · {country.landmarks.length} 3D-места · {CAMPAIGN_TASKS[id].length} {copy.campaign.tasks}
              </span>
              {done ? <em>{copy.campaign.complete}</em> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CampaignCountry({
  countryId,
  playing,
  setPlaying,
  difficulty,
  onBack,
  markCampaign,
  collectStamp,
  setLandmark,
}: {
  countryId: string | null
  playing: boolean
  setPlaying: (v: boolean) => void
  difficulty: "easy" | "medium" | "hard"
  onBack: () => void
  markCampaign: (id: string, answers: number[]) => void
  collectStamp: (id: string) => void
  setLandmark: (id: string) => void
}) {
  const copy = t()
  const country = countryId ? COUNTRY_BY_ID.get(countryId) : undefined
  const landmarkId = useGame((s) => s.landmarkId)
  const landmark = country?.landmarks.find((l) => l.id === landmarkId) ?? country?.landmarks[0]
  const items = useMemo<QuizItem[]>(() => {
    if (!countryId) return []
    return (CAMPAIGN_TASKS[countryId] ?? []).map((task) => ({
      id: task.id,
      type: "facts" as const,
      difficulty,
      prompt: task.prompt,
      options: task.options,
      correct: task.correct,
      explanation: task.explanation,
      countryId,
    }))
  }, [countryId, difficulty])

  if (!country) return null

  return (
    <div className="stage split">
      <div className="stage-globe">{landmark ? <SafeLandmark landmark={landmark} /> : null}</div>
      <div className="side">
        <BackBar title={`${country.flag} ${country.name}`} onBack={onBack} />
        {playing ? (
          <QuizRun
            items={items}
            timed
            difficulty={difficulty}
            onDone={(_score, answers) => {
              markCampaign(country.id, answers)
              setPlaying(false)
            }}
          />
        ) : (
          <Panel>
            <p className="kicker">{copy.campaign.info}</p>
            <h3>
              {copy.explorer.capital}: {country.capital}
            </h3>
            <p>{country.about}</p>
            <div className="flag-banner" style={{ background: `linear-gradient(90deg, ${country.colors.join(",")})` }}>
              <span>{country.flag}</span>
            </div>
            <div className="chips">
              {country.landmarks.map((lm) => (
                <button
                  key={lm.id}
                  type="button"
                  className={landmark?.id === lm.id ? "chip on" : "chip"}
                  onClick={() => {
                    setLandmark(lm.id)
                    collectStamp(lm.id)
                  }}
                >
                  {lm.name}
                </button>
              ))}
            </div>
            {landmark ? <p className="hint">{landmark.fact}</p> : null}
            <GoldButton onClick={() => setPlaying(true)}>
              {copy.campaign.tasks} ({items.length})
            </GoldButton>
          </Panel>
        )}
      </div>
    </div>
  )
}
