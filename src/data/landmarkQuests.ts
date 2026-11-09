export type LandmarkSceneId = "eiffel" | "burana" | "giza" | "tian-shan"

export type LandmarkQuest = {
  id: string
  scene: LandmarkSceneId
  title: string
  speaker: string
  spoken: string
  prompt: string
  hint: string
  answer: number
  unit: string
  tolerance: number
  xp: number
  fact: string
  next: string | null
}

export const LANDMARK_QUESTS: LandmarkQuest[] = [
  {
    id: "eiffel",
    scene: "eiffel",
    title: "Eiffel Tower",
    speaker: "Camille",
    spoken: "Welcome to Paris! I am at the top of the tower. Guess its height in metres.",
    prompt: "How tall is the Eiffel Tower, in metres?",
    hint: "With the antenna, a little more than 300 m. Built in 1889.",
    answer: 324,
    unit: "m",
    tolerance: 8,
    xp: 160,
    fact: "324 m with the antenna. The iron lattice lets the wind pass through.",
    next: "burana",
  },
  {
    id: "burana",
    scene: "burana",
    title: "Burana Tower",
    speaker: "Aigul",
    spoken: "This minaret is all that remains of Balasagun. Guess the height that still stands.",
    prompt: "How tall is the remaining Burana minaret, in metres?",
    hint: "Once about 45 m. Earthquakes left a shorter tower — around 25 m.",
    answer: 25,
    unit: "m",
    tolerance: 4,
    xp: 140,
    fact: "Burana stands near Tokmok. The 11th-century minaret of Balasagun is about 24.6 m today.",
    next: "giza",
  },
  {
    id: "giza",
    scene: "giza",
    title: "Great Pyramid",
    speaker: "Nour",
    spoken: "From the plateau of Giza I ask: what was the original height of Khufu’s pyramid?",
    prompt: "Original height of the Great Pyramid of Giza, in metres?",
    hint: "Almost 150 m when new. The capstone is gone, so it is shorter now.",
    answer: 146,
    unit: "m",
    tolerance: 8,
    xp: 180,
    fact: "About 146.6 m originally, now ~138.5 m. The last surviving ancient Wonder.",
    next: null,
  },
]

export function questById(id: string) {
  return LANDMARK_QUESTS.find((q) => q.id === id) ?? null
}
