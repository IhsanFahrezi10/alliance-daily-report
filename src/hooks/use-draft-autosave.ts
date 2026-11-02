'use client'

import { useEffect, useState, useRef } from 'react'

type DraftData = {
  values: any
  savedAt: string
}

const MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24 jam

export function useDraftAutosave(
  key: string,
  values: any,
  delay = 1500
) {
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [draft, setDraft] = useState<DraftData | null>(null)
  const [checked, setChecked] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isFirstRender = useRef(true)

  // Load draft on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed: DraftData = JSON.parse(stored)
        const age = Date.now() - new Date(parsed.savedAt).getTime()
        if (age < MAX_AGE_MS) {
          setDraft(parsed)
        } else {
          localStorage.removeItem(key)
        }
      }
    } catch {}
    setChecked(true)
  }, [key])

  // Save draft debounced
  useEffect(() => {
    // Skip render pertama (biar nggak save form kosong)
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!values) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      try {
        const data: DraftData = {
          values,
          savedAt: new Date().toISOString(),
        }
        localStorage.setItem(key, JSON.stringify(data))
        setSavedAt(new Date())
      } catch {}
    }, delay)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [key, values, delay])

  const clearDraft = () => {
    try {
      localStorage.removeItem(key)
      setDraft(null)
      setSavedAt(null)
    } catch {}
  }

  return { draft, savedAt, clearDraft, checked }
}