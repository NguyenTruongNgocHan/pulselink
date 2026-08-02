import { useMemo } from 'react'

interface ResettableState {
  error: unknown
  reset?: () => void
}

/**
 * Combines the error state of several queries/mutations into a single value,
 * plus a `dismiss()` you can wire to `InlineAlert`'s `onDismiss` (or call
 * whenever the user starts a new, unrelated action).
 *
 * React Query does NOT clear a mutation's `error` until that same mutation
 * is retried, so pages that derive an error banner from
 * `a.error ?? b.error ?? c.error` end up showing a stale failure from a
 * previous, unrelated click indefinitely. This hook makes "dismiss" a first
 * class, explicit action instead of relying on that implicit reset.
 */
export function useCombinedError(states: ResettableState[]) {
  const error = useMemo(() => {
    for (const state of states) {
      if (state.error) return state.error
    }
    return null
  }, [states])

  const dismiss = () => {
    for (const state of states) {
      state.reset?.()
    }
  }

  return { error, dismiss }
}
