"use client";
import { Navbar } from "@/components/behaviorlab/navbar";
import { Hero } from "@/components/behaviorlab/hero";
import { Problem } from "@/components/behaviorlab/problem";
import { SolutionTabs } from "@/components/behaviorlab/solution-tabs";
import { HowItWorks } from "@/components/behaviorlab/how-it-works";
import { Features } from "@/components/behaviorlab/features";
import { Pricing } from "@/components/behaviorlab/pricing";
import { FinalCTA } from "@/components/behaviorlab/final-cta";
import { SiteFooter } from "@/components/behaviorlab/footer";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export default function HomePage() {

  const { getOrganization } = useAuthStore();
  useEffect(() => {
    getOrganization();
  }, [getOrganization]);

  return (
    <>
      <Navbar />
      <main id="main" className="min-h-dvh">
        <Hero />
        <Problem />
        <SolutionTabs />
        <HowItWorks />
        <Features />
        <Pricing />
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}
