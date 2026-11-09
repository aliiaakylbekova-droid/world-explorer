import { create } from "zustand"
import { audio } from "../audio/AudioManager"
import { GEO_CAMPAIGN, type CampaignLevel } from "../data/campaign"
import { countryNameOf, evaluateLevel, evaluateMission } from "../geo/hitTest"
import { LANDMARKS } from "../geo/catalog"
import type { StoryMission } from "../game/storyMissions"
import type { Locale } from "../i18n"
import { setLocale, t } from "../i18n"
import type { Layers } from "../three/EarthScene"
import { cloudPull, cloudPush, cloudResetProgress } from "../net/cloud"
import { publishScore } from "../net/leaderboard"
import type { Profile } from "../types/electron"

export type Stage = "register" | "explore" | "discover" | "mission" | "flag" | "journal" | "settings"
export type IntroPhase = "card" | "approach" | "ready"
export type CampaignPhase = "play" | "correct" | "success" | "wrong" | "timeout" | "levelComplete" | "campaignComplete" | "transition"
export type HitTint = "gold" | "cyan" | "red" | "orange" | null

let autoAdvanceTimer = 0

export type FlyTo = { lat: number; lng: number; dist: number } | null

export type Progress = {
  xp: number
  coins: number
  achievements: string[]
  stamps: string[]
  visited: string[]
  missionsDone: string[]
  journal: { at: number; text: string }[]
  difficulty: "easy" | "medium" | "hard"
  volume: number
  musicOn: boolean
  sfxOn: boolean
  musicVol: number
  sfxVol: number
  locale: Locale
  campaignIndex: number
  campaignDone: string[]
}

const defaultProgress = (): Progress => ({
  xp: 0,
  coins: 0,
  achievements: [],
  stamps: [],
  visited: [],
  missionsDone: [],
  journal: [],
  difficulty: "medium",
  volume: 0.7,
  musicOn: true,
  sfxOn: true,
  musicVol: 0.32,
  sfxVol: 0.7,
  locale: "ru",
  campaignIndex: 0,
  campaignDone: [],
})

type GameState = {
  ready: boolean
  stage: Stage
  profile: Profile | null
  progress: Progress
  selectedIso: string | null
  highlightIso: string | null
  landmarkId: string | null
  layers: Layers
  flyTo: FlyTo
  lastHit: { lat: number; lng: number; iso: string | null } | null
  mission: StoryMission | null
  missionEndsAt: number | null
  lastFeedback: { ok: boolean; text: string } | null
  introPhase: IntroPhase
  campaign: CampaignLevel | null
  campaignPhase: CampaignPhase
  hitTint: HitTint
  spinBoost: number
  displayXp: number
  lastCountryName: string | null
  advancing: boolean
  hydrate: () => Promise<void>
  register: (name: string, avatar: string) => Promise<void>
  finishIntro: () => void
  setStage: (stage: Stage) => void
  pick: (hit: { iso: string | null; lat: number; lng: number }) => void
  setLayers: (partial: Partial<Layers>) => void
  openLandmark: (id: string) => void
  startMission: (mission: StoryMission) => void
  clearMission: () => void
  award: (xp: number, coins: number) => void
  note: (text: string) => void
  completeMission: (id: string) => void
  fly: (lat: number, lng: number, dist?: number) => void
  setFeedback: (ok: boolean, text: string) => void
  setDifficulty: (d: Progress["difficulty"]) => void
  setVolume: (v: number) => void
  setMusic: (on: boolean) => void
  setSfx: (on: boolean) => void
  setMusicVol: (v: number) => void
  setSfxVol: (v: number) => void
  setLocalePref: (locale: Locale) => void
  resetProgress: () => Promise<void>
  startCampaign: (index?: number) => void
  retryLevel: () => void
  continueCampaign: () => void
  tickTimeout: () => void
  syncAudio: () => void
}

async function persist(progress: Progress, profile?: Profile | null) {
  if (window.geoQuest) await window.geoQuest.saveProgress(progress)
  else localStorage.setItem("gq-progress", JSON.stringify(progress))
  const who = profile ?? useGame.getState().profile
  void cloudPush(who, progress)
}

function grant(progress: Progress, id: string) {
  if (progress.achievements.includes(id)) return progress
  return { ...progress, achievements: [...progress.achievements, id], coins: progress.coins + 25 }
}

export const useGame = create<GameState>((set, get) => ({
  ready: false,
  stage: "register",
  profile: null,
  progress: defaultProgress(),
  selectedIso: null,
  highlightIso: null,
  landmarkId: null,
  layers: { relief: true, rivers: true, borders: true, capitals: true, climate: false },
  flyTo: null,
  lastHit: null,
  mission: null,
  missionEndsAt: null,
  lastFeedback: null,
  introPhase: "card",
  campaign: null,
  campaignPhase: "play",
  hitTint: null,
  spinBoost: 0,
  displayXp: 0,
  lastCountryName: null,
  advancing: false,

  hydrate: async () => {
    try {
      const api = window.geoQuest
      const withTime = async <T>(job: Promise<T> | undefined): Promise<T | null> => {
        if (!job) return null
        return Promise.race([job, new Promise<null>((r) => setTimeout(() => r(null), 2000))])
      }
      const profile =
        (await withTime(api?.getProfile())) ??
        (localStorage.getItem("gq-profile") ? (JSON.parse(localStorage.getItem("gq-profile")!) as Profile) : null)
      const saved = ((await withTime(api?.getProgress() as Promise<Progress> | undefined)) ??
        (localStorage.getItem("gq-progress") ? JSON.parse(localStorage.getItem("gq-progress")!) : null)) as Progress | null
      let progress = saved ? { ...defaultProgress(), ...saved } : defaultProgress()
      let nextProfile = profile
      if (!nextProfile) {
        const cloud = await cloudPull()
        if (cloud.profile) {
          nextProfile = cloud.profile
          if (cloud.progress) progress = { ...defaultProgress(), ...cloud.progress }
          if (window.geoQuest) {
            await window.geoQuest.saveProfile(nextProfile)
            await window.geoQuest.saveProgress(progress)
          } else {
            localStorage.setItem("gq-profile", JSON.stringify(nextProfile))
            localStorage.setItem("gq-progress", JSON.stringify(progress))
          }
        }
      } else {
        void cloudPush(nextProfile, progress)
      }
      setLocale(progress.locale)
      audio.setMaster(progress.volume)
      audio.setMusic(progress.musicOn)
      audio.setSfx(progress.sfxOn)
      audio.setMusicVol(progress.musicVol)
      audio.setSfxVol(progress.sfxVol)
      set({
        profile: nextProfile,
        progress,
        displayXp: progress.xp,
        ready: true,
        stage: nextProfile ? "explore" : "register",
        introPhase: nextProfile ? "approach" : "card",
      })
    } catch {
      set({ ready: true, stage: "register", progress: defaultProgress(), introPhase: "card" })
    }
  },

  register: async (name, avatar) => {
    const profile: Profile = { name: name.trim().slice(0, 40), avatar, createdAt: Date.now() }
    if (window.geoQuest) await window.geoQuest.saveProfile(profile)
    else localStorage.setItem("gq-profile", JSON.stringify(profile))
    const progress = grant(get().progress, "first-step")
    await persist(progress, profile)
    audio.unlock()
    audio.play("start")
    audio.play("ambient")
    set({ profile, progress, displayXp: progress.xp, stage: "explore", introPhase: "approach" })
  },

  finishIntro: () => {
    if (get().introPhase === "ready") return
    set({ introPhase: "ready" })
  },

  setStage: (stage) => {
    let progress = get().progress
    if (stage === "explore") progress = grant(progress, "globe-spin")
    const home = stage === "explore" && get().stage !== "explore"
    set({
      stage,
      lastFeedback: null,
      flyTo: home ? { lat: 18, lng: 20, dist: 6.5 } : get().flyTo,
    })
    void persist(progress)
    if (progress !== get().progress) set({ progress })
  },

  pick: (hit) => {
    audio.unlock()
    const st = get()
    if (st.introPhase !== "ready") return
    if (st.stage === "discover") return
    const busy = st.campaignPhase === "correct" || st.campaignPhase === "success" || st.campaignPhase === "transition"
    if (busy && st.stage !== "flag") return

    const visited =
      hit.iso && !st.progress.visited.includes(hit.iso) ? [...st.progress.visited, hit.iso] : st.progress.visited
    const progress = { ...st.progress, visited }
    const name = countryNameOf(hit.iso)
    void persist(progress)

    const useFlag = st.stage === "flag" && st.mission
    const useStory = !useFlag && st.mission && st.stage === "mission" && !st.campaign
    const useCampaign = !useFlag && st.campaign && st.campaignPhase === "play"

    if (!useFlag && !useStory && !useCampaign) {
      set({
        selectedIso: hit.iso,
        lastHit: hit,
        lastCountryName: name,
        progress,
        flyTo: hit.iso ? { lat: hit.lat, lng: hit.lng, dist: 3.85 } : st.flyTo,
      })
      return
    }

    if (st.missionEndsAt && Date.now() >= st.missionEndsAt && (useCampaign || useFlag || useStory)) {
      audio.play("fail")
      set({
        selectedIso: hit.iso,
        lastHit: hit,
        lastCountryName: name,
        progress,
        campaignPhase: useCampaign ? "timeout" : st.campaignPhase,
        hitTint: "orange",
        lastFeedback: { ok: false, text: t().play.timesUp },
      })
      return
    }

    let ok = false
    let fact = ""
    let reward = 80
    if (useFlag || useStory) {
      ok = evaluateMission(st.mission!, hit)
      fact = st.mission!.recap
      reward = st.mission!.xp
    } else if (useCampaign) {
      ok = evaluateLevel(st.campaign!, hit)
      fact = st.campaign!.fact
      reward = st.campaign!.reward
    }

    if (ok) {
      audio.play("discovery")
      if (st.mission && (useFlag || useStory)) {
        get().completeMission(st.mission.id)
        get().note(`${st.mission.title}: ${st.mission.recap}`)
      }
      set({
        selectedIso: hit.iso,
        highlightIso: hit.iso,
        lastHit: hit,
        lastCountryName: name,
        progress,
        campaignPhase: useCampaign ? "correct" : st.campaignPhase,
        hitTint: "gold",
        spinBoost: 0,
        lastFeedback: { ok: true, text: t().play.correctLocation },
      })
      window.setTimeout(() => {
        audio.play("success")
        const now = get()
        let next = { ...now.progress, xp: now.progress.xp + reward, coins: now.progress.coins + 20 }
        if (next.xp >= 500) next = grant(next, "xp-500")
        for (let i = 0; i < 6; i += 1) window.setTimeout(() => audio.play("xp"), 80 * i)
        set({
          campaignPhase: useCampaign ? "success" : now.campaignPhase,
          hitTint: "cyan",
          progress: next,
          lastFeedback: { ok: true, text: t().play.greatJob },
        })
        void persist(next)
        if (useCampaign) {
          window.clearTimeout(autoAdvanceTimer)
          autoAdvanceTimer = window.setTimeout(() => {
            if (get().campaignPhase === "success") get().continueCampaign()
          }, 2600)
        }
      }, 900)
    } else {
      audio.play("fail")
      const hint = useCampaign ? st.campaign!.hint : st.mission?.hint || t().play.tryElsewhere
      set({
        selectedIso: hit.iso,
        lastHit: hit,
        lastCountryName: name,
        progress,
        campaignPhase: useCampaign ? "wrong" : st.campaignPhase,
        hitTint: "red",
        lastFeedback: { ok: false, text: hint },
      })
      window.setTimeout(() => {
        if (get().campaignPhase !== "wrong") return
        set({ campaignPhase: useCampaign ? "play" : get().campaignPhase, hitTint: null })
      }, 2200)
    }
    void fact
  },

  setLayers: (partial) => set({ layers: { ...get().layers, ...partial } }),

  openLandmark: (id) => {
    const lm = LANDMARKS.find((l) => l.id === id)
    if (!lm) return
    const stamps = get().progress.stamps.includes(id) ? get().progress.stamps : [...get().progress.stamps, id]
    const progress = { ...get().progress, stamps }
    set({
      landmarkId: id,
      selectedIso: lm.country,
      stage: "discover",
      flyTo: { lat: lm.lat, lng: lm.lng, dist: 3.1 },
      progress,
    })
    void persist(progress)
  },

  startMission: (mission) => {
    const bonus = get().progress.difficulty === "hard" ? 0.7 : get().progress.difficulty === "easy" ? 1.4 : 1
    set({
      mission,
      missionEndsAt: Date.now() + mission.timeMs * bonus,
      lastFeedback: null,
      highlightIso: mission.targetIso ?? null,
      stage: mission.kind === "flag" || mission.kind === "capital" || mission.kind === "neighbors" || mission.kind === "shape" ? "flag" : "mission",
      flyTo:
        mission.kind === "flag" || mission.kind === "capital" || mission.kind === "neighbors" || mission.kind === "shape"
          ? { lat: 18, lng: 20, dist: 6.6 }
          : mission.lat != null
            ? { lat: mission.lat, lng: mission.lng ?? 0, dist: 5.4 }
            : { lat: 20, lng: 30, dist: 6.5 },
    })
  },

  clearMission: () =>
    set({
      mission: null,
      missionEndsAt: null,
      highlightIso: null,
      lastFeedback: null,
      stage: "explore",
      flyTo: { lat: 18, lng: 20, dist: 6.5 },
    }),

  award: (xp, coins) => {
    let progress = { ...get().progress, xp: get().progress.xp + xp, coins: get().progress.coins + coins }
    if (progress.xp >= 500) progress = grant(progress, "xp-500")
    set({ progress })
    void persist(progress)
  },

  note: (text) => {
    const journal = [{ at: Date.now(), text }, ...get().progress.journal].slice(0, 40)
    const progress = { ...get().progress, journal }
    set({ progress })
    void persist(progress)
  },

  completeMission: (id) => {
    const progress = {
      ...get().progress,
      missionsDone: get().progress.missionsDone.includes(id) ? get().progress.missionsDone : [...get().progress.missionsDone, id],
    }
    set({ progress })
    void persist(progress)
  },

  fly: (lat, lng, dist = 4.1) => set({ flyTo: { lat, lng, dist } }),

  setFeedback: (ok, text) => set({ lastFeedback: { ok, text }, highlightIso: ok ? get().selectedIso : get().highlightIso }),

  setDifficulty: (d) => {
    const progress = { ...get().progress, difficulty: d }
    set({ progress })
    void persist(progress)
  },

  setVolume: (v) => {
    audio.setMaster(v)
    const progress = { ...get().progress, volume: v }
    set({ progress })
    void persist(progress)
  },

  setMusic: (on) => {
    audio.setMusic(on)
    const progress = { ...get().progress, musicOn: on }
    set({ progress })
    void persist(progress)
  },

  setSfx: (on) => {
    audio.setSfx(on)
    const progress = { ...get().progress, sfxOn: on }
    set({ progress })
    void persist(progress)
  },

  setMusicVol: (v) => {
    audio.setMusicVol(v)
    const progress = { ...get().progress, musicVol: v }
    set({ progress })
    void persist(progress)
  },

  setSfxVol: (v) => {
    audio.setSfxVol(v)
    const progress = { ...get().progress, sfxVol: v }
    set({ progress })
    void persist(progress)
  },

  syncAudio: () => {
    const p = get().progress
    audio.setMaster(p.volume)
    audio.setMusic(p.musicOn)
    audio.setSfx(p.sfxOn)
    audio.setMusicVol(p.musicVol)
    audio.setSfxVol(p.sfxVol)
  },

  startCampaign: (index) => {
    const i = Math.max(0, Math.min(GEO_CAMPAIGN.length - 1, index ?? get().progress.campaignIndex))
    const level = GEO_CAMPAIGN[i]
    const bonus = get().progress.difficulty === "hard" ? 0.75 : get().progress.difficulty === "easy" ? 1.35 : 1
    audio.play("transition")
    audio.play("zoom")
    set({
      campaign: level,
      campaignPhase: "play",
      hitTint: null,
      spinBoost: 0,
      lastFeedback: null,
      selectedIso: null,
      highlightIso: null,
      mission: null,
      stage: "mission",
      missionEndsAt: Date.now() + level.timeMs * bonus,
      flyTo: { ...level.fly },
      advancing: false,
    })
  },

  retryLevel: () => {
    const level = get().campaign
    if (!level) {
      get().startCampaign()
      return
    }
    const bonus = get().progress.difficulty === "hard" ? 0.75 : get().progress.difficulty === "easy" ? 1.35 : 1
    audio.play("transition")
    set({
      campaignPhase: "play",
      hitTint: null,
      lastFeedback: null,
      missionEndsAt: Date.now() + level.timeMs * bonus,
      flyTo: { ...level.fly },
    })
  },

  continueCampaign: () => {
    const level = get().campaign
    if (!level) return
    if (get().advancing) return
    if (get().campaignPhase !== "success" && get().campaignPhase !== "levelComplete") return
    window.clearTimeout(autoAdvanceTimer)
    set({ advancing: true })
    const done = get().progress.campaignDone.includes(level.id)
      ? get().progress.campaignDone
      : [...get().progress.campaignDone, level.id]
    const missionsDone = get().progress.missionsDone.includes(level.id)
      ? get().progress.missionsDone
      : [...get().progress.missionsDone, level.id]
    const nextIndex = level.number
    const last = nextIndex >= GEO_CAMPAIGN.length
    const progress = {
      ...get().progress,
      campaignDone: done,
      missionsDone,
      campaignIndex: last ? GEO_CAMPAIGN.length : nextIndex,
    }
    audio.play("unlock")
    if (last) {
      audio.play("missionComplete")
      set({
        progress,
        campaignPhase: "campaignComplete",
        hitTint: "gold",
        lastFeedback: { ok: true, text: t().play.campaignDone },
        advancing: false,
      })
      void persist(progress, get().profile)
      void publishScore({ name: get().profile?.name ?? "Игрок", score: progress.xp, at: Date.now() })
      return
    }
    const next = GEO_CAMPAIGN[nextIndex]
    audio.play("transition")
    audio.play("zoom")
    const bonus = progress.difficulty === "hard" ? 0.75 : progress.difficulty === "easy" ? 1.35 : 1
    set({
      progress,
      campaignPhase: "transition",
      hitTint: "cyan",
      lastFeedback: { ok: true, text: t().play.levelDone },
      flyTo: level.nextFly ?? next.fly,
    })
    void persist(progress)
    window.setTimeout(() => {
      set({
        campaign: next,
        campaignPhase: "play",
        hitTint: null,
        selectedIso: null,
        highlightIso: null,
        lastFeedback: null,
        missionEndsAt: Date.now() + next.timeMs * bonus,
        flyTo: { ...next.fly },
        stage: "mission",
        advancing: false,
      })
    }, 900)
  },

  tickTimeout: () => {
    if (get().campaignPhase !== "play") return
    if (!get().campaign) return
    audio.play("fail")
    set({ campaignPhase: "timeout", hitTint: "orange", lastFeedback: { ok: false, text: t().play.timesUp } })
  },

  setLocalePref: (locale) => {
    setLocale(locale)
    const progress = { ...get().progress, locale }
    set({ progress })
    void persist(progress)
  },

  resetProgress: async () => {
    await window.geoQuest?.resetProgress()
    localStorage.removeItem("gq-progress")
    void cloudResetProgress()
    const progress = defaultProgress()
    set({
      progress,
      displayXp: 0,
      campaign: null,
      campaignPhase: "play",
      hitTint: null,
    })
    await persist(progress)
  },
}))
