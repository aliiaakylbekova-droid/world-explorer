export type Op = "+" | "−" | "×" | "÷"

export type Problem = {
  left: number
  right: number
  op: Op
  answer: number
  text: string
  key: string
}

const OPS: readonly Op[] = ["+", "−", "×", "÷"]

type Band = {
  addA: [number, number]
  addB: [number, number]
  subA: [number, number]
  subB: number
  mulA: [number, number]
  mulB: [number, number]
  divD: [number, number]
  divQ: [number, number]
}

const BANDS: readonly Band[] = [
  {
    addA: [24, 99],
    addB: [12, 99],
    subA: [40, 180],
    subB: 8,
    mulA: [4, 14],
    mulB: [3, 12],
    divD: [3, 12],
    divQ: [4, 12],
  },
  {
    addA: [48, 240],
    addB: [15, 170],
    subA: [90, 460],
    subB: 12,
    mulA: [6, 24],
    mulB: [3, 12],
    divD: [4, 16],
    divQ: [6, 18],
  },
  {
    addA: [80, 520],
    addB: [24, 280],
    subA: [160, 820],
    subB: 20,
    mulA: [10, 64],
    mulB: [3, 14],
    divD: [6, 24],
    divQ: [8, 28],
  },
  {
    addA: [120, 900],
    addB: [40, 540],
    subA: [240, 1200],
    subB: 30,
    mulA: [16, 180],
    mulB: [2, 12],
    divD: [8, 36],
    divQ: [8, 40],
  },
]

function rand(min: number, max: number): number {
  const low = Math.ceil(Math.min(min, max))
  const high = Math.floor(Math.max(min, max))
  return low + Math.floor(Math.random() * (high - low + 1))
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

export function levelForSolved(solved: number): number {
  if (solved < 2) return 0
  if (solved < 5) return 1
  if (solved < 9) return 2
  return 3
}

function pack(left: number, right: number, op: Op, answer: number): Problem {
  return {
    left,
    right,
    op,
    answer,
    text: `${left} ${op} ${right}`,
    key: `${left}${op}${right}`,
  }
}

function valid(problem: Problem): boolean {
  if (!Number.isInteger(problem.answer) || problem.answer < 0) return false
  if (!Number.isInteger(problem.left) || !Number.isInteger(problem.right)) return false
  if (problem.op === "+") return problem.left + problem.right === problem.answer
  if (problem.op === "−") return problem.left >= problem.right && problem.left - problem.right === problem.answer
  if (problem.op === "×") return problem.left * problem.right === problem.answer
  return problem.right > 0 && problem.left % problem.right === 0 && problem.left / problem.right === problem.answer
}

function build(level: number, op: Op): Problem {
  const band = BANDS[Math.min(BANDS.length - 1, Math.max(0, level))]!
  if (op === "+") {
    const left = rand(band.addA[0], band.addA[1])
    const right = rand(band.addB[0], band.addB[1])
    return pack(left, right, op, left + right)
  }
  if (op === "−") {
    const left = rand(band.subA[0], band.subA[1])
    const high = Math.max(1, left - 1)
    const low = Math.min(Math.max(1, band.subB), high)
    const right = rand(low, high)
    return pack(left, right, op, left - right)
  }
  if (op === "×") {
    const left = rand(band.mulA[0], band.mulA[1])
    const right = rand(band.mulB[0], band.mulB[1])
    return pack(left, right, op, left * right)
  }
  const divisor = rand(band.divD[0], band.divD[1])
  const quotient = rand(band.divQ[0], band.divQ[1])
  return pack(divisor * quotient, divisor, op, quotient)
}

export function createProblemSource() {
  let bag: Op[] = []
  let lastKey: string | null = null

  function take(solved: number): Problem {
    const level = levelForSolved(solved)
    for (let attempt = 0; attempt < 48; attempt += 1) {
      if (bag.length === 0) bag = shuffle(OPS)
      const op = bag[bag.length - 1]!
      const problem = build(level, op)
      if (problem.key !== lastKey && valid(problem)) {
        bag.pop()
        lastKey = problem.key
        return problem
      }
      bag = []
    }
    const fallback = build(level, "+")
    if (fallback.key === lastKey) {
      const left = fallback.left + 1
      const answer = left + fallback.right
      const problem = pack(left, fallback.right, "+", answer)
      lastKey = problem.key
      return problem
    }
    lastKey = fallback.key
    return fallback
  }

  return {
    next(solved: number) {
      return take(solved)
    },
    reset() {
      bag = []
      lastKey = null
    },
  }
}
