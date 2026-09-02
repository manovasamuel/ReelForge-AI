import { Metadata } from "next";
import { PageContainer } from "@/components/layout";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { Button } from "@/components/ui/button";

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
      <main className="flex flex-col gap-12 pb-24 pt-20 px-4 max-w-5xl mx-auto overflow-hidden">
        <Reveal variant="heroHeadline" delay={0.05}>
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4 pb-1">
              Pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional access to content intelligence. No hidden fees.
            </p>
          </div>
        </Reveal>
        
        <Reveal variant="cardEnter" delay={0.15}>
          <div className="mx-auto w-full max-w-md border border-border bg-card p-8 rounded-none text-center">
            <h2 className="text-2xl font-bold mb-2">Pro Access</h2>
            <div className="text-4xl font-bold mb-6">$49<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
            
            <StaggerGroup className="text-left space-y-3 mb-8 text-sm text-muted-foreground" delayChildren={0.25} staggerChildren={0.1}>
              <StaggerItem className="flex items-center gap-2">
                <span className="text-foreground shrink-0">✓</span> Unlimited Competitor Discovery
              </StaggerItem>
              <StaggerItem className="flex items-center gap-2">
                <span className="text-foreground shrink-0">✓</span> Full Content DNA Extraction
              </StaggerItem>
              <StaggerItem className="flex items-center gap-2">
                <span className="text-foreground shrink-0">✓</span> Advanced Script Generation
              </StaggerItem>
              <StaggerItem className="flex items-center gap-2">
                <span className="text-foreground shrink-0">✓</span> Live Apify Pipeline Access
              </StaggerItem>
            </StaggerGroup>
            
            <Reveal variant="buttonEnter" delay={0.4}>
              <Button size="lg" className="w-full text-base font-semibold group rounded-none transition-transform duration-200 ease-out hover:-translate-y-[1px] hover:shadow-sm">
                Start Free Trial
                <span className="ml-2 h-4 w-4 inline-flex items-center justify-center font-mono leading-none transition-transform duration-200 ease-out group-hover:translate-x-[2px]">&rarr;</span>
              </Button>
            </Reveal>
          </div>
        </Reveal>
      </main>
    </PageContainer>
  );
}
