import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export function Pricing() {
  return (
    <section
      id="pricing"
      className="bg-background"
      aria-labelledby="pricing-title"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <h2
          id="pricing-title"
          className="text-center text-3xl md:text-4xl font-bold"
        >
          Plans for Every Research Need
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Tier
            title="Student"
            price="₹0"
            badge={{
              text: "Free Forever",
              className: "bg-green-500 text-white",
            }}
            button={{ text: "Start Free", variant: "outline" }}
            features={["1 active study", "Basic builder", "Email support"]}
            className="border-2 border-border"
          />
          <Tier
            title="Researcher"
            price="₹4,000/month"
            badge={{
              text: "Most Popular",
              className: "bg-primary text-primary-foreground",
            }}
            featured
            button={{ text: "Start 14-Day Free Trial", variant: "solid" }}
            features={[
              "Unlimited studies",
              "Advanced builder",
              "Live analytics",
              "Priority support",
            ]}
            className="border-[3px] border-primary shadow-md"
          />
          <Tier
            title="Lab License"
            price="₹16,500/month"
            badge={{
              text: "Enterprise",
              className: "bg-accent text-accent-foreground",
            }}
            button={{ text: "Contact Sales", variant: "outline" }}
            features={[
              "Everything in Researcher",
              "Team seats",
              "SAML SSO",
              "Custom security and DPA",
            ]}
            className="border-2 border-accent"
          />
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          All plans include: 99.8% timing precision • Cloud storage • GDPR
          compliance
        </p>

        <div className="mt-10 max-w-3xl mx-auto">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>
                Do I need a credit card to start?
              </AccordionTrigger>
              <AccordionContent>
                No. You can start the free trial without a credit card.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                Is CogniLab validated for timing precision?
              </AccordionTrigger>
              <AccordionContent>
                Yes. Our engine is peer-reviewed and lab-validated across
                diverse devices.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
}

function Tier({
  title,
  price,
  features,
  badge,
  button,
  className,
  featured,
}: {
  title: string;
  price: string;
  features: string[];
  badge: { text: string; className: string };
  button: { text: string; variant: "solid" | "outline" };
  className?: string;
  featured?: boolean;
}) {
  return (
    <div className={`rounded-lg bg-card p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        <span
          className={`rounded-md px-2 py-1 text-xs font-medium ${badge.className}`}
        >
          {badge.text}
        </span>
      </div>
      <div className="mt-2 text-3xl font-bold">{price}</div>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {features.map((f) => (
          <li key={f}>✓ {f}</li>
        ))}
      </ul>
      <div className="mt-6">
        {button.variant === "solid" ? (
          <Button className="w-full bg-primary text-primary-foreground hover:brightness-95">
            {button.text}
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
          >
            {button.text}
          </Button>
        )}
      </div>
      {featured && (
        <div className="mt-2 text-center text-xs text-muted-foreground">
          No credit card required
        </div>
      )}
    </div>
  );
}
