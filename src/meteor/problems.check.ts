import { createProblemSource, levelForSolved, type Op, type Problem } from "./problems.ts"

const OPS = new Set<Op>(["+", "−", "×", "÷"])

function assertProblem(problem: Problem) {
  if (!OPS.has(problem.op)) throw new Error(`bad op ${problem.op}`)
  if (!Number.isInteger(problem.answer) || problem.answer < 0) {
    throw new Error(`non integer answer ${problem.text} = ${problem.answer}`)
  }
  if (problem.op === "+") {
    if (problem.left + problem.right !== problem.answer) throw new Error(problem.text)
  } else if (problem.op === "−") {
    if (problem.left < problem.right || problem.left - problem.right !== problem.answer) {
      throw new Error(`negative or mismatch ${problem.text}`)
    }
  } else if (problem.op === "×") {
    if (problem.left * problem.right !== problem.answer) throw new Error(problem.text)
  } else if (problem.right === 0 || problem.left % problem.right !== 0 || problem.left / problem.right !== problem.answer) {
    throw new Error(`fractional division ${problem.text}`)
  }
  if (problem.text !== `${problem.left} ${problem.op} ${problem.right}`) throw new Error("text mismatch")
  if (problem.key !== `${problem.left}${problem.op}${problem.right}`) throw new Error("key mismatch")
}

function run() {
  if (levelForSolved(0) !== 0 || levelForSolved(1) !== 0) throw new Error("level 0")
  if (levelForSolved(2) !== 1 || levelForSolved(4) !== 1) throw new Error("level 1")
  if (levelForSolved(5) !== 2 || levelForSolved(8) !== 2) throw new Error("level 2")
  if (levelForSolved(9) !== 3 || levelForSolved(40) !== 3) throw new Error("level 3")

  for (const solved of [0, 2, 5, 9, 20]) {
    const source = createProblemSource()
    const seen = new Set<Op>()
    let previous = ""
    for (let index = 0; index < 80; index += 1) {
      const problem = source.next(solved)
      assertProblem(problem)
      if (problem.key === previous) throw new Error(`repeat ${problem.key}`)
      previous = problem.key
      seen.add(problem.op)
    }
    if (seen.size !== 4) throw new Error(`ops missing at solved ${solved}: ${[...seen].join(",")}`)
  }
  console.log("problem checks passed")
}

run()
