import { Metadata } from "next";
import { PageContainer } from "@/components/layout";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for ReelForge AI.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return (
    <PageContainer>
      <main className="flex flex-col gap-12 pb-24 pt-20 px-4 max-w-5xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional access to content intelligence. No hidden fees.
          </p>
        </div>
        
        <div className="mx-auto w-full max-w-md border border-border bg-card p-8 rounded-md text-center">
          <h2 className="text-2xl font-bold mb-2">Pro Access</h2>
          <div className="text-4xl font-bold mb-6">$49<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
          <ul className="text-left space-y-3 mb-8 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">✓ Unlimited Competitor Discovery</li>
            <li className="flex items-center gap-2">✓ Full Content DNA Extraction</li>
            <li className="flex items-center gap-2">✓ Advanced Script Generation</li>
            <li className="flex items-center gap-2">✓ Live Apify Pipeline Access</li>
          </ul>
          <button className="w-full bg-foreground text-background py-2 rounded-md font-medium">
            Start Free Trial
          </button>
        </div>
      </main>
    </PageContainer>
  );
}
