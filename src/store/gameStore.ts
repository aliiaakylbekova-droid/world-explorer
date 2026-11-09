import { create } from "zustand"
import { LANDMARKS } from "../geo/catalog"
import type { StoryMission } from "../game/storyMissions"
import type { Locale } from "../i18n"
import { setLocale } from "../i18n"
import type { Layers } from "../three/EarthScene"
import type { Profile } from "../types/electron"

export type Stage = "register" | "explore" | "discover" | "mission" | "flag" | "journal" | "settings"
export type IntroPhase = "card" | "approach" | "ready"

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
  locale: Locale
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
  locale: "ru",
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
  setLocalePref: (locale: Locale) => void
  resetProgress: () => Promise<void>
}

async function persist(progress: Progress) {
  if (window.geoQuest) await window.geoQuest.saveProgress(progress)
  else localStorage.setItem("gq-progress", JSON.stringify(progress))
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
      const progress = saved ? { ...defaultProgress(), ...saved } : defaultProgress()
      setLocale(progress.locale)
      set({
        profile,
        progress,
        ready: true,
        stage: profile ? "explore" : "register",
        introPhase: profile ? "approach" : "card",
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
    await persist(progress)
    set({ profile, progress, stage: "explore", introPhase: "approach" })
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
    const visited =
      hit.iso && !get().progress.visited.includes(hit.iso) ? [...get().progress.visited, hit.iso] : get().progress.visited
    const progress = { ...get().progress, visited }
    set({
      selectedIso: hit.iso,
      lastHit: hit,
      progress,
      flyTo: hit.iso ? { lat: hit.lat, lng: hit.lng, dist: 3.85 } : { lat: 18, lng: 20, dist: 6.5 },
    })
    void persist(progress)
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
    const progress = { ...get().progress, volume: v }
    set({ progress })
    void persist(progress)
  },

  setLocalePref: (locale) => {
    setLocale(locale)
    const progress = { ...get().progress, locale }
    set({ progress })
    void persist(progress)
  },

  resetProgress: async () => {
    await window.geoQuest?.resetProgress()
    const progress = defaultProgress()
    set({ progress })
    await persist(progress)
  },
}))
