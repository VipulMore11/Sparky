import { useMemo } from "react"
import { useProfile } from "./use-profile"
import { TOTAL_STAGES } from "./stages"

export type LearningMix = {
  seeImagine: number
  listenSpeak: number
  readWrite: number
  handsOnExplore: number
}

export function useLearningProfile() {
  const { profile, ready } = useProfile()

  // Get raw counts from the progress object
  const visual = profile.progress["visual"] || 0
  const auditory = profile.progress["auditory"] || 0
  const readwrite = profile.progress["readwrite"] || 0
  const kinesthetic = profile.progress["kinesthetic"] || 0

  const percentages = useMemo(() => {
    if (!ready) {
      return {
        seeImagine: 0,
        listenSpeak: 0,
        readWrite: 0,
        handsOnExplore: 0,
      }
    }

    let total = visual + auditory + readwrite + kinesthetic

    let raw = {
      seeImagine: visual,
      listenSpeak: auditory,
      readWrite: readwrite,
      handsOnExplore: kinesthetic,
    }

    if (total === 0) {
      raw = {
        seeImagine: 20,
        listenSpeak: 40,
        readWrite: 25,
        handsOnExplore: 15,
      }
      total = 100
    }

    const mix: LearningMix = {
      seeImagine: Math.round((raw.seeImagine / total) * 100),
      listenSpeak: Math.round((raw.listenSpeak / total) * 100),
      readWrite: Math.round((raw.readWrite / total) * 100),
      handsOnExplore: Math.round((raw.handsOnExplore / total) * 100),
    }

    const sum = mix.seeImagine + mix.listenSpeak + mix.readWrite + mix.handsOnExplore

    if (sum !== 100 && total > 0) {
      const diff = 100 - sum
      mix.seeImagine += diff 
    }

    return mix
  }, [ready, visual, auditory, readwrite, kinesthetic])

  return {
    percentages,
    loading: !ready,
  }
}
