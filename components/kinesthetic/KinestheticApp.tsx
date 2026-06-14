import { useState, useMemo } from "react"
import { useProfile } from "@/lib/use-profile"
import { ColorLab } from "./ColorLab"
import { BridgeBuilder } from "./BridgeBuilder"
import { WaterPath } from "./WaterPath"
import { AnimalHouse } from "./AnimalHouse"
import { Garden } from "./Garden"
import { PuppyMaze } from "./PuppyMaze"
import { Playground } from "./Playground"
import { Results } from "./Results"

// Middle School Games
import { MiddlePetRobot } from "./MiddlePetRobot"
import { MiddleIceCream } from "./MiddleIceCream"
import { MiddleTreehouse } from "./MiddleTreehouse"
import { MiddleWaterPark } from "./MiddleWaterPark"

// Teen Games
import { TeenDreamRoom } from "./TeenDreamRoom"
import { TeenEscapeRoom } from "./TeenEscapeRoom"
import { TeenFoodTruck } from "./TeenFoodTruck"
import { TeenThemePark } from "./TeenThemePark"

interface KinestheticAppProps {
  levelIndex: number
  onComplete: (score: number) => void
  onClose: () => void
}

export function KinestheticApp({
  levelIndex,
  onComplete,
  onClose,
}: KinestheticAppProps) {
  const { profile } = useProfile()
  
  if (levelIndex === 7) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center overflow-y-auto">
        <Results onContinue={() => onComplete(100)} onClose={onClose} />
      </div>
    )
  }

  // Common wrapper props
  const commonProps = {
    onComplete: (score: number) => onComplete(score),
    onClose,
    progress: (levelIndex / 7) * 100,
  }

  return (
    <div className="fixed inset-0 z-50 bg-background text-foreground overflow-y-auto">
      {profile.ageGroup === "middle" ? (
        <>
          {levelIndex === 0 && <MiddlePetRobot {...commonProps} />}
          {levelIndex === 1 && <MiddleIceCream {...commonProps} />}
          {levelIndex === 2 && <MiddleTreehouse {...commonProps} />}
          {levelIndex === 3 && <MiddleWaterPark {...commonProps} />}
          {/* Default to one of them or show a "coming soon" for indices > 3 if needed */}
          {levelIndex > 3 && levelIndex < 7 && (
            <div className="flex h-full items-center justify-center">
              <h2 className="text-2xl font-bold text-muted-foreground">More Middle School games coming soon...</h2>
              <button onClick={() => onComplete(100)} className="ml-4 rounded-xl bg-primary px-4 py-2 text-primary-foreground font-bold">Skip</button>
            </div>
          )}
        </>
      ) : profile.ageGroup === "teen" ? (
        <>
          {levelIndex === 0 && <TeenDreamRoom {...commonProps} />}
          {levelIndex === 1 && <TeenEscapeRoom {...commonProps} />}
          {levelIndex === 2 && <TeenFoodTruck {...commonProps} />}
          {levelIndex === 3 && <TeenThemePark {...commonProps} />}
          {/* Default to one of them or show a "coming soon" for indices > 3 if needed */}
          {levelIndex > 3 && levelIndex < 7 && (
            <div className="flex h-full items-center justify-center">
              <h2 className="text-2xl font-bold text-muted-foreground">More Teen games coming soon...</h2>
              <button onClick={() => onComplete(100)} className="ml-4 rounded-xl bg-primary px-4 py-2 text-primary-foreground font-bold">Skip</button>
            </div>
          )}
        </>
      ) : (
        <>
          {levelIndex === 0 && <ColorLab {...commonProps} />}
          {levelIndex === 1 && <BridgeBuilder {...commonProps} />}
          {levelIndex === 2 && <WaterPath {...commonProps} />}
          {levelIndex === 3 && <AnimalHouse {...commonProps} />}
          {levelIndex === 4 && <Garden {...commonProps} />}
          {levelIndex === 5 && <PuppyMaze {...commonProps} />}
          {levelIndex === 6 && <Playground {...commonProps} />}
        </>
      )}
    </div>
  )
}
