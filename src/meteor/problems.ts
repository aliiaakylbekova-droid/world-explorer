import type { Difficulty } from "./types.ts"

export type Equation = {
  left: string
  op: string
  right: string
  answer: number
}

function rand(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function easy(): Equation {
  if (Math.random() < 0.55) {
    const a = rand(1, 12)
    const b = rand(1, 12)
    return { left: String(a), op: "+", right: String(b), answer: a + b }
  }
  const a = rand(6, 18)
  const b = rand(1, a - 1)
  return { left: String(a), op: "−", right: String(b), answer: a - b }
}

function medium(): Equation {
  const roll = rand(0, 2)
  if (roll === 0) {
    const a = rand(8, 40)
    const b = rand(6, 35)
    return { left: String(a), op: "+", right: String(b), answer: a + b }
  }
  if (roll === 1) {
    const a = rand(18, 70)
    const b = rand(4, a - 1)
    return { left: String(a), op: "−", right: String(b), answer: a - b }
  }
  const a = rand(2, 10)
  const b = rand(2, 10)
  return { left: String(a), op: "×", right: String(b), answer: a * b }
}

function hard(): Equation {
  const roll = rand(0, 3)
  if (roll === 0) {
    const a = rand(28, 96)
    const b = rand(17, 84)
    return { left: String(a), op: "+", right: String(b), answer: a + b }
  }
  if (roll === 1) {
    const a = rand(42, 140)
    const b = rand(13, a - 1)
    return { left: String(a), op: "−", right: String(b), answer: a - b }
  }
  if (roll === 2) {
    const a = rand(6, 16)
    const b = rand(4, 12)
    return { left: String(a), op: "×", right: String(b), answer: a * b }
  }
  const divisor = rand(2, 12)
  const quotient = rand(3, 15)
  return {
    left: String(divisor * quotient),
    op: "÷",
    right: String(divisor),
    answer: quotient,
  }
}

export function generateEquation(difficulty: Difficulty): Equation {
  if (difficulty === "easy") return easy()
  if (difficulty === "medium") return medium()
  return hard()
}
