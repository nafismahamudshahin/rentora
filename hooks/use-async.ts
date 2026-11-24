"use client"

// hooks/use-async.ts
// Tiny data-loading hook used by pages that read through backend-api.
//
//   const { data: rows = [], loading, error, setData, reload } = useAsync(() => getRentals())
//
// - `loading` / `error` drive the empty state
// - `setData(next | updater)` applies an action's optimistic result
// - `reload()` re-runs the loader

import { useCallback, useEffect, useRef, useState } from "react"

type State<T> = {
  data?: T
  error: boolean
  loaded: boolean
}

export function useAsync<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[] = []
) {
  const [state, setState] = useState<State<T>>({
    data: undefined,
    error: false,
    loaded: false,
  })
  const [nonce, setNonce] = useState(0)
  const loaderRef = useRef(loader)

  // Always call the latest loader without listing it as a dependency.
  useEffect(() => {
    loaderRef.current = loader
  })

  useEffect(() => {
    let cancelled = false
    loaderRef.current().then(
      (data) => {
        if (!cancelled) setState({ data, error: false, loaded: true })
      },
      () => {
        if (!cancelled) setState({ data: undefined, error: true, loaded: true })
      }
    )
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `deps` is the caller's dependency list
  }, [...deps, nonce])

  const reload = useCallback(() => {
    setState({ data: undefined, error: false, loaded: false })
    setNonce((n) => n + 1)
  }, [])

  const setData = useCallback((update: T | ((prev: T) => T)) => {
    setState((prev) => {
      if (prev.data === undefined) return prev
      const next =
        typeof update === "function"
          ? (update as (p: T) => T)(prev.data)
          : update
      return { data: next, error: false, loaded: true }
    })
  }, [])

  return {
    data: state.data as T | undefined,
    loading: !state.loaded && !state.error,
    error: state.error,
    reload,
    setData,
  }
}
