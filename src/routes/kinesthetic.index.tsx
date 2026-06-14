import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { useKinestheticStore } from "@/lib/kinesthetic-store";

export const Route = createFileRoute("/kinesthetic/")({
  head: () => ({ meta: [{ title: "Kinesthetic Learner — Module Picker" }] }),
  component: Picker,
});

const middle = [
  { slug: "ice-cream", title: "Save the Ice Cream", emoji: "🍦", concept: "Heat & insulation", color: "var(--duo-blue)" },
  { slug: "treehouse", title: "Strongest Treehouse", emoji: "🏠", concept: "Structures & stability", color: "var(--duo-orange)" },
  { slug: "water-park", title: "Water Park Designer", emoji: "💧", concept: "Flow systems", color: "var(--duo-teal)" },
  { slug: "pet-robot", title: "Pet Rescue Robot", emoji: "🤖", concept: "Sequential thinking", color: "var(--duo-purple)" },
];
const teens = [
  { slug: "dream-room", title: "Dream Room", emoji: "🛋️", concept: "Space optimization", color: "var(--duo-pink)" },
  { slug: "food-truck", title: "Food Truck Challenge", emoji: "🚚", concept: "Resource allocation", color: "var(--duo-red)" },
  { slug: "theme-park", title: "Theme Park Builder", emoji: "🎢", concept: "Systems thinking", color: "var(--duo-yellow)" },
  { slug: "escape-room", title: "Escape Room Engineer", emoji: "🗝️", concept: "Applied STEM", color: "var(--duo-green)" },
];

function Picker() {
  const { results, reset } = useKinestheticStore();
  const completed = Object.keys(results).length;
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="chip" style={{ background: "color-mix(in oklab, var(--duo-green) 15%, transparent)", color: "var(--duo-green-dark)" }}>
          <Sparkles className="size-3.5" /> KINESTHETIC LEARNER MODULE
        </div>
        <h1 className="text-4xl font-extrabold mt-3 tracking-tight">Pick a challenge</h1>
        <p className="text-muted-foreground mt-2">Each game measures how you learn through action. Complete all to see your kinesthetic profile.</p>

        <div className="mt-6 flex items-center gap-3">
          <Link to="/kinesthetic/summary" className="btn-pop btn-pop-blue text-sm">
            View results <ArrowRight className="ml-2 size-4" />
          </Link>
          {completed > 0 && (
            <button onClick={reset} className="text-xs font-bold uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
              <RotateCcw className="size-3.5" /> Reset ({completed})
            </button>
          )}
        </div>

        <Section title="Middle School (9–12)" items={middle} group="middle-school" results={results} />
        <Section title="Teens (13–18)" items={teens} group="teens" results={results} />
      </div>
    </div>
  );
}

function Section({ title, items, group, results }: { title: string; items: typeof middle; group: "middle-school" | "teens"; results: Record<string, { kinestheticScore: number }> }) {
  return (
    <section className="mt-10">
      <h2 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((m) => {
          const done = results[m.slug];
          return (
            <a
              key={m.slug}
              href={`/kinesthetic/${group}/${m.slug}`}
              className="card-pop hover:-translate-y-0.5 transition-transform group flex items-center gap-4 !p-4 no-underline"
              style={{ boxShadow: `0 4px 0 0 ${m.color}` }}
            >
              <div className="size-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ background: `color-mix(in oklab, ${m.color} 20%, white)` }}>
                {m.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold leading-tight">{m.title}</div>
                <div className="text-xs text-muted-foreground">{m.concept}</div>
              </div>
              {done ? (
                <span className="chip" style={{ background: "var(--duo-green)", color: "white" }}>
                  {done.kinestheticScore}
                </span>
              ) : (
                <ArrowRight className="size-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              )}
            </a>
          );
        })}
      </div>
    </section>
  );
}