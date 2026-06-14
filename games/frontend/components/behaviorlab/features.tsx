import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Features() {
  const items = [
    {
      title: "Millisecond-Accurate Timing",
      badge: "Lab-Validated",
      borderClass: "border-t-4 border-primary",
      desc: "Sub-millisecond timing validated across 10,000+ device configurations. Frame-perfect stimulus presentation.",
    },
    {
      title: "No-Code Experiment Design",
      badge: "Drag & Drop",
      borderClass: "border-t-4 border-accent",
      desc: "Design complex experimental trials with branching logic, randomization, and counterbalancing—no code required.",
    },
    {
      title: "Ethics & Privacy First",
      badge: "GDPR Compliant",
      borderClass: "border-t-4 border-primary",
      desc: "Anonymity by design, audit trails, and compliance with IRB requirements and GDPR.",
    },
    {
      title: "AI Experiment Assistant",
      badge: "AI-Powered",
      borderClass: "border-t-4 border-accent",
      desc: "Get intelligent suggestions for study design, stimuli timing, and sample sizes.",
    },
    {
      title: "Built-in Recruitment",
      badge: "50K+ Participants",
      borderClass: "border-t-4 border-accent",
      desc: "Access diverse, global participant pools and target demographics for generalizable results.",
    },
    {
      title: "Real-Time Monitoring",
      badge: "Live",
      borderClass: "border-t-4 border-primary",
      desc: "Track progress, completion rates, and key metrics while your study runs.",
    },
  ]

  return (
    <section id="features" className="bg-background" aria-labelledby="features-title">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <h2 id="features-title" className="text-center text-3xl md:text-4xl font-bold">
          Everything You Need for World-Class Research
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <Card
              key={it.title}
              className={`${it.borderClass} transition-transform duration-200 hover:-translate-y-1 hover:shadow-md`}
            >
              <CardHeader>
                <CardTitle className="text-xl">{it.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{it.desc}</p>
                <span className="mt-4 inline-block rounded-md bg-foreground text-background px-2 py-1 text-xs font-medium">
                  {it.badge}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
