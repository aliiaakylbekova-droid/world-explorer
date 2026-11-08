export function formatClock(ms: number): string {
  const safe = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(safe / 60)
  const rest = safe % 60
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
}

export function xpFor(correct: boolean, difficulty: "easy" | "medium" | "hard") {
  if (!correct) return 8
  if (difficulty === "hard") return 40
  if (difficulty === "medium") return 28
  return 18
}

export function coinsFor(correct: boolean) {
  return correct ? 12 : 2
}
