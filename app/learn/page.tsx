"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useProfile } from "@/lib/use-profile"

export default function LearnIndex() {
  const router = useRouter()
  const { profile, ready } = useProfile()

  useEffect(() => {
    if (!ready) return
    if (!profile.assessmentComplete) {
      router.replace("/")
      return
    }
    router.replace(`/learn/${profile.primaryStyle ?? "visual"}`)
  }, [ready, profile.assessmentComplete, profile.primaryStyle, router])

  return (
    <div className="flex min-h-svh items-center justify-center text-muted-foreground">
      Loading your learning path…
    </div>
  )
}
