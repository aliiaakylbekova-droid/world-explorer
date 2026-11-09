import { useEffect, useMemo, useState } from "react"
import "../index.css"
import { audio } from "../audio/AudioManager"
import { GEO_CAMPAIGN } from "../data/campaign"
import { LANDMARKS, NEIGHBORS, getCatalog, loadCatalog } from "../geo/catalog"
import { formatClock } from "./logic"
import { CampaignOverlay } from "./CampaignOverlay"
import { t } from "../i18n"
import { FLAG_MODES, STORY_MISSIONS, type StoryMission } from "./storyMissions"
import { StageView } from "../three/StageView"
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
  const lastHit = useGame((s) => s.lastHit)
  const introPhase = useGame((s) => s.introPhase)
  const finishIntro = useGame((s) => s.finishIntro)
  const campaign = useGame((s) => s.campaign)
  const campaignPhase = useGame((s) => s.campaignPhase)
  const startCampaign = useGame((s) => s.startCampaign)
  const tickTimeout = useGame((s) => s.tickTimeout)
  const lastCountryName = useGame((s) => s.lastCountryName)
  const hitTint = useGame((s) => s.hitTint)
  const [hintOn, setHintOn] = useState(false)
  const [point, setPoint] = useState<{ title: string; text: string } | null>(null)
  const [flagRound, setFlagRound] = useState<StoryMission | null>(null)
  const [hoverTip, setHoverTip] = useState<{ name: string; x: number; y: number } | null>(null)
  const left = useTick(missionEndsAt)

  useEffect(() => {
    void loadCatalog()
  }, [])

  useEffect(() => {
    if (introPhase !== "approach") return
    const id = window.setTimeout(() => finishIntro(), 3400)
    return () => window.clearTimeout(id)
  }, [introPhase, finishIntro])

  useEffect(() => {
    if (introPhase !== "ready") return
    audio.unlock()
    audio.play("ambient")
    if (!campaign && progress.campaignIndex < GEO_CAMPAIGN.length) startCampaign(progress.campaignIndex)
  }, [introPhase])

  useEffect(() => {
    if (campaign && campaignPhase === "play" && left <= 0 && missionEndsAt) tickTimeout()
  }, [left, campaign, campaignPhase, missionEndsAt, tickTimeout])

  const country = selectedIso ? getCatalog()?.byIso.get(selectedIso) : undefined
  const landmark = LANDMARKS.find((l) => l.id === landmarkId) ?? LANDMARKS[0]
  const localMarks = LANDMARKS.filter((l) => !selectedIso || l.country === selectedIso)

  function judge(hit: { iso: string | null; lat: number; lng: number }) {
    pick(hit)
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

  const discover = stage === "discover"
  const ui = t().play
  const dict = t()
  void progress.locale
  const missionIndex = campaign?.number ?? (mission ? Math.max(1, STORY_MISSIONS.findIndex((m) => m.id === mission.id) + 1) : stage === "explore" ? 0 : 1)
  const level = campaign?.number ?? Math.floor(progress.xp / 120) + 1
  const xpInto = progress.xp % 120
  const missionProgress = Math.min(1, (progress.campaignDone.length || progress.missionsDone.length) / GEO_CAMPAIGN.length)

  const leftTitle = campaign ? campaign.title : stage === "explore" ? ui.explore : stage === "discover" ? ui.discover : stage === "journal" ? ui.journal : stage === "settings" ? dict.settings.title : mission?.title ?? ui.missions
  const leftBrief = campaign
    ? campaign.instruction
    : stage === "explore"
      ? "Вращай Землю, приближай, кликай страны. Сначала смотри, потом задание."
      : stage === "discover"
        ? landmark?.fact
        : stage === "journal"
          ? "Записи экспедиции."
          : stage === "settings"
            ? ui.settingsBrief
            : mission?.story

  return (
    <div className={`gq-live hud intro-${introPhase}`} data-hud="explorer-v2" data-intro={introPhase}>
      <header className="hud-top">
        <div className="brand">
          <strong>GEO QUEST</strong>
          <span className="pilot">{profile?.name}</span>
        </div>
        <div className="hud-xp">
          <span>
            {ui.level} {level}
          </span>
          <span className="sep" />
          <span>{progress.xp} XP</span>
          <span className="sep" />
          <span>
            {progress.campaignDone.length}/{GEO_CAMPAIGN.length}
          </span>
        </div>
      </header>

      <aside className="hud-left">
        <article className="mission-card" key={stage + (mission?.id ?? "")}>
            <p className="mission-no">
              {ui.level} {String(missionIndex).padStart(2, "0")}
            </p>
            <h3>{leftTitle}</h3>
            <p className="brief">{leftBrief}</p>
            {campaign ? (
              <>
                <p className="goal">
                  <span>{ui.task}</span>
                  {campaign.goal}
                </p>
                <p className="xp-reward">+{campaign.reward} XP</p>
              </>
            ) : null}
            {(stage === "mission" || stage === "flag") && mission && !campaign ? (
            <>
              <p className="goal">
                <span>{ui.goal}</span>
                {mission.goal}
              </p>
              <p className="xp-reward">+{mission.xp} XP</p>
            </>
          ) : null}
          {stage === "explore" ? (
            <p className="goal">
              <span>{ui.goal}</span>
              Изучи территорию. Имена стран — только при наведении или выборе.
            </p>
          ) : null}
          {stage === "discover" && landmark ? (
            <>
              {point ? (
                <div className="recap">
                  <strong>{point.title}</strong>
                  <p>{point.text}</p>
                </div>
              ) : (
                <p className="goal">
                  <span>{ui.goal}</span>
                  Кликай золотые точки на сцене.
                </p>
              )}
              <button type="button" className="btn" onClick={() => setStage("mission")}>
                К миссии по территории
              </button>
            </>
          ) : null}
          {(stage === "mission" || stage === "flag") && mission ? (
            <>
              {hintOn ? <p className="hint-box">{mission.hint}</p> : null}
              <button type="button" className="btn ghost" onClick={() => setHintOn(true)}>
                {ui.hint}
              </button>
              {lastFeedback ? <p className={lastFeedback.ok ? "ok" : "bad"}>{lastFeedback.text}</p> : null}
              {lastFeedback?.ok ? <p className="recap">{mission.recap}</p> : null}
            </>
          ) : null}
          {stage === "journal" ? (
            <ul className="journal">
              {progress.journal.length === 0 ? <li>Пока пусто — исследуй мир.</li> : progress.journal.map((j) => <li key={j.at}>{j.text}</li>)}
            </ul>
          ) : null}
          {stage === "settings" ? (
            <div className="audio-set">
              <label className="audio-row">
                <span>{ui.music}</span>
                <input type="checkbox" checked={progress.musicOn} onChange={(e) => useGame.getState().setMusic(e.target.checked)} />
              </label>
              <input type="range" min={0} max={1} step={0.05} value={progress.musicVol} onChange={(e) => useGame.getState().setMusicVol(Number(e.target.value))} />
              <label className="audio-row">
                <span>{ui.sfx}</span>
                <input type="checkbox" checked={progress.sfxOn} onChange={(e) => useGame.getState().setSfx(e.target.checked)} />
              </label>
              <input type="range" min={0} max={1} step={0.05} value={progress.sfxVol} onChange={(e) => useGame.getState().setSfxVol(Number(e.target.value))} />
              <div className="diff-row">
                {(["easy", "medium", "hard"] as const).map((d) => (
                  <button key={d} type="button" className={progress.difficulty === d ? "chip on" : "chip"} onClick={() => useGame.getState().setDifficulty(d)}>
                    {dict.settings[d]}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mission-progress">
            <span>{ui.progress}</span>
            <div className="bar">
              <i style={{ width: `${Math.round(missionProgress * 100)}%` }} />
            </div>
          </div>
        </article>
      </aside>

      <main className="hud-center">
        <StageView
          discover={discover}
          scene={landmark.scene}
          onPick={judge}
          onPoint={(title, text) => setPoint({ title, text })}
          onHover={(hit) => {
            if (!hit?.name) setHoverTip(null)
            else setHoverTip({ name: hit.name, x: hit.x, y: hit.y })
          }}
        />
        {hoverTip ? (
          <div className="gq-tip" style={{ left: hoverTip.x, top: hoverTip.y }}>
            {hoverTip.name}
          </div>
        ) : null}
        {lastCountryName && (hitTint === "gold" || hitTint === "cyan" || selectedIso) ? (
          <div className={`gq-select-chip tint-${hitTint || "cyan"}`}>{lastCountryName}</div>
        ) : country ? (
          <div className="gq-select-chip">{country.name}</div>
        ) : null}
        <CampaignOverlay />
      </main>

      <aside className="hud-right">
        {campaign && campaignPhase === "play" ? (
          <div className="timer-xl" key={campaign.id}>
            {formatClock(left)}
          </div>
        ) : (stage === "mission" || stage === "flag") && mission && !campaign ? (
          <div className="timer-xl" key={mission.id}>
            {formatClock(left)}
          </div>
        ) : (
          <div className="timer-idle">{campaign ? ui.missions : ui.explore}</div>
        )}
        <div className="stat-stack">
          <div className="stat">
            <span>{ui.level}</span>
            <b>{level}</b>
          </div>
          <div className="xp-track">
            <span>
              XP {progress.xp} · {xpInto}/120
            </span>
            <div className="bar">
              <i style={{ width: `${(xpInto / 120) * 100}%` }} />
            </div>
          </div>
          <div className="stat">
            <span>{ui.score}</span>
            <b>◆ {progress.coins}</b>
          </div>
        </div>
        {stage === "flag" && flagRound?.targetIso ? (
          <div className="flag-hunt">
            <p>{ui.clickFlag}</p>
            <FlagImg iso={flagRound.targetIso} />
            {flagRound.kind !== "flag" ? <p className="tiny">{flagRound.story}</p> : null}
          </div>
        ) : null}
        {stage !== "flag" && country ? (
          <div className="country-card" key={country.iso}>
            <img className="flag-sm" src={`${import.meta.env.BASE_URL}flags/${country.iso.toLowerCase()}.svg`} alt="" />
            <h3>{country.name}</h3>
            <p>
              {ui.capital}: {country.capital || "—"}
            </p>
            <p>
              {country.continent} · {country.lat.toFixed(1)}°, {country.lng.toFixed(1)}°
            </p>
            {NEIGHBORS[country.iso] ? (
              <p>
                {ui.neighbors}: {NEIGHBORS[country.iso].map(countryName).join(", ")}
              </p>
            ) : null}
            {localMarks.map((lm) => (
              <button key={lm.id} type="button" className="chip" onClick={() => openLandmark(lm.id)}>
                {lm.name}
              </button>
            ))}
          </div>
        ) : null}
        {stage !== "flag" && !country ? <p className="tiny">{ui.hoverHint}</p> : null}
        {lastHit ? (
          <p className="tiny">
            {ui.cursor}: {lastHit.lat.toFixed(1)}°, {lastHit.lng.toFixed(1)}°
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
            <button
              key={k}
              type="button"
              className={layers[k] ? "layer-sw on" : "layer-sw"}
              aria-pressed={layers[k]}
              onClick={() => setLayers({ [k]: !layers[k] })}
            >
              <span className="layer-knob" />
              {label}
            </button>
          ))}
        </div>
      </aside>

      <nav className="hud-bottom">
        <button type="button" className={stage === "explore" ? "on" : ""} onClick={() => setStage("explore")}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8" />
            <path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16" />
          </svg>
          <span>{ui.explore}</span>
        </button>
        <button type="button" className={stage === "discover" ? "on" : ""} onClick={() => (landmarkId ? setStage("discover") : openLandmark("issyk"))}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 4v4M12 16v4M4 12h4M16 12h4" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>{ui.discover}</span>
        </button>
        <button
          type="button"
          className={stage === "mission" || Boolean(campaign) ? "on" : ""}
          onClick={() => {
            setStage("mission")
            startCampaign(progress.campaignIndex < GEO_CAMPAIGN.length ? progress.campaignIndex : 0)
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 4h10l-2 4 2 4H6v8" />
          </svg>
          <span>{ui.missions}</span>
        </button>
        <button type="button" className={stage === "flag" ? "on" : ""} onClick={() => newFlagRound("flag")}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 4v16M6 4h10l-2 4 2 4H6" />
          </svg>
          <span>{ui.flags}</span>
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
            {ui.assignment}
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
        <button type="button" className={stage === "journal" ? "on" : ""} onClick={() => setStage("journal")}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="6" y="4" width="12" height="16" rx="1" />
            <path d="M9 8h6M9 12h6M9 16h4" />
          </svg>
          <span>{ui.journal}</span>
        </button>
        <button type="button" className={stage === "settings" ? "on" : ""} onClick={() => setStage("settings")}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
          </svg>
          <span>{ui.profile}</span>
        </button>
        {(stage === "mission" || stage === "flag") && mission ? (
          <button type="button" className="ghost" onClick={() => clearMission()}>
            <span>{ui.surrender}</span>
          </button>
        ) : null}
      </nav>
    </div>
  )
}
