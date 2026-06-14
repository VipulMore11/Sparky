import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Home, Hammer, Flower2, MapPinned, Slice, ArrowRight, Trophy } from "lucide-react";
import { Mascot } from "@/components/kinesthetic/Mascot";

export const Route = createFileRoute("/elementary/")({
  head: () => ({
    meta: [
      { title: "Elementary Quests — Ages 6–8" },
      { name: "description", content: "Puzzle-style STEM games that reveal kinesthetic learning in elementary kids." },
    ],
  }),
  component: Hub,
});

const modules = [
  {
    id: "animal-house",
    to: "/elementary/animal-house" as const,
    title: "Animal House Builder",
    blurb: "Build homes that won't fall down.",
    icon: Hammer,
    bg: "var(--paint-orange)",
    chip: "Shapes & balance",
  },
  {
    id: "garden",
    to: "/elementary/garden" as const,
    title: "Garden Creator",
    blurb: "Tune water, sun, shade — grow the happiest flower.",
    icon: Flower2,
    bg: "var(--paint-green)",
    chip: "Variables",
  },
  {
    id: "puppy-maze",
    to: "/elementary/puppy-maze" as const,
    title: "Lost Puppy Maze",
    blurb: "Move rocks. Make a path home.",
    icon: MapPinned,
    bg: "var(--paint-purple)",
    chip: "Spatial reasoning",
  },
  {
    id: "playground",
    to: "/elementary/playground" as const,
    title: "Build a Playground",
    blurb: "Snap a slide together, test the ball.",
    icon: Slice,
    bg: "var(--paint-blue)",
    chip: "Structures",
  },
];

function Hub() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 10%, oklch(0.94 0.13 145) 0, transparent 38%), radial-gradient(circle at 88% 20%, oklch(0.92 0.16 95) 0, transparent 42%), radial-gradient(circle at 50% 95%, oklch(0.92 0.13 305) 0, transparent 50%)",
        }}
      />

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 pt-8">
        <Link to="/" className="btn-chunky btn-chunky-ghost !text-sm !px-4 !py-2"><Home className="h-4 w-4" /> Home</Link>
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">Ages 6 – 8</p>
            <h1 className="kinetic-display text-xl leading-none text-right">Elementary Quests</h1>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-secondary-foreground shadow-[0_6px_0_0_var(--color-secondary-shadow)]">
            <span className="kinetic-display text-xl">E!</span>
          </div>
        </div>
      </header>

      <section className="mx-auto mt-6 flex w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Mascot mood="cheer" message="Four puzzles. Build, test, fix, win!" />
        <Link to="/kinesthetic/results" className="btn-chunky btn-chunky-secondary !text-sm !px-4 !py-2">
          <Trophy className="h-4 w-4" /> Results
        </Link>
      </section>

      <section className="mx-auto mt-8 grid w-full max-w-5xl grid-cols-1 gap-5 px-4 sm:grid-cols-2">
        {modules.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 120, damping: 16 }}
          >
            <Link to={m.to} className="group block focus:outline-none">
              <div className="card-pop relative overflow-hidden p-5 transition-transform duration-150 group-hover:-translate-y-1 group-active:translate-y-0">
                <div
                  className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-2xl"
                  style={{ backgroundColor: m.bg }}
                />
                <div className="relative flex items-start gap-4">
                  <div
                    className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl text-white shadow-[0_6px_0_0_oklch(0.4_0.1_260/0.25)]"
                    style={{ backgroundColor: m.bg }}
                  >
                    <m.icon className="h-9 w-9" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">{m.chip}</p>
                    <h3 className="kinetic-display mt-1 text-lg leading-tight">{m.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{m.blurb}</p>
                    <div className="mt-3 inline-flex items-center gap-1 text-sm font-extrabold text-primary">
                      Start <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </section>

      <footer className="mx-auto mt-10 max-w-5xl px-4 pb-12 text-center text-xs text-muted-foreground">
        We watch HOW kids tinker — not whether they get it right the first time.
      </footer>
    </div>
  );
}
