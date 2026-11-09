export type CampaignCheck =
  | { type: "continent"; continent: string }
  | { type: "iso"; iso: string }
  | { type: "point"; lat: number; lng: number; radius: number; iso?: string }
  | { type: "river"; lat: number; lng: number; radius: number; isos: string[] }
  | { type: "range"; lat: number; lng: number; radius: number; isos: string[] }

export type CampaignLevel = {
  id: string
  number: number
  title: string
  goal: string
  instruction: string
  hint: string
  success: string
  fact: string
  timeMs: number
  reward: number
  check: CampaignCheck
  fly: { lat: number; lng: number; dist: number }
  nextFly?: { lat: number; lng: number; dist: number }
}

export const GEO_CAMPAIGN: CampaignLevel[] = [
  {
    id: "l1-asia",
    number: 1,
    title: "Asia",
    goal: "Find the continent of Asia on the globe.",
    instruction: "Click any country that belongs to Asia. Ocean clicks and other continents do not count.",
    hint: "The largest continent. East of the Ural, from Arabia to Japan — not Africa, not Europe-only.",
    success: "Asia is the largest continent — home to Kyrgyzstan, China, India, and more.",
    fact: "Asia holds more than half of humanity and stretches from the Bosporus to the Pacific.",
    timeMs: 75_000,
    reward: 120,
    check: { type: "continent", continent: "Asia" },
    fly: { lat: 28, lng: 88, dist: 7.15 },
    nextFly: { lat: 41.3, lng: 74.6, dist: 5.35 },
  },
  {
    id: "l2-kyrgyzstan",
    number: 2,
    title: "Kyrgyzstan",
    goal: "Find Kyrgyzstan in Central Asia.",
    instruction: "Click the country of Kyrgyzstan. Neighbours Kazakhstan, China, Uzbekistan, and Tajikistan are close — but they are not the answer.",
    hint: "A compact mountain republic south of Kazakhstan, west of China. Capital: Bishkek.",
    success: "Kyrgyzstan — the land of mountains, yurts, and Issyk-Kul.",
    fact: "More than 90% of Kyrgyzstan is mountains. The Tian Shan frames the country.",
    timeMs: 70_000,
    reward: 140,
    check: { type: "iso", iso: "KG" },
    fly: { lat: 41.3, lng: 74.6, dist: 5.2 },
    nextFly: { lat: 46.6, lng: 2.4, dist: 5.4 },
  },
  {
    id: "l3-france",
    number: 3,
    title: "France",
    goal: "Find France in Western Europe.",
    instruction: "Click France. Spain, Germany, Italy, and the UK are nearby distractors.",
    hint: "Hexagon of Western Europe, Atlantic to the west, Mediterranean to the south. Capital: Paris.",
    success: "France — from the Alps to the Atlantic, with Paris on the Seine.",
    fact: "France sits at the crossroads of Western Europe and gave the world the metre and Greenwich’s rival meridian of Paris.",
    timeMs: 65_000,
    reward: 150,
    check: { type: "iso", iso: "FR" },
    fly: { lat: 46.6, lng: 2.4, dist: 5.15 },
    nextFly: { lat: 26.8, lng: 30.8, dist: 5.35 },
  },
  {
    id: "l4-egypt-capital",
    number: 4,
    title: "Egypt · Capital",
    goal: "Find the country of Cairo — the capital of Egypt.",
    instruction: "Click Egypt on the globe. Cairo sits on the Nile in the north-east of Africa.",
    hint: "North-east Africa, where the Nile meets the Mediterranean. Not Saudi Arabia, not Sudan.",
    success: "Cairo is the capital of Egypt, on the Nile just south of the Delta.",
    fact: "Cairo is Africa’s largest city and the gateway to Giza’s pyramids.",
    timeMs: 70_000,
    reward: 160,
    check: { type: "iso", iso: "EG" },
    fly: { lat: 26.8, lng: 30.8, dist: 5.05 },
    nextFly: { lat: 15.6, lng: 32.6, dist: 5.5 },
  },
  {
    id: "l5-nile",
    number: 5,
    title: "Nile",
    goal: "Find the Nile valley.",
    instruction: "Click along the Nile in Egypt or Sudan — the long river that runs south → north into the Mediterranean.",
    hint: "A thin green ribbon through the Sahara. Click Egypt or Sudan near 15–30°N, ~32°E.",
    success: "The Nile is the great river of Africa. Egypt is the gift of the Nile.",
    fact: "The Nile flows north from the equatorial lakes and the Blue Nile of Ethiopia to the Delta at Cairo.",
    timeMs: 80_000,
    reward: 180,
    check: { type: "river", lat: 18.5, lng: 32.4, radius: 9.5, isos: ["EG", "SD", "SS", "ET", "UG"] },
    fly: { lat: 15.6, lng: 32.6, dist: 5.45 },
    nextFly: { lat: 42.1, lng: 78.2, dist: 4.7 },
  },
  {
    id: "l6-tian-shan",
    number: 6,
    title: "Tian Shan",
    goal: "Find the Tian Shan mountains.",
    instruction: "Click the Tian Shan — the ranges of Kyrgyzstan and the China border, not the Himalaya.",
    hint: "North of the Himalaya, around 42°N 78°E. Kyrgyzstan / western China / south-east Kazakhstan.",
    success: "Tian Shan — the Celestial Mountains. Peak Pobeda stands on the Kyrgyz–China border.",
    fact: "The Tian Shan is a separate system from the Himalaya. Issyk-Kul lies in its northern basin.",
    timeMs: 75_000,
    reward: 190,
    check: { type: "range", lat: 42.0, lng: 78.5, radius: 5.5, isos: ["KG", "KZ", "CN"] },
    fly: { lat: 42.1, lng: 78.2, dist: 4.55 },
    nextFly: { lat: 42.45, lng: 77.25, dist: 3.85 },
  },
  {
    id: "l7-issyk-kul",
    number: 7,
    title: "Issyk-Kul · Coordinates",
    goal: "Find Issyk-Kul by coordinates 42.45°N, 77.25°E.",
    instruction: "Click the lake basin east of Bishkek, inside Kyrgyzstan. Precision matters — not every mountain click is enough.",
    hint: "East of Bishkek, north of the Tian Shan spine. About 42.4°N 77.2°E.",
    success: "Issyk-Kul — a high saline lake that almost never freezes.",
    fact: "Issyk-Kul sits at 1,609 m. Depth to 668 m. Silk Road caravans passed its shores.",
    timeMs: 80_000,
    reward: 220,
    check: { type: "point", lat: 42.45, lng: 77.25, radius: 2.35, iso: "KG" },
    fly: { lat: 42.45, lng: 77.25, dist: 3.7 },
  },
]

export function campaignById(id: string) {
  return GEO_CAMPAIGN.find((l) => l.id === id) ?? null
}
