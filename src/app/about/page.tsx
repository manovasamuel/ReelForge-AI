import { Metadata } from "next";
import { PageContainer } from "@/components/layout";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";

export const metadata: Metadata = {
  title: "About ReelForge AI | The Science of Content Virality",
  description:
    "Learn how ReelForge AI transforms Instagram competitor analysis and content reverse-engineering into predictable viral reel scripts using data and AI.",
  alternates: {
    canonical: "https://reel-forge-ai-psi.vercel.app/about",
  },
};

export default function AboutPage() {
  return (
    <PageContainer>
      <main className="flex flex-col gap-16 pb-24 pt-20 px-4 max-w-4xl mx-auto">
        <section className="text-center mb-8">
          <Reveal variant="heroHeadline" delay={0.05}>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 pb-2">
              The Science of <span className="text-muted-foreground">Virality</span>
            </h1>
          </Reveal>
          <Reveal variant="supportingText" delay={0.1}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              ReelForge AI is a content intelligence and reverse-engineering platform built to replace algorithmic guesswork with verifiable data.
            </p>
          </Reveal>
        </section>

        {/* MISSION STATEMENT */}
        <section className="space-y-6 border-b border-border pb-12">
          <Reveal variant="supportingText" delay={0.15}>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Our Content Intelligence Mission
            </h2>
          </Reveal>
          <Reveal variant="supportingText" delay={0.2}>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Every day, creators and agencies spend countless hours brainstorming hooks, scrolling competitor feeds, and hoping the algorithm rewards their next upload. We believe short-form video engagement is fundamentally a structural engineering challenge, not an unpredictable lottery.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mt-4">
              ReelForge AI analyzes top-performing Instagram Reels frame-by-frame, extracting the underlying structural patterns—the exact 3-second hook archetypes, visual pacing duration, retention loops, and value-exchange calls to action—that drive verifiable audience retention. By transforming raw performance data into actionable production scripts, we empower creators to produce high-converting content with mathematical precision.
            </p>
          </Reveal>
        </section>

        {/* CORE ARCHITECTURAL PILLARS */}
        <section className="space-y-8">
          <Reveal variant="supportingText" delay={0.25}>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Core Engineering Pillars
            </h2>
          </Reveal>

          <StaggerGroup className="grid md:grid-cols-2 gap-8" delayChildren={0.3} staggerChildren={0.12}>
            <StaggerItem>
              <div className="border border-border bg-card p-6 rounded-none space-y-3 h-full">
                <div className="h-px w-12 bg-foreground mb-4"></div>
                <h3 className="text-lg font-bold text-foreground">Data Ingestion Over Intuition</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We interface directly with live data extraction pipelines via Apify to capture real-time Instagram metrics, follower growth velocities, reel view-to-follower ratios, and engagement distribution. No synthetic guesswork or vanity estimations.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="border border-border bg-card p-6 rounded-none space-y-3 h-full">
                <div className="h-px w-12 bg-foreground mb-4"></div>
                <h3 className="text-lg font-bold text-foreground">Content DNA Extraction</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our analysis engine deconstructs top-performing posts to map out their architectural DNA: visual cut frequencies, spoken cadence, on-screen text placement, audio choices, and psychological open loops that keep viewers glued until the final frame.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="border border-border bg-card p-6 rounded-none space-y-3 h-full">
                <div className="h-px w-12 bg-foreground mb-4"></div>
                <h3 className="text-lg font-bold text-foreground">Multi-Model AI Orchestration</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Leveraging intelligent model routing across Google Gemini, Claude, and OpenAI, ReelForge AI synthesizes extracted patterns into ready-to-record scripts tailored to your brand voice, complete with shot lists and visual cues.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="border border-border bg-card p-6 rounded-none space-y-3 h-full">
                <div className="h-px w-12 bg-foreground mb-4"></div>
                <h3 className="text-lg font-bold text-foreground">Deterministic Success Replication</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Instead of generating generic AI copy, ReelForge AI grounds every output in verified competitor performance data. You receive scripts engineered around formats that have already proven product-market fit in your niche.
                </p>
              </div>
            </StaggerItem>
          </StaggerGroup>
        </section>

        {/* WHO WE SERVE */}
        <section className="space-y-8 border-t border-border pt-12">
          <Reveal variant="supportingText" delay={0.35}>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Who ReelForge AI Serves
            </h2>
          </Reveal>

          <StaggerGroup className="grid md:grid-cols-3 gap-6" delayChildren={0.4} staggerChildren={0.1}>
            <StaggerItem>
              <div className="space-y-3">
                <h3 className="text-base font-bold text-foreground">Independent Creators</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Eliminate creative burnout and writer&apos;s block by discovering exactly what topics, angles, and formats are currently gaining traction in your category.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="space-y-3">
                <h3 className="text-base font-bold text-foreground">Marketing Agencies</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Deliver data-backed competitive intelligence dossiers and production-ready script batches to clients with predictable turnaround times.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="space-y-3">
                <h3 className="text-base font-bold text-foreground">Growth Brands</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Turn organic short-form video into a measurable acquisition channel by building content libraries around provable audience retention mechanics.
                </p>
              </div>
            </StaggerItem>
          </StaggerGroup>
        </section>
      </main>
    </PageContainer>
  );
}
