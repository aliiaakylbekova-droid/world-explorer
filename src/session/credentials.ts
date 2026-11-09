/** Default teacher login. Change these values to set a new code and PIN. */
export const DEFAULT_TEACHER_CODE = "учитель"
export const DEFAULT_TEACHER_PIN = "4723"

const STORAGE_KEY = "world-explorer-teacher-auth"

export type TeacherAuth = {
  code: string
  pin: string
}

export function loadTeacherAuth(): TeacherAuth {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { code: DEFAULT_TEACHER_CODE, pin: DEFAULT_TEACHER_PIN }
    const parsed = JSON.parse(raw) as Partial<TeacherAuth>
    const code = typeof parsed.code === "string" ? parsed.code.trim() : ""
    const pin = typeof parsed.pin === "string" ? parsed.pin.trim() : ""
    return {
      code: code || DEFAULT_TEACHER_CODE,
      pin: pin || DEFAULT_TEACHER_PIN,
    }
  } catch {
    return { code: DEFAULT_TEACHER_CODE, pin: DEFAULT_TEACHER_PIN }
  }
}

export function saveTeacherAuth(auth: TeacherAuth): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ code: auth.code.trim(), pin: auth.pin.trim() }),
  )
}

export function teacherLoginMatches(code: string, pin: string): boolean {
  const expected = loadTeacherAuth()
  return code.trim() === expected.code && pin.trim() === expected.pin
}
