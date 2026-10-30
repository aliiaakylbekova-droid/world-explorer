import type { Difficulty } from "./types.ts"

export type Equation = {
  left: string
  op: string
  right: string
  answer: number
}

const OPS = ["+", "−", "×", "÷"] as const
type Op = (typeof OPS)[number]

const RECENT_LIMIT = 12

function rand(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    const current = copy[index]!
    copy[index] = copy[swap]!
    copy[swap] = current
  }
  return copy
}

function addition(minA: number, maxA: number, minB: number, maxB: number): Equation {
  const a = rand(minA, maxA)
  const b = rand(minB, maxB)
  return { left: String(a), op: "+", right: String(b), answer: a + b }
}

function subtraction(minA: number, maxA: number, minB: number): Equation {
  const a = rand(minA, maxA)
  const b = rand(Math.min(minB, a), a)
  return { left: String(a), op: "−", right: String(b), answer: a - b }
}

function multiplication(minA: number, maxA: number, minB: number, maxB: number): Equation {
  const a = rand(minA, maxA)
  const b = rand(minB, maxB)
  return { left: String(a), op: "×", right: String(b), answer: a * b }
}

function division(divMin: number, divMax: number, quotMin: number, quotMax: number): Equation {
  const divisor = rand(divMin, divMax)
  const quotient = rand(quotMin, quotMax)
  return {
    left: String(divisor * quotient),
    op: "÷",
    right: String(divisor),
    answer: quotient,
  }
}

function build(difficulty: Difficulty, op: Op): Equation {
  if (difficulty === "easy") {
    if (op === "+") return addition(2, 20, 2, 18)
    if (op === "−") return subtraction(6, 24, 1)
    if (op === "×") return multiplication(2, 9, 2, 9)
    return division(2, 9, 2, 9)
  }
  if (difficulty === "medium") {
    if (op === "+") return addition(24, 240, 12, 160)
    if (op === "−") return subtraction(48, 320, 12)
    if (op === "×") return multiplication(6, 18, 3, 12)
    return division(4, 16, 6, 24)
  }
  if (op === "+") return addition(120, 860, 80, 640)
  if (op === "−") return subtraction(220, 980, 40)
  if (op === "×") return multiplication(12, 36, 8, 24)
  return division(8, 28, 12, 36)
}

export function createProblemSource() {
  let bag: Op[] = []
  const recent: string[] = []

  function take(difficulty: Difficulty): Equation {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      if (bag.length === 0) bag = shuffle(OPS)
      const op = bag[bag.length - 1]!
      const equation = build(difficulty, op)
      const key = `${equation.left}${equation.op}${equation.right}`
      if (!recent.includes(key)) {
        bag.pop()
        recent.push(key)
        if (recent.length > RECENT_LIMIT) recent.shift()
        return equation
      }
      bag = shuffle(OPS)
    }
    recent.length = 0
    bag = shuffle(OPS)
    const op = bag.pop() ?? "+"
    const equation = build(difficulty, op)
    recent.push(`${equation.left}${equation.op}${equation.right}`)
    return equation
  }

  return {
    next(difficulty: Difficulty) {
      return take(difficulty)
    },
    reset() {
      bag = []
      recent.length = 0
    },
  }
}
