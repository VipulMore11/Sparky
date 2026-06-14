"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar, MobileModuleNav } from "@/components/dashboard/sidebar"
import { RightRail, TopStats } from "@/components/dashboard/right-rail"
import { StagePath } from "@/components/dashboard/stage-path"
import { MascotChat } from "@/components/dashboard/mascot-chat"
import { useProfile } from "@/lib/use-profile"
import type { StyleKey } from "@/lib/learning-styles"

export function DashboardShell({ 
  activeItem, 
  children 
}: { 
  activeItem: StyleKey | "games"
  children: React.ReactNode 
}) {
  const router = useRouter()
  const { profile, ready } = useProfile()

  useEffect(() => {
    if (ready && !profile.assessmentComplete) {
      router.replace("/")
    }
  }, [ready, profile.assessmentComplete, router])

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar active={activeItem} />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileModuleNav active={activeItem} />

        <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-6">
          {/* center column */}
          <main className="min-w-0 flex-1">
            <div className="lg:hidden">
              <TopStats />
            </div>
            {children}
          </main>

          {/* right rail */}
          <div className="hidden w-80 shrink-0 flex-col gap-4 xl:flex">
            <TopStats />
            <RightRail />
          </div>
        </div>
      </div>

      <MascotChat style={profile.primaryStyle ?? "visual"} name={profile.name} ageGroup={profile.ageGroup} />
    </div>
  )
}
