import { COUNT_OPTIONS, TIME_OPTIONS, type Difficulty, type ProblemCount, type Settings, type TimeLimit } from "./types.ts"

const DIFFICULTIES: { id: Difficulty; title: string }[] = [
  { id: "easy", title: "Лёгкий" },
  { id: "medium", title: "Средний" },
  { id: "hard", title: "Сложный" },
]

export function MenuScreen({
  settings,
  onTime,
  onDifficulty,
  onCount,
  onStart,
}: {
  settings: Settings
  onTime: (time: TimeLimit) => void
  onDifficulty: (difficulty: Difficulty) => void
  onCount: (count: ProblemCount) => void
  onStart: () => void
}) {
  return (
    <div className="mm-overlay mm-launch">
      <p className="mm-brand">METEOR MATH</p>
      <section className="mm-console" data-testid="menu" aria-label="Настройки захода">
        <div className="mm-setting" role="group" aria-label="Время на один пример">
          <p className="mm-setting-label">Время</p>
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
          <div className="mm-options">
            {DIFFICULTIES.map((item) => (
              <button
                key={item.id}
                type="button"
                className="mm-chip"
                aria-pressed={settings.difficulty === item.id}
                onClick={() => onDifficulty(item.id)}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>

        <div className="mm-setting" role="group" aria-label="Количество примеров">
          <p className="mm-setting-label">Примеры</p>
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

        <button type="button" className="mm-start" onClick={onStart} data-testid="start">
          НАЧАТЬ ИГРУ
        </button>
      </section>
    </div>
  )
}
