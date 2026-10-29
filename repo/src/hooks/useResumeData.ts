import { useEffect, useState } from 'react'
import { parseResumeData, publicAsset } from '../data/resume'
import type { ResumeData } from '../data/resume'

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; data: ResumeData }
  | { status: 'error'; message: string }

export function useResumeData() {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const response = await fetch(publicAsset('resumeData.json'), {
          signal: controller.signal,
          cache: 'no-cache',
        })
        if (!response.ok) throw new Error(`Could not load profile data (HTTP ${response.status}).`)
        const data = parseResumeData(await response.json())
        if (!controller.signal.aborted) setState({ status: 'ready', data })
      } catch (error) {
        if (!controller.signal.aborted) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'An unexpected error prevented the profile from loading.',
          })
        }
      }
    }
    void load()
    return () => controller.abort()
  }, [attempt])

  function retry() {
    setState({ status: 'loading' })
    setAttempt((previous) => previous + 1)
  }

  return { state, retry }
}
