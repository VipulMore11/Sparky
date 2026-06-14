export function HowItWorks() {
  return (
    <section className="bg-muted" aria-labelledby="how">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <h2 id="how" className="text-3xl md:text-4xl font-bold text-center">
          From Idea to Data in 3 Steps
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <StepCard
            number="1"
            title="Design Your Experiment"
            desc="Build trials, set logic, randomize and counterbalance."
          />
          <StepCard
            number="2"
            title="Share With Participants"
            desc="Distribute links or QR codes and reach global audiences."
          />
          <StepCard
            number="3"
            title="Analyze Results"
            desc="Review real-time metrics and export data for deeper analysis."
          />
        </div>
      </div>
    </section>
  )
}

function StepCard({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">
          {number}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-muted-foreground">{desc}</p>
    </div>
  )
}
