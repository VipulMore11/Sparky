import { GameProvider } from "@/lib/game-store"
import { AppShell } from "@/components/app-shell"

export function ReadWriteApp() {
  return (
    <GameProvider>
      <AppShell />
    </GameProvider>
  )
}
