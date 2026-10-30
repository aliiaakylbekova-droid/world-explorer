import type { Ending } from "./types.ts"

export function ResultsScreen({
  ending,
  score,
  correct,
  missed,
  wrongTries,
  accuracy,
  onReplay,
  onMenu,
}: {
  ending: Ending
  score: number
  correct: number
  missed: number
  wrongTries: number
  accuracy: number
  onReplay: () => void
  onMenu: () => void
}) {
  const finished = correct + missed
  const title = ending === "stop" ? "Сессия завершена" : "Полёт окончен"
  const note =
    finished === 0
      ? "Метеоры ещё ждут. Начни заход, когда будешь готов."
      : accuracy >= 90
        ? "Отличная навигация — пояс астероидов пройден почти без ошибок."
        : accuracy >= 60
          ? "Хороший курс. Ещё один заход — и счёт станет выше."
          : "Ничего страшного: следующий вылет будет увереннее."

  return (
    <div className="mm-overlay">
      <section className="mm-panel mm-results" data-testid="results">
        <p className="mm-kicker">{ending === "stop" ? "Бесконечный режим" : "Итоги"}</p>
        <h2 className="mm-results-title">{title}</h2>
        <p className="mm-score-hero">
          {score}
          <span> очков</span>
        </p>
        <p className="mm-accuracy">
          Точность <strong>{accuracy}%</strong>
        </p>
        <dl className="mm-stats">
          <div>
            <dt>Верно</dt>
            <dd>{correct}</dd>
          </div>
          <div>
            <dt>Промахи</dt>
            <dd>{missed}</dd>
          </div>
          <div>
            <dt>Неверные попытки</dt>
            <dd>{wrongTries}</dd>
          </div>
          <div>
            <dt>Примеров</dt>
            <dd>{finished}</dd>
          </div>
        </dl>
        <p className="mm-lede">{note}</p>
        <div className="mm-actions">
          <button type="button" className="mm-start" onClick={onReplay}>
            Ещё раз
          </button>
          <button type="button" className="mm-ghost" onClick={onMenu}>
            В меню
          </button>
        </div>
      </section>
    </div>
  )
}
