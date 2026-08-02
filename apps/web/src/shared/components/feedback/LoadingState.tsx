interface LoadingStateProps {
  label?: string
  rows?: number
}

export function LoadingState({ label = 'Loading', rows = 4 }: LoadingStateProps) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <span className="loading-state__row" key={index} />
      ))}
    </div>
  )
}
