import type { Profile } from "../types/electron"
import type { Progress } from "../store/gameStore"
import { getSupabase, isCloudEnabled } from "./supabase"

async function ensureUser() {
  const sb = getSupabase()
  if (!sb) return null
  const { data } = await sb.auth.getSession()
  if (data.session?.user) return data.session.user
  const { data: signed, error } = await sb.auth.signInAnonymously()
  if (error || !signed.user) return null
  return signed.user
}

function progressRow(userId: string, progress: Progress) {
  return {
    user_id: userId,
    xp: progress.xp,
    coins: progress.coins,
    achievements: progress.achievements,
    stamps: progress.stamps,
    visited: progress.visited,
    missions_done: progress.missionsDone,
    journal: progress.journal,
    difficulty: progress.difficulty,
    volume: progress.volume,
    music_on: progress.musicOn,
    sfx_on: progress.sfxOn,
    music_vol: progress.musicVol,
    sfx_vol: progress.sfxVol,
    locale: progress.locale,
    campaign_index: progress.campaignIndex,
    campaign_done: progress.campaignDone,
    updated_at: new Date().toISOString(),
  }
}

function progressFromRow(row: Record<string, unknown>): Progress {
  return {
    xp: Number(row.xp) || 0,
    coins: Number(row.coins) || 0,
    achievements: Array.isArray(row.achievements) ? (row.achievements as string[]) : [],
    stamps: Array.isArray(row.stamps) ? (row.stamps as string[]) : [],
    visited: Array.isArray(row.visited) ? (row.visited as string[]) : [],
    missionsDone: Array.isArray(row.missions_done) ? (row.missions_done as string[]) : [],
    journal: Array.isArray(row.journal) ? (row.journal as Progress["journal"]) : [],
    difficulty: (row.difficulty as Progress["difficulty"]) || "medium",
    volume: Number(row.volume) || 0.7,
    musicOn: row.music_on !== false,
    sfxOn: row.sfx_on !== false,
    musicVol: Number(row.music_vol) || 0.32,
    sfxVol: Number(row.sfx_vol) || 0.7,
    locale: row.locale === "en" ? "en" : "ru",
    campaignIndex: Number(row.campaign_index) || 0,
    campaignDone: Array.isArray(row.campaign_done) ? (row.campaign_done as string[]) : [],
  }
}

export async function cloudPull(): Promise<{ profile: Profile | null; progress: Progress | null }> {
  if (!isCloudEnabled()) return { profile: null, progress: null }
  try {
    const sb = getSupabase()
    if (!sb) return { profile: null, progress: null }
    const user = await ensureUser()
    if (!user) return { profile: null, progress: null }
    const [{ data: profile }, { data: progress }] = await Promise.all([
      sb.from("profiles").select("name, avatar, created_at").eq("id", user.id).maybeSingle(),
      sb.from("progress").select("*").eq("user_id", user.id).maybeSingle(),
    ])
    return {
      profile: profile
        ? { name: String(profile.name), avatar: String(profile.avatar ?? "ocean"), createdAt: new Date(profile.created_at).getTime() }
        : null,
      progress: progress ? progressFromRow(progress as Record<string, unknown>) : null,
    }
  } catch {
    return { profile: null, progress: null }
  }
}

export async function cloudPush(profile: Profile | null, progress: Progress | null) {
  if (!isCloudEnabled()) return
  try {
    const sb = getSupabase()
    if (!sb) return
    const user = await ensureUser()
    if (!user) return
    if (profile) {
      await sb.from("profiles").upsert({
        id: user.id,
        name: profile.name,
        avatar: profile.avatar,
        created_at: new Date(profile.createdAt).toISOString(),
      })
    }
    if (progress) {
      await sb.from("progress").upsert(progressRow(user.id, progress))
    }
  } catch {
    /* local save already succeeded */
  }
}

export async function cloudResetProgress() {
  if (!isCloudEnabled()) return
  try {
    const sb = getSupabase()
    const user = await ensureUser()
    if (!sb || !user) return
    await sb.from("progress").delete().eq("user_id", user.id)
  } catch {
    /* ignore */
  }
}
