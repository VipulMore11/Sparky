"use client"

import { useCallback, useEffect, useState } from "react"
import type { AgeGroup, StyleKey } from "./learning-styles"
import type { ScoreResult } from "./assessment"

const STORAGE_KEY = "sparkpath_profile_v1"
const EVENT = "sparkpath_profile_change"

export type Profile = {
  name: string
  ageGroup: AgeGroup | null
  onboarded: boolean
  assessmentComplete: boolean
  primaryStyle: StyleKey | null
  percentages: ScoreResult["percentages"] | null
  scores: ScoreResult["scores"] | null
  /** completed stage count per learner module */
  progress: Record<StyleKey, number>
  /** total XP-style points */
  sparks: number
}

export const EMPTY_PROFILE: Profile = {
  name: "",
  ageGroup: null,
  onboarded: false,
  assessmentComplete: false,
  primaryStyle: null,
  percentages: null,
  scores: null,
  progress: { visual: 0, auditory: 0, readwrite: 0, kinesthetic: 0 },
  sparks: 0,
}

function read(): Profile {
  if (typeof window === "undefined") return EMPTY_PROFILE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_PROFILE
    return { ...EMPTY_PROFILE, ...JSON.parse(raw) }
  } catch {
    return EMPTY_PROFILE
  }
}

function write(profile: Profile) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  window.dispatchEvent(new Event(EVENT))
}

export function useProfile() {
  const [profile, setProfileState] = useState<Profile>(EMPTY_PROFILE)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setProfileState(read())
    setReady(true)
    const sync = () => setProfileState(read())
    window.addEventListener(EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const update = useCallback((patch: Partial<Profile>) => {
    const next = { ...read(), ...patch }
    write(next)
    setProfileState(next)
  }, [])

  const reset = useCallback(() => {
    write(EMPTY_PROFILE)
    setProfileState(EMPTY_PROFILE)
  }, [])

  return { profile, ready, update, reset }
}
