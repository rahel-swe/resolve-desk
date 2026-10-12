import { useCallback, useEffect, useRef, useState } from 'react'

// One lifecycle for read-only resources; aborted and superseded requests cannot
// replace newer data or leak a previous user's workspace into the next session.

export function useApiResource<T>(
  load: (signal: AbortSignal) => Promise<T>,
  initialData: T,
  sessionKey: string | null,
) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(Boolean(sessionKey))
  const [error, setError] = useState('')
  const request = useRef<AbortController | null>(null)

  const refresh = useCallback(async () => {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller

    if (!sessionKey) {
      setData(initialData)
      setError('')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await load(controller.signal)
      if (!controller.signal.aborted) setData(result)
    } catch (cause) {
      if (!controller.signal.aborted) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'Unable to load this workspace.',
        )
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [initialData, load, sessionKey])

  useEffect(() => {
    setData(initialData)
    void refresh()
    return () => request.current?.abort()
  }, [initialData, refresh])

  return { data, loading, error, refresh }
}
