import type { CampaignCheck, CampaignLevel } from "../data/campaign"
import type { StoryMission } from "../game/storyMissions"
import { getCatalog, pickNearestNamed } from "./catalog"

function wrapLng(d: number) {
  while (d > 180) d -= 360
  while (d < -180) d += 360
  return d
}

export function geoDist2(aLat: number, aLng: number, bLat: number, bLng: number) {
  const dlat = aLat - bLat
  const dlng = wrapLng(aLng - bLng)
  return dlat * dlat + dlng * dlng
}

export function continentOf(iso: string | null) {
  if (!iso) return null
  return getCatalog()?.byIso.get(iso)?.continent ?? null
}

export function countryNameOf(iso: string | null) {
  if (!iso) return null
  return getCatalog()?.byIso.get(iso)?.name ?? iso
}

export function checkObjective(check: CampaignCheck, hit: { iso: string | null; lat: number; lng: number }) {
  if (check.type === "continent") {
    return continentOf(hit.iso) === check.continent
  }
  if (check.type === "iso") {
    return hit.iso === check.iso
  }
  if (check.type === "point") {
    const near = geoDist2(hit.lat, hit.lng, check.lat, check.lng) <= check.radius * check.radius
    if (!near) return false
    if (check.iso && hit.iso && hit.iso !== check.iso) return false
    return true
  }
  if (check.type === "river") {
    const cat = getCatalog()
    const river = cat ? pickNearestNamed(cat.rivers, hit.lat, hit.lng, check.radius) : null
    const named = river && /nil|nile|нил/i.test(river.name)
    const near = geoDist2(hit.lat, hit.lng, check.lat, check.lng) <= check.radius * check.radius
    const isoOk = !hit.iso || check.isos.includes(hit.iso)
    return Boolean((named || near) && isoOk)
  }
  if (check.type === "range") {
    const near = geoDist2(hit.lat, hit.lng, check.lat, check.lng) <= check.radius * check.radius
    const isoOk = hit.iso ? check.isos.includes(hit.iso) : near
    return near && isoOk
  }
  return false
}

export function evaluateLevel(level: CampaignLevel, hit: { iso: string | null; lat: number; lng: number }) {
  return checkObjective(level.check, hit)
}

export function evaluateMission(mission: StoryMission, hit: { iso: string | null; lat: number; lng: number }) {
  if (mission.kind === "river" || mission.kind === "mountain" || mission.kind === "city" || mission.kind === "coords") {
    return geoDist2(mission.lat ?? 0, mission.lng ?? 0, hit.lat, hit.lng) < (mission.kind === "coords" ? 64 : 36)
  }
  if (mission.kind === "continent") {
    const rec = hit.iso ? getCatalog()?.byIso.get(hit.iso) : undefined
    return rec?.continent === "Asia" || rec?.continent === "Europe"
  }
  if (mission.kind === "flag" || mission.kind === "capital" || mission.kind === "neighbors" || mission.kind === "shape") {
    return Boolean(hit.iso && hit.iso === mission.targetIso)
  }
  return false
}
