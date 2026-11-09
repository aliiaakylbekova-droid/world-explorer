import { Component, type ErrorInfo, type ReactNode } from "react"

type Props = { fallback?: ReactNode; children: ReactNode }
type State = { error: string | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error: error.message || String(error) }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[geo-quest] 3D scene error", error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="globe-wait">
            <p>Ошибка 3D</p>
            <pre className="tiny">{this.state.error}</pre>
          </div>
        )
      )
    }
    return this.props.children
  }
}
