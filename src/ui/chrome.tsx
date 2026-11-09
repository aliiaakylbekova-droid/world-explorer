import type { ReactNode } from "react"

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`panel ${className}`}>{children}</div>
}

export function GoldButton({
  children,
  onClick,
  disabled,
  ghost,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  ghost?: boolean
}) {
  return (
    <button type="button" className={ghost ? "btn ghost" : "btn"} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export function BackBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="backbar">
      <GoldButton ghost onClick={onBack}>
        ← Назад
      </GoldButton>
      <h2>{title}</h2>
      <span />
    </div>
  )
}
