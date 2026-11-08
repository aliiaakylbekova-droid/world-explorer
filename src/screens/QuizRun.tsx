import { useEffect, useMemo, useRef, useState } from "react"
import { POINTS, TIMER_MS, type Difficulty, type QuizItem } from "../data/missions"
import { coinsFor, formatClock, xpFor } from "../game/logic"
import { useGame } from "../store/gameStore"
import { GoldButton, Panel } from "../ui/chrome"

type Props = {
  items: QuizItem[]
  timed: boolean
  difficulty: Difficulty
  onDone: (score: number, answers: number[]) => void
}

export function QuizRun({ items, timed, difficulty, onDone }: Props) {
  const award = useGame((s) => s.award)
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [left, setLeft] = useState(TIMER_MS[difficulty])
  const deadline = useRef<number | null>(null)
  const item = items[index]
  const finished = index >= items.length

  useEffect(() => {
    if (!timed || finished || picked !== null) return
    deadline.current = Date.now() + TIMER_MS[difficulty]
    setLeft(TIMER_MS[difficulty])
    const id = window.setInterval(() => {
      const remain = (deadline.current ?? 0) - Date.now()
      if (remain <= 0) {
        window.clearInterval(id)
        setLeft(0)
        setPicked(-1)
        return
      }
      setLeft(remain)
    }, 100)
    return () => window.clearInterval(id)
  }, [index, timed, difficulty, finished, picked])

  const letters = useMemo(() => ["А", "Б", "В", "Г"], [])

  if (!item || finished) {
    return (
      <Panel className="quiz-done">
        <p className="kicker">Результат</p>
        <h2>{score} очков</h2>
        <p>
          Верных: {answers.filter((a, i) => items[i] && a === items[i].correct).length} из {items.length}
        </p>
        <GoldButton onClick={() => onDone(score, answers)}>Готово</GoldButton>
      </Panel>
    )
  }

  const locked = picked !== null
  const correct = item.correct

  function choose(option: number) {
    if (locked) return
    setPicked(option)
    const ok = option === item.correct
    const gained = ok ? POINTS[difficulty] : 0
    setScore((s) => s + gained)
    award(xpFor(ok, difficulty), coinsFor(ok))
  }

  function advance() {
    const choice = picked === null ? -1 : picked
    const nextAnswers = [...answers, choice]
    setAnswers(nextAnswers)
    setPicked(null)
    if (index + 1 >= items.length) {
      setIndex(items.length)
      return
    }
    setIndex(index + 1)
  }

  return (
    <Panel className="quiz">
      <div className="quiz-meta">
        <span>
          {index + 1} / {items.length}
        </span>
        {timed ? <span className={left < 6000 ? "timer danger" : "timer"}>{formatClock(left)}</span> : <span>Без таймера</span>}
        <span>{score}</span>
      </div>
      <h3>{item.prompt}</h3>
      <div className="answers">
        {item.options.map((opt, i) => {
          let cls = "option"
          if (locked && i === correct) cls += " option-correct"
          else if (locked && i === picked && i !== correct) cls += " option-wrong"
          return (
            <button key={opt} type="button" className={cls} disabled={locked} onClick={() => choose(i)}>
              <span className="opt-letter">{letters[i]}</span>
              {opt}
            </button>
          )
        })}
      </div>
      {locked ? (
        <>
          <p className="explain">{item.explanation}</p>
          <GoldButton onClick={advance}>{index + 1 >= items.length ? "Результат" : "Далее"}</GoldButton>
        </>
      ) : null}
    </Panel>
  )
}
