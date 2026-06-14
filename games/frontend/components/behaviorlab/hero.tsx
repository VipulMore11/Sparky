"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function Hero() {
  const router = useRouter();
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-balance text-4xl md:text-6xl font-bold tracking-tight">
              Lab-Grade Behavioral Research, Anywhere in the World
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Design, deploy, and analyze psychology experiments with
              millisecond precision—no coding required.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="default" size="lg" onClick={() => router.push("/login")}>
                Get Started for Free <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div
            aria-hidden
            className="relative min-h-[280px] md:min-h-[360px] rounded-lg border border-border"
          >
            <img
              src="/hero-section.svg"
              alt="BehaviorLab Platform Interface"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
