import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Beaker, Hammer, Droplets, ArrowRight, Trophy, Flower2, MapPinned, Slice } from "lucide-react";
import { Mascot } from "@/components/kinesthetic/Mascot";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kinesthetic Play — Discover how your child learns" },
      { name: "description", content: "Playful STEM games that reveal kinesthetic learners across ages 3–8." },
    ],
  }),
  component: Hub,
});

const early = [
  { id: "color-lab",      to: "/kinesthetic/color-lab"      as const, title: "Color Discovery Lab", blurb: "Mix paints, find new colors.", icon: Beaker,   bg: "var(--paint-purple)" },
  { id: "bridge-builder", to: "/kinesthetic/bridge-builder" as const, title: "Bridge Builder",      blurb: "Help the fox cross the river.", icon: Hammer,   bg: "var(--paint-orange)" },
  { id: "water-path",     to: "/kinesthetic/water-path"     as const, title: "Water Path",          blurb: "Send water to the plant.",      icon: Droplets, bg: "var(--paint-blue)"   },
];

const elementary = [
  { id: "animal-house", to: "/elementary/animal-house" as const, title: "Animal House Builder", blurb: "Shapes & balance.",      icon: Hammer,    bg: "var(--paint-orange)" },
  { id: "garden",       to: "/elementary/garden"       as const, title: "Garden Creator",       blurb: "Tune sun, water, shade.", icon: Flower2,   bg: "var(--paint-green)"  },
  { id: "puppy-maze",   to: "/elementary/puppy-maze"   as const, title: "Lost Puppy Maze",      blurb: "Spatial reasoning.",      icon: MapPinned, bg: "var(--paint-purple)" },
  { id: "playground",   to: "/elementary/playground"   as const, title: "Build a Playground",   blurb: "Assemble & test.",        icon: Slice,     bg: "var(--paint-blue)"   },
];

function Hub() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, oklch(0.95 0.1 95) 0, transparent 40%), radial-gradient(circle at 80% 30%, oklch(0.93 0.1 200) 0, transparent 45%), radial-gradient(circle at 50% 90%, oklch(0.94 0.13 145) 0, transparent 50%)",
        }}
      />

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 pt-8">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_6px_0_0_var(--color-primary-shadow)]">
            <span className="kinetic-display text-xl">K!</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Learn-by-doing</p>
            <h1 className="kinetic-display text-xl leading-none">Kinesthetic Play</h1>
          </div>
        </div>
        <Link to="/kinesthetic/results" className="btn-chunky btn-chunky-ghost !text-sm !px-4 !py-2">
          <Trophy className="h-4 w-4" /> Results
        </Link>
      </header>

      <section className="mx-auto mt-6 flex w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Mascot mood="cheer" message="Pick an age group and start playing!" />
      </section>

      <AgeSection ageLabel="Ages 3 – 5" title="Early Childhood" modules={early} />
      <AgeSection ageLabel="Ages 6 – 8" title="Elementary" modules={elementary} cols={4} />

      <footer className="mx-auto mt-10 max-w-5xl px-4 pb-12 text-center text-xs text-muted-foreground">
        Each game watches how your child explores — not what they answer.
      </footer>
    </div>
  );
}

type Mod = { id: string; to: any; title: string; blurb: string; icon: any; bg: string };
function AgeSection({ ageLabel, title, modules, cols = 3 }: { ageLabel: string; title: string; modules: Mod[]; cols?: 3 | 4 }) {
  return (
    <section className="mx-auto mt-10 w-full max-w-5xl px-4">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">{ageLabel}</p>
          <h2 className="kinetic-display text-2xl">{title}</h2>
        </div>
      </div>
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${cols === 4 ? "lg:grid-cols-4" : "sm:grid-cols-3"}`}>
        {modules.map((m, i) => (
          <motion.div key={m.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: "spring", stiffness: 120, damping: 16 }}>
            <Link to={m.to} className="group block focus:outline-none">
              <div className="card-pop relative overflow-hidden p-4 transition-transform duration-150 group-hover:-translate-y-1 group-active:translate-y-0">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-2xl" style={{ backgroundColor: m.bg }} />
                <div className="relative mb-3 grid h-14 w-14 place-items-center rounded-2xl text-white shadow-[0_5px_0_0_oklch(0.4_0.1_260/0.2)]"
                  style={{ backgroundColor: m.bg }}>
                  <m.icon className="h-7 w-7" strokeWidth={2.5} />
                </div>
                <h3 className="kinetic-display text-base leading-tight">{m.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{m.blurb}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-primary">
                  Play <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
