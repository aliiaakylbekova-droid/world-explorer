import { useEffect, useState } from "react"
import { ExplorerApp } from "./ExplorerApp.tsx"
import { MeteorMath } from "./meteor/MeteorMath.tsx"

type Mode = "meteor" | "explorer"

function readMode(): Mode {
  return window.location.hash === "#/explorer" ? "explorer" : "meteor"
}

export default function App() {
  const [mode, setMode] = useState<Mode>(readMode)

  useEffect(() => {
    const onHash = () => setMode(readMode())
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (mode === "explorer") {
      document.title = "WORLD EXPLORER"
      meta?.setAttribute("content", "#efe4cc")
      return
    }
    document.title = "METEOR MATH — Космическая математика"
    meta?.setAttribute("content", "#07051a")
  }, [mode])

  function open(next: Mode) {
    const hash = next === "explorer" ? "#/explorer" : "#/"
    if (window.location.hash === hash) {
      setMode(next)
      return
    }
    window.location.hash = hash
  }

  if (mode === "explorer") {
    return (
      <>
        <ExplorerApp />
        <button type="button" className="mode-return" onClick={() => open("meteor")}>
          К метеорам
        </button>
      </>
    )
  }

  return <MeteorMath onOpenExplorer={() => open("explorer")} />
}
