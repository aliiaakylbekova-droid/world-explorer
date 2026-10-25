import { COUNT_OPTIONS, TIME_OPTIONS, type Difficulty, type ProblemCount, type Settings, type TimeLimit } from "./types.ts"

const DIFFICULTIES: { id: Difficulty; title: string; text: string }[] = [
  { id: "easy", title: "Лёгкий", text: "Небольшие числа, все четыре действия" },
  { id: "medium", title: "Средний", text: "Двузначные и трёхзначные числа" },
  { id: "hard", title: "Сложный", text: "Крупные числа, считать сложнее" },
]

export function MenuScreen({
  settings,
  onTime,
  onDifficulty,
  onCount,
  onStart,
  onOpenExplorer,
}: {
  settings: Settings
  onTime: (time: TimeLimit) => void
  onDifficulty: (difficulty: Difficulty) => void
  onCount: (count: ProblemCount) => void
  onStart: () => void
  onOpenExplorer: () => void
}) {
  return (
    <div className="mm-overlay">
      <section className="mm-panel mm-menu" data-testid="menu">
        <p className="mm-kicker">Космическая математика</p>
        <h1 className="mm-title">METEOR MATH</h1>
        <p className="mm-lede">
          Лови метеоры и решай примеры, пока не истекло время. Верный ответ — 100 очков. Если
          ошибся, можно пробовать снова, пока тикает таймер.
        </p>
        <button type="button" className="mm-start" onClick={onStart} data-testid="start">
          🚀 НАЧАТЬ ИГРУ
        </button>

        <div className="mm-setting" role="group" aria-label="Время на один пример">
          <p className="mm-setting-label">Время на один пример</p>
          <div className="mm-options">
            {TIME_OPTIONS.map((time) => (
              <button
                key={time}
                type="button"
                className="mm-chip"
                aria-pressed={settings.time === time}
                onClick={() => onTime(time)}
              >
                {time} с
              </button>
            ))}
          </div>
        </div>

        <div className="mm-setting" role="group" aria-label="Сложность">
          <p className="mm-setting-label">Сложность</p>
          <div className="mm-diffs">
            {DIFFICULTIES.map((item) => (
              <button
                key={item.id}
                type="button"
                className="mm-diff"
                aria-pressed={settings.difficulty === item.id}
                onClick={() => onDifficulty(item.id)}
              >
                <span>{item.title}</span>
                <small>{item.text}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="mm-setting" role="group" aria-label="Количество примеров">
          <p className="mm-setting-label">Количество примеров</p>
          <div className="mm-options">
            {COUNT_OPTIONS.map((count) => (
              <button
                key={String(count)}
                type="button"
                className="mm-chip"
                aria-pressed={settings.count === count}
                onClick={() => onCount(count)}
              >
                {count === "infinite" ? "Бесконечно" : count}
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="mm-link" onClick={onOpenExplorer}>
          Открыть географическую викторину
        </button>
      </section>
    </div>
  )
}
