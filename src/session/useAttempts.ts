import { useCallback, useEffect, useState } from "react"
import { ATTEMPTS_EVENT, loadAttempts, type Attempt } from "./results.ts"

export function useAttempts() {
  const [attempts, setAttempts] = useState<Attempt[]>(() => loadAttempts())

  const refresh = useCallback(() => {
    setAttempts(loadAttempts())
  }, [])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key !== "world-explorer-attempts") return
      refresh()
    }
    window.addEventListener("storage", onStorage)
    window.addEventListener(ATTEMPTS_EVENT, refresh)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(ATTEMPTS_EVENT, refresh)
    }
  }, [refresh])

  return { attempts, refresh }
}
