import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Learning Style Assessment" },
      { name: "description", content: "Identify how a child learns through interactive game modules." },
      { property: "og:title", content: "Learning Style Assessment" },
      { property: "og:description", content: "Identify how a child learns through interactive game modules." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-3">🎮</div>
        <h1 className="text-3xl font-extrabold tracking-tight">Learning Style Modules</h1>
        <p className="text-muted-foreground mt-2">Onboarding & home are handled separately. Jump straight to the Kinesthetic module dev picker.</p>
        <Link to="/kinesthetic" className="btn-pop mt-6 inline-flex">Open Kinesthetic module →</Link>
      </div>
    </div>
  );
}
