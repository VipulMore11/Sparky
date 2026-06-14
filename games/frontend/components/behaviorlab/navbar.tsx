"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggleRobust } from "@/components/theme/theme-toggle-robust";
import { Sparkles } from "lucide-react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  return (
    <header className="sticky top-0 z-40 w-full bg-background border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group cursor-pointer"
            aria-label="CogniLab home"
          >
            <div
              className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200"
              aria-hidden
            >
              <Sparkles className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-base md:text-lg font-semibold tracking-tight">
              Cogni<span className="text-primary font-bold text-xl">Lab</span>
            </span>
          </Link>

          <nav
            className="hidden md:flex items-center gap-8"
            aria-label="Primary"
          >
            <Link
              href="/games"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Games
            </Link>
            <a
              href="#pricing"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Pricing
            </a>
            <a
              href="/dashboard/experiments"
              className="text-sm text-muted-foreground hover:text-primary"
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  router.push("/login");
                }
              }}
            >
              Create Experiments
            </a>
            <a
              href="#case-studies"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Case Studies
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggleRobust />
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Sign In
            </Link>
            <Button className="bg-primary text-primary-foreground hover:brightness-95 px-4">
              Start Free Trial
            </Button>
          </div>

          <button
            className="md:hidden inline-flex items-center justify-center rounded-md border border-border px-3 py-2"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="h-4 w-4 bg-foreground" aria-hidden />
          </button>
        </div>
        {open && (
          <div
            id="mobile-menu"
            className="md:hidden mt-3 space-y-2"
            role="dialog"
            aria-label="Mobile menu"
          >
            <a
              href="#features"
              className="block text-sm py-2 text-muted-foreground hover:text-primary"
            >
              Features
            </a>
            <Link
              href="/games"
              className="block text-sm py-2 text-muted-foreground hover:text-primary"
            >
              Games
            </Link>
            <a
              href="#pricing"
              className="block text-sm py-2 text-muted-foreground hover:text-primary"
            >
              Pricing
            </a>
            <a
              href="/dashboard/experiments"
              className="block text-sm py-2 text-muted-foreground hover:text-primary"
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  router.push("/login");
                }
              }}
            >
              Create Experiments
            </a>
            <a
              href="#case-studies"
              className="block text-sm py-2 text-muted-foreground hover:text-primary"
            >
              Case Studies
            </a>
            <a
              href="#blog"
              className="block text-sm py-2 text-muted-foreground hover:text-primary"
            >
              Blog
            </a>
            <a
              href="#contact"
              className="block text-sm py-2 text-muted-foreground hover:text-primary"
            >
              Contact
            </a>
            <div className="pt-2 border-t border-border flex gap-2">
              <ThemeToggleRobust />
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Sign In
              </Link>
              <Button className="bg-primary text-primary-foreground hover:brightness-95 w-full">
                Start Free Trial
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
