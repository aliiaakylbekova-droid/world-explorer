export type StudentSession = {
  role: "student"
  name: string
  className: string
}

export type TeacherSession = {
  role: "teacher"
}

export type Session = StudentSession | TeacherSession

const SESSION_KEY = "world-explorer-session"

export function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Session>
    if (parsed.role === "teacher") return { role: "teacher" }
    if (parsed.role === "student" && typeof parsed.name === "string") {
      const name = parsed.name.trim()
      if (!name) return null
      const className = typeof parsed.className === "string" ? parsed.className.trim() : ""
      return { role: "student", name, className }
    }
    return null
  } catch {
    return null
  }
}

export function saveSession(session: Session): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
