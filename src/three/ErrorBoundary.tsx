import { Component, type ErrorInfo, type ReactNode } from "react"

type Props = { fallback: ReactNode; children: ReactNode }
type State = { failed: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info)
  }

  render() {
    if (this.state.failed) return this.props.fallback
    return this.props.children
  }
}
