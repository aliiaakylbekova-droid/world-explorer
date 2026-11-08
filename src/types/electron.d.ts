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
  }
}

export {}
