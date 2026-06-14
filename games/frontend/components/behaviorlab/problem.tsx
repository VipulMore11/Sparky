import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Problem() {
  return (
    <section className="bg-muted" aria-labelledby="problem">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="text-center">
          <h2 id="problem" className="text-3xl md:text-4xl font-bold">
            The Research Challenge
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded bg-primary" aria-hidden />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Limited to Lab Students"
            desc="Traditional experiments only reach 30-50 participants near your university. Data lacks diversity and generalizability across populations."
          />
          <FeatureCard
            title="Timing Unreliable Online"
            desc="Standard web tools lose millisecond precision across devices, making cognitive timing studies impossible to conduct reliably."
          />
          <FeatureCard
            title="Technical Barriers"
            desc="Requires programming skills, expensive equipment, and IT infrastructure that most researchers don't have access to."
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <Card className="transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  )
}
