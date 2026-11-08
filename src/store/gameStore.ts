import { create } from "zustand"
import { ACHIEVEMENTS } from "../data/achievements"
import type { ContinentId } from "../data/world"
import type { Difficulty, MissionType } from "../data/missions"
import type { Locale } from "../i18n"
import { setLocale } from "../i18n"
import type { Profile } from "../types/electron"

export type Screen =
  | "boot"
  | "register"
  | "menu"
  | "explorer"
  | "country"
  | "mission"
  | "challenge"
  | "campaign"
  | "campaign-country"
  | "training"
  | "collection"
  | "settings"

export type LeaderRow = {
  name: string
  score: number
  at: number
}

export type Progress = {
  xp: number
  coins: number
  achievements: string[]
  stamps: string[]
  visited: string[]
  campaignDone: string[]
  campaignAnswers: Record<string, number[]>
  leaderboard: LeaderRow[]
  difficulty: Difficulty
  volume: number
  locale: Locale
}

const defaultProgress = (): Progress => ({
  xp: 0,
  coins: 0,
  achievements: [],
  stamps: [],
  visited: [],
  campaignDone: [],
  campaignAnswers: {},
  leaderboard: [],
  difficulty: "medium",
  volume: 0.7,
  locale: "ru",
})

type GameState = {
  screen: Screen
  ready: boolean
  profile: Profile | null
  progress: Progress
  continent: ContinentId
  countryId: string | null
  landmarkId: string | null
  missionType: MissionType
  go: (screen: Screen) => void
  hydrate: () => Promise<void>
  register: (name: string, avatar: string) => Promise<void>
  setContinent: (id: ContinentId) => void
  openCountry: (id: string) => void
  selectCountry: (id: string) => void
  setLandmark: (id: string) => void
  setMissionType: (type: MissionType) => void
  award: (xp: number, coins: number) => void
  collectStamp: (id: string) => void
  visit: (countryId: string) => void
  unlock: (id: string) => void
  addScore: (score: number) => void
  markCampaign: (countryId: string, answers: number[]) => void
  setDifficulty: (d: Difficulty) => void
  setVolume: (v: number) => void
  setLocalePref: (locale: Locale) => void
  resetProgress: () => Promise<void>
}

async function persist(progress: Progress) {
  if (window.geoQuest) {
    await window.geoQuest.saveProgress(progress)
    return
  }
  localStorage.setItem("gq-progress", JSON.stringify(progress))
}

function grant(progress: Progress, id: string) {
  if (progress.achievements.includes(id)) return progress
  return { ...progress, achievements: [...progress.achievements, id], coins: progress.coins + 25 }
}

export const useGame = create<GameState>((set, get) => ({
  screen: "boot",
  ready: false,
  profile: null,
  progress: defaultProgress(),
  continent: "asia",
  countryId: null,
  landmarkId: null,
  missionType: "capitals",

  go: (screen) => {
    const extra: Partial<GameState> = { screen }
    if (screen === "explorer") {
      const next = grant(get().progress, "globe-spin")
      extra.progress = next
      void persist(next)
    }
    set(extra)
  },

  hydrate: async () => {
    try {
      const api = window.geoQuest
      const withTime = async <T>(job: Promise<T> | undefined): Promise<T | null> => {
        if (!job) return null
        return await Promise.race([
          job,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
        ])
      }
      const profile =
        (await withTime(api?.getProfile())) ??
        (localStorage.getItem("gq-profile") ? (JSON.parse(localStorage.getItem("gq-profile")!) as Profile) : null)
      const saved =
        ((await withTime(api?.getProgress() as Promise<Progress | null> | undefined)) as Progress | null) ??
        (localStorage.getItem("gq-progress") ? (JSON.parse(localStorage.getItem("gq-progress")!) as Progress) : null)
      const progress = saved ? { ...defaultProgress(), ...saved } : defaultProgress()
      setLocale(progress.locale)
      set({
        profile,
        progress,
        ready: true,
        screen: profile ? "menu" : "register",
      })
    } catch (error) {
      console.error(error)
      set({ ready: true, screen: "register", progress: defaultProgress() })
    }
  },

  register: async (name, avatar) => {
    const profile: Profile = { name: name.trim().slice(0, 40), avatar, createdAt: Date.now() }
    if (window.geoQuest) await window.geoQuest.saveProfile(profile)
    else localStorage.setItem("gq-profile", JSON.stringify(profile))
    let progress = grant(get().progress, "first-step")
    await persist(progress)
    set({ profile, progress, screen: "menu" })
  },

  setContinent: (id) => set({ continent: id }),

  selectCountry: (id) => {
    get().visit(id)
    set({ countryId: id })
  },

  openCountry: (id) => {
    get().selectCountry(id)
    set({ screen: "country" })
  },

  setLandmark: (id) => set({ landmarkId: id }),

  setMissionType: (type) => set({ missionType: type }),

  award: (xp, coins) => {
    let progress = {
      ...get().progress,
      xp: get().progress.xp + xp,
      coins: get().progress.coins + coins,
    }
    if (progress.xp >= 500) progress = grant(progress, "xp-500")
    if (progress.xp >= 1500) progress = grant(progress, "xp-1500")
    set({ progress })
    void persist(progress)
  },

  collectStamp: (id) => {
    const current = get().progress
    if (current.stamps.includes(id)) return
    let progress = { ...current, stamps: [...current.stamps, id], coins: current.coins + 8 }
    if (progress.stamps.length >= 8) progress = grant(progress, "collector")
    set({ progress })
    void persist(progress)
  },

  visit: (countryId) => {
    const current = get().progress
    if (current.visited.includes(countryId)) return
    const progress = { ...current, visited: [...current.visited, countryId] }
    set({ progress })
    void persist(progress)
  },

  unlock: (id) => {
    const progress = grant(get().progress, id)
    set({ progress })
    void persist(progress)
  },

  addScore: (score) => {
    const name = get().profile?.name ?? "Игрок"
    const row: LeaderRow = { name, score, at: Date.now() }
    const leaderboard = [...get().progress.leaderboard, row].sort((a, b) => b.score - a.score).slice(0, 12)
    let progress = grant({ ...get().progress, leaderboard }, "challenge")
    set({ progress })
    void persist(progress)
  },

  markCampaign: (countryId, answers) => {
    const current = get().progress
    const campaignAnswers = { ...current.campaignAnswers, [countryId]: answers }
    const done = new Set(current.campaignDone)
    if (answers.length > 0) done.add(countryId)
    let progress: Progress = {
      ...current,
      campaignAnswers,
      campaignDone: [...done],
    }
    if (progress.campaignDone.length >= 5) progress = grant(progress, "silk-road")
    set({ progress })
    void persist(progress)
  },

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

export { ACHIEVEMENTS }
