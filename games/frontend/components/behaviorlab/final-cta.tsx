import { Button } from "@/components/ui/button"

export function FinalCTA() {
  return (
    <section className="bg-primary text-primary-foreground" aria-labelledby="final-cta">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <div className="text-center">
          <h2 id="final-cta" className="text-3xl md:text-5xl font-bold text-balance">
            Ready to Scale Your Research?
          </h2>
          <p className="mt-3 text-base/relaxed opacity-90">
            Start your 14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>
        <form className="mx-auto mt-8 max-w-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              placeholder="Enter your academic email"
              className="flex-1 rounded-md border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Email"
            />
            <Button type="submit" className="bg-background text-foreground hover:brightness-95 px-6 py-3 font-semibold">
              Start Free Trial
            </Button>
          </div>
        </form>
        <ul className="mt-4 flex flex-wrap justify-center gap-4 text-sm opacity-90">
          <li>✓ No credit card required</li>
          <li>✓ 14-day free trial</li>
          <li>✓ Cancel anytime</li>
        </ul>
      </div>
    </section>
  )
}
