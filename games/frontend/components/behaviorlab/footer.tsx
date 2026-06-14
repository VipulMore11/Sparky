"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export function SiteFooter() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  return (
    <footer
      className="bg-accent text-accent-foreground"
      aria-labelledby="footer"
    >
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-[6px] bg-primary" aria-hidden />
              <span className="font-semibold">CogniLab</span>
            </div>
            <p className="mt-3 text-sm opacity-80">
              Lab-grade behavioral research platform for psychologists and
              cognitive scientists.
            </p>
          </div>
          <div>
            <div className="font-semibold">Product</div>
            <ul className="mt-3 space-y-2 text-sm opacity-90">
              <li>
                <a href="#features" className="hover:underline">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:underline">
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="/dashboard/experiments"
                  className="hover:underline"
                  onClick={(e) => {
                    if (!isAuthenticated) {
                      e.preventDefault();
                      router.push("/login");
                    }
                  }}
                >
                  Create Experiments
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Company</div>
            <ul className="mt-3 space-y-2 text-sm opacity-90">
              <li>
                <a href="#case-studies" className="hover:underline">
                  Case Studies
                </a>
              </li>
              <li>
                <a href="#blog" className="hover:underline">
                  Blog
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:underline">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Legal</div>
            <ul className="mt-3 space-y-2 text-sm opacity-90">
              <li>
                <a href="#privacy" className="hover:underline">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:underline">
                  Terms
                </a>
              </li>
              <li>
                <a href="#security" className="hover:underline">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/20 pt-6 flex items-center justify-between">
          <p className="text-sm opacity-80">
            © {new Date().getFullYear()} CogniLab. All rights reserved.
          </p>
          <div>
            <label className="sr-only" htmlFor="lang">
              Language
            </label>
            <select
              id="lang"
              className="rounded-md bg-background text-foreground px-2 py-1"
            >
              <option>English</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
}
