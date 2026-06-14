import { Tabs } from "./tabs";

export function SolutionTabs() {
  const tabs = [
    {
      id: "builder",
      label: "Visual Builder",
      panel: (
        <div className="space-y-3">
          <p className="text-muted-foreground">
            Powerful visual interface for designing complex trials. No coding
            required—drag and drop components, set properties, and branch logic.
          </p>
          <div className="h-48 rounded-md border border-border" aria-hidden />
          <span className="inline-block rounded-md bg-green-500 text-white px-2 py-1 text-xs font-medium">
            No coding required
          </span>
        </div>
      ),
    },
    {
      id: "timing",
      label: "Precision Timing",
      panel: (
        <div className="space-y-3">
          <p className="text-muted-foreground">
            Sub-millisecond timing validated across diverse devices with WebGL
            acceleration and adaptive calibration.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-border p-4">
              <div className="text-2xl font-bold text-primary">
                99.8% Accurate
              </div>
              <p className="text-sm text-muted-foreground">
                Lab-validated timing engine
              </p>
            </div>
            <div className="rounded-md border border-border p-4">
              <div className="text-2xl font-bold text-accent">
                Frame-perfect
              </div>
              <p className="text-sm text-muted-foreground">
                Vetted across 10,000+ configs
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "participants",
      label: "Global Participants",
      panel: (
        <div className="space-y-3">
          <p className="text-muted-foreground">
            Recruit from a global pool with built-in tools. Target demographics
            and ensure sample diversity.
          </p>
          <div className="h-48 rounded-md border border-border" aria-hidden />
        </div>
      ),
    },
    {
      id: "analytics",
      label: "Live Analytics",
      panel: (
        <div className="space-y-3">
          <p className="text-muted-foreground">
            Monitor progress in real time, track completion, and review key
            metrics.
          </p>
          <div className="h-48 rounded-md border border-border" aria-hidden />
        </div>
      ),
    },
  ];

  return (
    <section className="bg-background" aria-labelledby="solution">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="text-center">
          <h2 id="solution" className="text-4xl font-bold">
            Meet CogniLab: Your Digital Research Lab
          </h2>
          <div
            className="mx-auto mt-3 h-1 w-16 rounded bg-accent"
            aria-hidden
          />
        </div>
        <div className="mt-10">
          <Tabs tabs={tabs} />
        </div>
      </div>
    </section>
  );
}
