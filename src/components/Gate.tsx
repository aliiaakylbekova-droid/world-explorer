import { useState, type FormEvent } from "react"
import {
  DEFAULT_TEACHER_CODE,
  DEFAULT_TEACHER_PIN,
  loadTeacherAuth,
  teacherLoginMatches,
} from "../session/credentials.ts"

type GateView = "choose" | "student" | "teacher"

export function Gate({
  onStudent,
  onTeacher,
}: {
  onStudent: (name: string, className: string) => void
  onTeacher: () => void
}) {
  const [view, setView] = useState<GateView>("choose")
  const [name, setName] = useState("")
  const [className, setClassName] = useState("")
  const [code, setCode] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")

  const submitStudent = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setError("Введи имя — хотя бы две буквы.")
      return
    }
    setError("")
    onStudent(trimmed, className.trim())
  }

  const submitTeacher = (event: FormEvent) => {
    event.preventDefault()
    if (!teacherLoginMatches(code, pin)) {
      setError("Неверный код или PIN.")
      return
    }
    setError("")
    onTeacher()
  }

  return (
    <div className="overlay-anchor">
      <section className="card start-card gate-card" data-testid="gate">
        {view === "choose" ? (
          <>
            <p className="eyebrow">География · 7 класс</p>
            <h1>WORLD EXPLORER</h1>
            <p className="lede">
              Выбери кабинет. Ученик проходит квиз, учитель смотрит результаты на этом же
              устройстве.
            </p>
            <div className="role-pick">
              <button type="button" className="advance" onClick={() => setView("student")} data-testid="role-student">
                Ученик
              </button>
              <button
                type="button"
                className="advance ghost"
                onClick={() => {
                  const auth = loadTeacherAuth()
                  setCode(auth.code)
                  setPin(auth.pin)
                  setError("")
                  setView("teacher")
                }}
                data-testid="role-teacher"
              >
                Учитель
              </button>
            </div>
          </>
        ) : null}

        {view === "student" ? (
          <form onSubmit={submitStudent} data-testid="student-entry">
            <p className="eyebrow">Кабинет ученика</p>
            <h1>Вход</h1>
            <p className="lede">Имя нужно, чтобы учитель увидел твой результат. Класс можно не указывать.</p>
            <label className="field">
              <span>Имя</span>
              <input
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Алия"
                maxLength={40}
                data-testid="student-name"
              />
            </label>
            <label className="field">
              <span>Класс (необязательно)</span>
              <input
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                placeholder="7А"
                maxLength={12}
                data-testid="student-class"
              />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            <div className="card-actions">
              <button type="button" className="advance ghost" onClick={() => { setView("choose"); setError("") }}>
                Назад
              </button>
              <button type="submit" className="advance" data-testid="student-enter">
                Войти
              </button>
            </div>
          </form>
        ) : null}

        {view === "teacher" ? (
          <form onSubmit={submitTeacher} data-testid="teacher-entry">
            <p className="eyebrow">Кабинет учителя</p>
            <h1>Вход</h1>
            <p className="lede">
              Код по умолчанию — «{DEFAULT_TEACHER_CODE}», PIN — {DEFAULT_TEACHER_PIN}. Их можно сменить
              в кабинете.
            </p>
            <label className="field">
              <span>Код</span>
              <input
                autoFocus
                value={code}
                onChange={(event) => setCode(event.target.value)}
                autoComplete="username"
                data-testid="teacher-code"
              />
            </label>
            <label className="field">
              <span>PIN</span>
              <input
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                type="password"
                autoComplete="current-password"
                data-testid="teacher-pin"
              />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            <div className="card-actions">
              <button type="button" className="advance ghost" onClick={() => { setView("choose"); setError("") }}>
                Назад
              </button>
              <button type="submit" className="advance" data-testid="teacher-enter">
                Войти
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </div>
  )
}
