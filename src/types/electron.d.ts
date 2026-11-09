export type Profile = {
  name: string
  avatar: string
  createdAt: number
}

export type GeoQuestApi = {
  getProfile: () => Promise<Profile | null>
  saveProfile: (profile: Profile) => Promise<{ ok: boolean; profile?: Profile }>
  getProgress: () => Promise<unknown>
  saveProgress: (progress: unknown) => Promise<{ ok: boolean }>
  resetProgress: () => Promise<{ ok: boolean }>
}

declare global {
  interface Window {
    geoQuest?: GeoQuestApi
    geoQuestDebug?: {
      fly: (lat: number, lng: number, dist?: number) => void
      stage: (s: "register" | "explore" | "discover" | "mission" | "flag" | "journal" | "settings") => void
      landmark: (id: string) => void
      pick: (iso: string | null, lat: number, lng: number) => void
      flag: () => void
      continue: () => void
      retry: () => void
      campaign: (index?: number) => void
    }
  }
}

export {}
