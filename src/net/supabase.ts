import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/** Anon/public client only. service_role must never ship to the browser or Electron renderer. */
export function cloudConfig() {
  const url = String(import.meta.env.VITE_SUPABASE_URL ?? "").trim()
  const anon = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim()
  const ok = url.startsWith("https://") && anon.length > 20
  return { url, anon, ok }
}

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  const { url, anon, ok } = cloudConfig()
  if (!ok) return null
  if (!client) {
    client = createClient(url, anon, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  }
  return client
}

export function isCloudEnabled() {
  return cloudConfig().ok
}
