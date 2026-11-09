/**
 * Leaderboard: localStorage always. Supabase when VITE_SUPABASE_* are set.
 * Fields match LeaderRow — no extra tables.
 */
import { getSupabase, isCloudEnabled } from "./supabase"

export type LeaderRow = { name: string; score: number; at: number }

const LOCAL_KEY = "gq-leaderboard"

function readLocal(): LeaderRow[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    const parsed = raw ? (JSON.parse(raw) as LeaderRow[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocal(rows: LeaderRow[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(rows.slice(0, 50)))
}

export function remoteLeaderboard() {
  return { enabled: isCloudEnabled(), provider: "supabase" as const }
}

export async function publishScore(row: LeaderRow): Promise<LeaderRow> {
  const local = [row, ...readLocal()].sort((a, b) => b.score - a.score).slice(0, 50)
  writeLocal(local)
  if (!isCloudEnabled()) return row
  try {
    const sb = getSupabase()
    if (!sb) return row
    const { data: session } = await sb.auth.getSession()
    await sb.from("leaderboard").insert({
      user_id: session.session?.user.id ?? null,
      name: row.name.slice(0, 40),
      score: row.score,
      at: new Date(row.at).toISOString(),
    })
  } catch {
    /* local row kept */
  }
  return row
}

export async function fetchRemoteBoard(): Promise<LeaderRow[] | null> {
  if (!isCloudEnabled()) return readLocal()
  try {
    const sb = getSupabase()
    if (!sb) return readLocal()
    const { data, error } = await sb.from("leaderboard").select("name, score, at").order("score", { ascending: false }).limit(50)
    if (error || !data) return readLocal()
    return data.map((r) => ({
      name: String(r.name),
      score: Number(r.score) || 0,
      at: r.at ? new Date(r.at).getTime() : Date.now(),
    }))
  } catch {
    return readLocal()
  }
}
