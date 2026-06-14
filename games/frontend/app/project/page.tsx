import { Navbar } from '@/components/behaviorlab/navbar'
import { MyWork } from '@/components/project/my-work'
import { GettingStarted } from '@/components/project/getting-started'
import { Announcements } from '@/components/project/announcements'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <MyWork />
            <GettingStarted />
          </div>
          <div className="space-y-8">
            <Announcements />
          </div>
        </div>
      </main>
    </div>
  )
}