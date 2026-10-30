import { lazy, Suspense, useEffect, useState } from "react"
import { MeteorMath } from "./meteor/MeteorMath.tsx"

const ExplorerApp = lazy(() => import("./ExplorerApp.tsx"))

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
    document.title = "METEOR MATH"
    meta?.setAttribute("content", "#050714")
  }, [mode])

  if (mode === "explorer") {
    return (
      <Suspense fallback={null}>
        <ExplorerApp />
        <a className="mode-return" href="#/">
          METEOR MATH
        </a>
      </Suspense>
    )
  }

  return <MeteorMath />
}
