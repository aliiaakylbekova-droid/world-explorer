import { useEffect, useMemo, useState } from "react"
import { LANDMARKS, NEIGHBORS, getCatalog, loadCatalog } from "../geo/catalog"
import { formatClock } from "./logic"
import { FLAG_MODES, STORY_MISSIONS, type StoryMission } from "./storyMissions"
import { GlobeMap } from "./GlobeMap"
import { LandmarkWorld } from "../three/LandmarkWorld"
import { useGame } from "../store/gameStore"

function FlagImg({ iso }: { iso: string }) {
  return (
    <img
      className="flag-xl"
      src={`${import.meta.env.BASE_URL}flags/${iso.toLowerCase()}.svg`}
      alt={`Флаг ${iso}`}
    />
  )
}

function useTick(endsAt: number | null) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!endsAt) return
    const id = window.setInterval(() => setNow(Date.now()), 200)
    return () => window.clearInterval(id)
  }, [endsAt])
  return endsAt ? Math.max(0, endsAt - now) : 0
}

function countryName(iso: string | null) {
  if (!iso) return "—"
  return getCatalog()?.byIso.get(iso)?.name ?? iso
}

export function GameShell() {
  const stage = useGame((s) => s.stage)
  const setStage = useGame((s) => s.setStage)
  const pick = useGame((s) => s.pick)
  const profile = useGame((s) => s.profile)
  const progress = useGame((s) => s.progress)
  const selectedIso = useGame((s) => s.selectedIso)
  const layers = useGame((s) => s.layers)
  const setLayers = useGame((s) => s.setLayers)
  const landmarkId = useGame((s) => s.landmarkId)
  const openLandmark = useGame((s) => s.openLandmark)
  const mission = useGame((s) => s.mission)
  const startMission = useGame((s) => s.startMission)
  const clearMission = useGame((s) => s.clearMission)
  const missionEndsAt = useGame((s) => s.missionEndsAt)
  const lastFeedback = useGame((s) => s.lastFeedback)
  const setFeedback = useGame((s) => s.setFeedback)
  const award = useGame((s) => s.award)
  const note = useGame((s) => s.note)
  const completeMission = useGame((s) => s.completeMission)
  const fly = useGame((s) => s.fly)
  const lastHit = useGame((s) => s.lastHit)
  const [hintOn, setHintOn] = useState(false)
  const [point, setPoint] = useState<{ title: string; text: string } | null>(null)
  const [flagRound, setFlagRound] = useState<StoryMission | null>(null)
  const left = useTick(missionEndsAt)

  useEffect(() => {
    void loadCatalog()
  }, [])

  const country = selectedIso ? getCatalog()?.byIso.get(selectedIso) : undefined
  const landmark = LANDMARKS.find((l) => l.id === landmarkId) ?? LANDMARKS[0]
  const localMarks = LANDMARKS.filter((l) => !selectedIso || l.country === selectedIso)

  function judge(hit: { iso: string | null; lat: number; lng: number }) {
    pick(hit)
    const m = useGame.getState().mission
    if (!m) return
    if (left <= 0) {
      setFeedback(false, "Время вышло. Прочитай подсказку и попробуй снова.")
      return
    }
    let ok = false
    if (m.kind === "river" || m.kind === "mountain" || m.kind === "city" || m.kind === "coords") {
      const dlat = (m.lat ?? 0) - hit.lat
      const dlng = (m.lng ?? 0) - hit.lng
      ok = dlat * dlat + dlng * dlng < (m.kind === "coords" ? 64 : 36)
    } else if (m.kind === "continent") {
      const rec = hit.iso ? getCatalog()?.byIso.get(hit.iso) : undefined
      ok = rec?.continent === "Asia" || rec?.continent === "Europe"
    } else if (m.kind === "flag" || m.kind === "capital" || m.kind === "neighbors" || m.kind === "shape") {
      ok = Boolean(hit.iso && hit.iso === m.targetIso)
    }
    if (ok) {
      setFeedback(true, `${m.targetName ?? m.title}: верно.`)
      award(m.xp, 20)
      completeMission(m.id)
      note(`${m.title}: ${m.recap}`)
      if (m.lat != null) fly(m.lat, m.lng ?? 0, 3.2)
    } else {
      setFeedback(false, m.hint)
    }
  }

  const flagPool = useMemo(() => getCatalog()?.countries.filter((c) => c.iso.length === 2) ?? [], [stage, selectedIso])

  function newFlagRound(kind: (typeof FLAG_MODES)[number] = "flag") {
    const pool = flagPool.length ? flagPool : [{ iso: "KG", name: "Кыргызстан", capital: "Бишкек", lat: 41.2, lng: 74.6, continent: "Asia", a3: "KGZ", nameEn: "Kyrgyzstan", subregion: "", pop: 0 }]
    const c = pool[Math.floor(Math.random() * pool.length)]
    const neighbors = (NEIGHBORS[c.iso] || []).map((iso) => getCatalog()?.byIso.get(iso)?.name ?? iso).join(", ")
    const stories: Record<string, StoryMission> = {
      flag: {
        id: `flag-${c.iso}`,
        kind: "flag",
        title: "Охотник за флагами",
        story: "Перед тобой флаг. Найди страну на карте мира.",
        goal: "Кликни страну, которой принадлежит этот флаг.",
        hint: `Столица: ${c.capital || "—"}. Материк: ${c.continent}.`,
        recap: `Это ${c.name}. Столица — ${c.capital}.`,
        timeMs: 50_000,
        xp: 90,
        targetIso: c.iso,
        targetName: c.name,
        lat: c.lat,
        lng: c.lng,
      },
      capital: {
        id: `cap-${c.iso}`,
        kind: "capital",
        title: "Найди по столице",
        story: `Столица называется ${c.capital || "не указана"}. Где эта страна?`,
        goal: "Кликни страну на глобусе.",
        hint: `Регион: ${c.subregion || c.continent}.`,
        recap: `${c.capital} — столица страны ${c.name}.`,
        timeMs: 50_000,
        xp: 90,
        targetIso: c.iso,
        targetName: c.name,
        lat: c.lat,
        lng: c.lng,
      },
      coords: {
        id: `xy-${c.iso}`,
        kind: "coords",
        title: "Найди по координатам",
        story: `Широта ${c.lat.toFixed(1)}°, долгота ${c.lng.toFixed(1)}°.`,
        goal: "Кликни эту точку / страну на карте.",
        hint: "Сначала найди широту (север-юг), затем долготу.",
        recap: `Точка лежит в стране ${c.name}.`,
        timeMs: 55_000,
        xp: 100,
        targetIso: c.iso,
        targetName: c.name,
        lat: c.lat,
        lng: c.lng,
      },
      neighbors: {
        id: `nb-${c.iso}`,
        kind: "neighbors",
        title: "Соседи",
        story: neighbors ? `Эта страна граничит с: ${neighbors}.` : `${c.name} — узнай её по положению на материке ${c.continent}.`,
        goal: "Кликни страну-ответ на карте.",
        hint: c.continent,
        recap: `${c.name} и её соседи помогают читать политическую карту.`,
        timeMs: 60_000,
        xp: 110,
        targetIso: c.iso,
        targetName: c.name,
        lat: c.lat,
        lng: c.lng,
      },
      shape: {
        id: `sh-${c.iso}`,
        kind: "shape",
        title: "Узнай контур",
        story: "На карте подсвечен контур. Найди, какая это страна, и подтверди кликом по ней.",
        goal: "Кликни ту же страну.",
        hint: `${c.continent}. Столица: ${c.capital}.`,
        recap: `Контур принадлежит стране ${c.name}.`,
        timeMs: 45_000,
        xp: 80,
        targetIso: c.iso,
        targetName: c.name,
        lat: c.lat,
        lng: c.lng,
      },
    }
    const round = stories[kind]
    setFlagRound(round)
    startMission(round)
    if (kind === "shape") useGame.setState({ highlightIso: c.iso })
    setHintOn(false)
  }

  const onMap = stage !== "discover"

  return (
    <div className="hud">
      <header className="hud-top">
        <div>
          <strong>GEO QUEST</strong>
          <span>{profile?.name}</span>
        </div>
        <div className="hud-xp">
          XP {progress.xp} · ◆ {progress.coins}
        </div>
      </header>

      <aside className="hud-left">
        {stage === "explore" ? (
          <>
            <h3>Исследуй</h3>
            <p>Вращай Землю, приближай, кликай страны. Сначала смотри, потом задание.</p>
            <p className="tiny">Слои подписей густеют при приближении.</p>
          </>
        ) : null}
        {stage === "discover" && landmark ? (
          <>
            <h3>Открой место</h3>
            <p>{landmark.fact}</p>
            {point ? (
              <div className="recap">
                <strong>{point.title}</strong>
                <p>{point.text}</p>
              </div>
            ) : (
              <p className="tiny">Кликай золотые точки на сцене.</p>
            )}
            <button type="button" className="btn" onClick={() => setStage("mission")}>
              К миссии по территории
            </button>
          </>
        ) : null}
        {(stage === "mission" || stage === "flag") && mission ? (
          <>
            <h3>{mission.title}</h3>
            <p>{mission.story}</p>
            <p>
              <strong>Цель:</strong> {mission.goal}
            </p>
            {hintOn ? <p className="hint-box">{mission.hint}</p> : null}
            <button type="button" className="btn ghost" onClick={() => setHintOn(true)}>
              Подсказка
            </button>
            {lastFeedback ? <p className={lastFeedback.ok ? "ok" : "bad"}>{lastFeedback.text}</p> : null}
            {lastFeedback?.ok ? <p className="recap">{mission.recap}</p> : null}
          </>
        ) : null}
        {stage === "journal" ? (
          <>
            <h3>Журнал</h3>
            <ul className="journal">
              {progress.journal.length === 0 ? <li>Пока пусто — исследуй мир.</li> : progress.journal.map((j) => <li key={j.at}>{j.text}</li>)}
            </ul>
          </>
        ) : null}
        {stage === "settings" ? (
          <>
            <h3>Настройки</h3>
            <p>Язык: русский (i18n готов к другим).</p>
            <p>Сложность меняет таймер миссий.</p>
            {(["easy", "medium", "hard"] as const).map((d) => (
              <button key={d} type="button" className={progress.difficulty === d ? "chip on" : "chip"} onClick={() => useGame.getState().setDifficulty(d)}>
                {d}
              </button>
            ))}
          </>
        ) : null}
      </aside>

      <main className="hud-center">
        {onMap ? <GlobeMap onPick={judge} /> : <LandmarkWorld scene={landmark.scene} onPoint={(title, text) => setPoint({ title, text })} />}
      </main>

      <aside className="hud-right">
        {(stage === "mission" || stage === "flag") && mission ? (
          <div className="timer-xl">{formatClock(left)}</div>
        ) : null}
        {stage === "flag" && flagRound?.targetIso ? (
          <>
            <FlagImg iso={flagRound.targetIso} />
            {flagRound.kind !== "flag" ? <p className="tiny">{flagRound.story}</p> : null}
          </>
        ) : null}
        {country ? (
          <div className="country-card">
            <img className="flag-sm" src={`${import.meta.env.BASE_URL}flags/${country.iso.toLowerCase()}.svg`} alt="" />
            <h3>{country.name}</h3>
            <p>Столица: {country.capital || "—"}</p>
            <p>
              {country.continent} · {country.lat.toFixed(1)}°, {country.lng.toFixed(1)}°
            </p>
            {NEIGHBORS[country.iso] ? <p>Соседи: {NEIGHBORS[country.iso].map(countryName).join(", ")}</p> : null}
            {localMarks.map((lm) => (
              <button key={lm.id} type="button" className="chip" onClick={() => openLandmark(lm.id)}>
                {lm.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="tiny">Кликни страну — справа появится справка.</p>
        )}
        {lastHit ? (
          <p className="tiny">
            Курсор: {lastHit.lat.toFixed(1)}°, {lastHit.lng.toFixed(1)}°
          </p>
        ) : null}
        <div className="layers">
          {(
            [
              ["relief", "Рельеф"],
              ["rivers", "Реки"],
              ["borders", "Границы"],
              ["capitals", "Столицы"],
              ["climate", "Климат"],
            ] as const
          ).map(([k, label]) => (
            <label key={k}>
              <input type="checkbox" checked={layers[k]} onChange={(e) => setLayers({ [k]: e.target.checked })} />
              {label}
            </label>
          ))}
        </div>
      </aside>

      <nav className="hud-bottom">
        <button type="button" className={stage === "explore" ? "on" : ""} onClick={() => setStage("explore")}>
          Исследуй
        </button>
        <button type="button" className={stage === "discover" ? "on" : ""} onClick={() => (landmarkId ? setStage("discover") : openLandmark("issyk"))}>
          Открой
        </button>
        <button
          type="button"
          className={stage === "mission" ? "on" : ""}
          onClick={() => {
            setStage("mission")
            if (!mission) startMission(STORY_MISSIONS[0])
          }}
        >
          Миссия
        </button>
        <button type="button" className={stage === "flag" ? "on" : ""} onClick={() => newFlagRound("flag")}>
          Флаги
        </button>
        <select
          className="mission-select"
          defaultValue=""
          onChange={(e) => {
            const v = e.target.value
            const story = STORY_MISSIONS.find((m) => m.id === v)
            if (story) startMission(story)
            if (FLAG_MODES.includes(v as (typeof FLAG_MODES)[number])) newFlagRound(v as (typeof FLAG_MODES)[number])
            e.target.selectedIndex = 0
          }}
        >
          <option value="" disabled>
            Задание…
          </option>
          {STORY_MISSIONS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
          <option value="flag">Охотник: флаг</option>
          <option value="capital">Охотник: столица</option>
          <option value="coords">Охотник: координаты</option>
          <option value="neighbors">Охотник: соседи</option>
          <option value="shape">Охотник: контур</option>
        </select>
        <button type="button" onClick={() => setStage("journal")}>
          Журнал
        </button>
        <button type="button" onClick={() => setStage("settings")}>
          Настройки
        </button>
        {(stage === "mission" || stage === "flag") && mission ? (
          <button type="button" className="ghost" onClick={() => clearMission()}>
            Сдать карту
          </button>
        ) : null}
      </nav>
    </div>
  )
}
