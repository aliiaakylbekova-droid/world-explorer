import { useEffect } from "react"
import { COUNTRY_BY_ID } from "../data/world"
import { t } from "../i18n"
import { useGame } from "../store/gameStore"
import { SafeGlobe } from "../three/SafeGlobe"
import { SafeLandmark } from "../three/SafeLandmark"
import { BackBar, GoldButton, Panel } from "../ui/chrome"

export function CountryView() {
  const copy = t()
  const go = useGame((s) => s.go)
  const countryId = useGame((s) => s.countryId)
  const landmarkId = useGame((s) => s.landmarkId)
  const setLandmark = useGame((s) => s.setLandmark)
  const collectStamp = useGame((s) => s.collectStamp)
  const openCountry = useGame((s) => s.openCountry)
  const country = countryId ? COUNTRY_BY_ID.get(countryId) : undefined
  const landmark = country?.landmarks.find((l) => l.id === landmarkId) ?? country?.landmarks[0]

  useEffect(() => {
    if (country?.landmarks[0] && !landmarkId) setLandmark(country.landmarks[0].id)
  }, [country, landmarkId, setLandmark])

  if (!country) {
    return (
      <div className="stage">
        <BackBar title={copy.explorer.title} onBack={() => go("explorer")} />
      </div>
    )
  }

  return (
    <div className="stage split">
      <div className="stage-globe stacked">
        <div className="half">
          <SafeGlobe continent={country.continent} countryId={country.id} onPickCountry={openCountry} />
        </div>
        <div className="half">
          {landmark ? <SafeLandmark landmark={landmark} /> : null}
        </div>
      </div>
      <div className="side">
        <BackBar title={`${country.flag} ${country.name}`} onBack={() => go("explorer")} />
        <Panel>
          <p className="kicker">{copy.explorer.capital}</p>
          <h3>{country.capital}</h3>
          <p>{country.about}</p>
          <p className="kicker">{copy.explorer.landmarks}</p>
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
          <GoldButton
            onClick={() => {
              if (landmark) collectStamp(landmark.id)
              go("mission")
            }}
          >
            {copy.explorer.startMission}
          </GoldButton>
        </Panel>
      </div>
    </div>
  )
}
