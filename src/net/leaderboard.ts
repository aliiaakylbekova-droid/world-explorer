/**
 * Local leaderboard is the product today.
 * Later this module can talk to Supabase without changing screens:
 *   publishScore(row) -> insert
 *   fetchBoard() -> select
 * Do not simulate online players.
 */
import type { LeaderRow } from "../store/gameStore"

export type RemoteLeaderboard = {
  enabled: false
  provider: "supabase"
}

export const remoteLeaderboard: RemoteLeaderboard = {
  enabled: false,
  provider: "supabase",
}

export async function publishScore(row: LeaderRow): Promise<LeaderRow> {
  return row
}

export async function fetchRemoteBoard(): Promise<LeaderRow[] | null> {
  if (!remoteLeaderboard.enabled) return null
  return null
}
