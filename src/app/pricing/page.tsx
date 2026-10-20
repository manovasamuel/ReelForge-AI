import Link from "next/link";
import { Metadata } from "next";
import { PageContainer } from "@/components/layout";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pricing & Plans | ReelForge AI Content Intelligence",
  description:
    "Explore transparent ReelForge AI pricing plans from Free Discovery to Pro Creator and Enterprise. Reverse-engineer viral content with zero hidden fees.",
  alternates: {
    canonical: "https://reel-forge-ai-psi.vercel.app/pricing",
  },
};

export default function PricingPage() {
  return (
    <PageContainer>
      <main className="flex flex-col gap-16 pb-24 pt-20 px-4 max-w-6xl mx-auto overflow-hidden">
        {/* HEADER */}
        <Reveal variant="heroHeadline" delay={0.05}>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4 pb-1">
              Predictable Pricing for Data-Driven Creators
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Transparent access to Instagram content intelligence, pattern reverse-engineering, and AI script generation. Zero surprise charges.
            </p>
          </div>
        </Reveal>

        {/* THREE PRICING TIERS */}
        <div className="grid gap-8 lg:grid-cols-3 items-stretch">
          {/* FREE TIER */}
          <Reveal variant="cardEnter" delay={0.15}>
            <div className="flex flex-col justify-between border border-border bg-card p-8 rounded-none h-full relative">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Evaluation Tier
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Free Discovery</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Explore competitive pattern extraction and test introductory workflows.
                </p>
                <div className="text-4xl font-bold mb-6">
                  $0<span className="text-base text-muted-foreground font-normal"> / month</span>
                </div>

                <div className="space-y-3 mb-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground shrink-0">✓</span> 20 Monthly Profile Ingestions
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground shrink-0">✓</span> 10,000 AI Tokens / month
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground shrink-0">✓</span> Deterministic Strategy Engine
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground shrink-0">✓</span> Standard PDF & Markdown Export
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground shrink-0">✓</span> Single Workspace Project
                  </div>
                </div>
              </div>

              <Link href="/sign-up" className="w-full">
                <Button variant="outline" size="lg" className="w-full text-sm font-semibold rounded-none">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </Reveal>

          {/* PRO ACCESS (FEATURED) */}
          <Reveal variant="cardEnter" delay={0.2}>
            <div className="flex flex-col justify-between border-2 border-foreground bg-card p-8 rounded-none h-full relative shadow-lg">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-mono font-bold px-3 py-1 uppercase tracking-wider">
                Most Popular
              </div>

              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Production Scale
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Pro Access</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Full multi-model AI synthesis and live scraper queues for serious creators.
                </p>
                <div className="text-4xl font-bold mb-6">
                  $49<span className="text-base text-muted-foreground font-normal"> / month</span>
                </div>

                <div className="space-y-3 mb-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground shrink-0">✓</span> 500 Live Scraper Profiles / month
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground shrink-0">✓</span> 500,000 AI Tokens / month
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground shrink-0">✓</span> Multi-Model AI (Gemini 2.5, Claude, GPT-4o)
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground shrink-0">✓</span> Priority Queue Processing
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground shrink-0">✓</span> Full Content DNA & Hook Extraction
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground shrink-0">✓</span> Unlimited Workspace Projects & Cloud Sync
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground shrink-0">✓</span> All Exports (JSON, HTML, PDF, Markdown)
                  </div>
                </div>
              </div>

              <Link href="/sign-up" className="w-full">
                <Button size="lg" className="w-full text-sm font-semibold rounded-none group">
                  Start Pro Trial
                  <span className="ml-2 h-4 w-4 inline-flex items-center justify-center font-mono leading-none transition-transform duration-200 ease-out group-hover:translate-x-[2px]">&rarr;</span>
                </Button>
              </Link>
            </div>
          </Reveal>

          {/* ENTERPRISE */}
          <Reveal variant="cardEnter" delay={0.25}>
            <div className="flex flex-col justify-between border border-border bg-card p-8 rounded-none h-full relative">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Agency & Team Suite
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Enterprise</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Custom throughput, dedicated priority queues, and white-label reporting.
                </p>
                <div className="text-4xl font-bold mb-6">
                  $199<span className="text-base text-muted-foreground font-normal"> / month</span>
                </div>

                <div className="space-y-3 mb-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground shrink-0">✓</span> Unlimited Live Scraper Profiles
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground shrink-0">✓</span> Unlimited AI Tokens & Custom Fine-Tuning
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground shrink-0">✓</span> Dedicated VIP Priority Execution Queue
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground shrink-0">✓</span> Custom API Rate Limits & SLA
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground shrink-0">✓</span> White-Label Export Formatting
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground shrink-0">✓</span> Dedicated Account Manager & Onboarding
                  </div>
                </div>
              </div>

              <Link href="/sign-up" className="w-full">
                <Button variant="outline" size="lg" className="w-full text-sm font-semibold rounded-none">
                  Contact Enterprise
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="space-y-8 border-t border-border pt-16">
          <Reveal variant="supportingText" delay={0.3}>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-muted-foreground">
                Everything you need to know about quotas, data collection, and billing policies.
              </p>
            </div>
          </Reveal>

          <StaggerGroup className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto" delayChildren={0.35} staggerChildren={0.1}>
            <StaggerItem>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-foreground">How do monthly scraper and AI token quotas work?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Quotas reset automatically at each billing cycle. Our automated UsageGuard monitors token consumption in real-time to prevent accidental overages, notifying you well before your quota is exhausted.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-foreground">Can I switch plans or cancel at any time?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Yes. All subscriptions are billed on a flexible monthly schedule with zero long-term commitments. You can upgrade, downgrade, or cancel directly through the Stripe customer portal with one click.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-foreground">Do I need to connect my personal Instagram account?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No. ReelForge AI accesses public creator data and metrics via live Apify pipelines. Your personal credentials and account tokens are never requested or stored.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-foreground">Which AI models power script generation?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pro and Enterprise accounts utilize an intelligent model router orchestrating Google Gemini 2.5 Pro, Claude 3.5 Sonnet, and OpenAI GPT-4o to provide optimal analytical depth and script creativity.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-foreground">What formats can I export my generated scripts and briefs in?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Export complete production dossiers in Markdown (.md), clean PDF briefing documents, and structured JSON. All exports include beat-by-beat visual directions, teleprompter-ready narration, on-screen text overlays, and audio cues.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-foreground">What happens when I hit my profile ingestion limit?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You retain full access to analyze, generate scripts from, and export all existing dossiers in your workspace library. You can wait for your scheduled monthly billing reset or upgrade instantly with automatic proration.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-foreground">Does ReelForge AI store or redistribute raw creator media?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No. Media is processed ephemerally solely to extract structural metadata, timing pacing, and transcripts. We never store raw video binaries on permanent storage or resell creator data to third parties.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-foreground">Are team seats and multi-user workspaces available?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pro plans are designed for individual creators and strategists with cloud sync across devices. For agencies, marketing teams, or studios requiring multi-seat role management and centralized billing, select our Enterprise plan.
                </p>
              </div>
            </StaggerItem>
          </StaggerGroup>
        </section>
      </main>
    </PageContainer>
  );
}
