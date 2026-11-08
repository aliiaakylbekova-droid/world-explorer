import { CONTINENTS, COUNTRIES, countriesOn } from "../data/world"
import { t } from "../i18n"
import { useGame } from "../store/gameStore"
import { SafeGlobe } from "../three/SafeGlobe"
import { BackBar, GoldButton, Panel } from "../ui/chrome"

export function WorldExplorer() {
  const copy = t()
  const go = useGame((s) => s.go)
  const continent = useGame((s) => s.continent)
  const setContinent = useGame((s) => s.setContinent)
  const openCountry = useGame((s) => s.openCountry)
  const list = countriesOn(continent)

  return (
    <div className="stage split">
      <div className="stage-globe">
        <SafeGlobe continent={continent} countryId={null} onPickCountry={openCountry} />
      </div>
      <div className="side">
        <BackBar title={copy.explorer.title} onBack={() => go("menu")} />
        <Panel>
          <p className="kicker">{copy.explorer.continents}</p>
          <div className="chips">
            {CONTINENTS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={continent === item.id ? "chip on" : "chip"}
                onClick={() => setContinent(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>
          <p className="kicker">{copy.explorer.countries}</p>
          <ul className="list">
            {list.length === 0 ? (
              <li>
                {COUNTRIES.filter((c) => c.continent === continent).length === 0
                  ? "На этом материке пока нет карточек стран — вращай глобус."
                  : null}
              </li>
            ) : (
              list.map((c) => (
                <li key={c.id}>
                  <button type="button" className="row" onClick={() => openCountry(c.id)}>
                    <span className="flag">{c.flag}</span>
                    <span>
                      <strong>{c.name}</strong>
                      <em>
                        {copy.explorer.capital}: {c.capital}
                      </em>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
          <GoldButton onClick={() => go("mission")}>{copy.explorer.startMission}</GoldButton>
        </Panel>
      </div>
    </div>
  )
}
