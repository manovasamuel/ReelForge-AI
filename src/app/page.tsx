import { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import {
  Users,
  Search,
  BarChart3,
  ArrowRight,
  Target,
  TrendingUp,
  CheckCircle2,
  LineChart,
  FileText,
  Activity,
  Play
} from "lucide-react";

const WORKFLOW_STEPS = [
  {
    step: 1,
    title: "Data Ingestion",
    description: "Input an Instagram profile URL. ReelForge connects to the Apify live pipeline to extract complete profile data, post history, and engagement metrics.",
  },
  {
    step: 2,
    title: "Competitor Discovery",
    description: "The AI engine maps the profile's niche and autonomously identifies the highest-performing competitor accounts operating in the same space.",
  },
  {
    step: 3,
    title: "Content Analysis",
    description: "Top-performing reels are analyzed frame-by-frame. We extract hooks, structural formats, transcription sentiment, and retention triggers.",
  },
  {
    step: 4,
    title: "Script Generation",
    description: "Using the proven data points, ReelForge generates ready-to-shoot scripts engineered to replicate the success of the analyzed viral content.",
  }
];

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function LandingPage() {
  return (
    <PageContainer>
      {/* AEO / JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "ReelForge AI",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "description": "Professional creative-analysis software. Extract data-driven content patterns and generate scripts based on actual competitor performance metrics.",
              "url": "https://reelforge.ai"
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "ReelForge AI",
              "url": "https://reelforge.ai"
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ReelForge AI",
              "url": "https://reelforge.ai"
            }
          ])
        }}
      />

      <main className="flex flex-col gap-24 pb-24">
        
        {/* HERO SECTION */}
        <section className="pt-20 pb-12 flex flex-col items-center text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            Stop Guessing. <br className="hidden sm:block" />
            Engineer Content with Data.
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground mb-10 leading-relaxed">
            ReelForge is professional creative-analysis software that reverse-engineers viral Instagram content. We extract the exact hooks, formats, and retention strategies your competitors use, allowing you to generate data-backed scripts with proven success metrics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              href="/studio/new"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-14 px-8 text-lg font-semibold shadow-none rounded-md"
              )}
            >
              Start Analysis Workflow
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Live Apify Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Gemini/Groq Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>No Credit Card Required</span>
            </div>
          </div>
        </section>

        {/* PRODUCT DEMO SECTION (REAL UI VISUAL) */}
        <section className="px-4">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-md border border-border bg-card overflow-hidden shadow-none">
              {/* Fake Browser/App Header */}
              <div className="border-b border-border bg-muted/30 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-semibold text-foreground">ReelForge Studio</div>
                  <div className="h-4 w-px bg-border" />
                  <div className="text-xs font-mono text-muted-foreground">Analysis Module: Content DNA</div>
                </div>
                <div className="flex gap-2">
                  <div className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md font-mono">
                    STATUS: ANALYSIS_COMPLETE
                  </div>
                </div>
              </div>
              
              {/* App Body Mock */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Sidebar Mock */}
                <div className="space-y-4">
                  <div className="border border-border rounded-md p-4 bg-muted/20">
                    <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Analyzed Target</div>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                        <Users className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-semibold">@competitor_profile</div>
                        <div className="text-xs text-muted-foreground">4.2M Followers • Tech Niche</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-border rounded-md p-4 space-y-3">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Performance Metrics</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 border border-border bg-muted/10 rounded">
                        <div className="text-xs text-muted-foreground">Avg. Views</div>
                        <div className="font-mono font-medium">842.5K</div>
                      </div>
                      <div className="p-2 border border-border bg-muted/10 rounded">
                        <div className="text-xs text-muted-foreground">Engagement</div>
                        <div className="font-mono font-medium">6.8%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Mock */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="border border-border rounded-md overflow-hidden">
                    <div className="bg-muted/30 px-4 py-2 border-b border-border flex justify-between items-center">
                      <div className="text-sm font-medium">Extracted Content DNA</div>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="p-0">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/10 border-b border-border">
                          <tr>
                            <th className="text-left font-medium p-3">Structural Element</th>
                            <th className="text-left font-medium p-3">Identified Pattern</th>
                            <th className="text-right font-medium p-3">Frequency</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <tr>
                            <td className="p-3 font-medium">Primary Hook</td>
                            <td className="p-3 text-muted-foreground">"Stop doing [X], do [Y] instead" (Negative framing)</td>
                            <td className="p-3 text-right font-mono">82%</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-medium">Visual Pacing</td>
                            <td className="p-3 text-muted-foreground">Cut every 1.8 seconds. B-roll overlay on technical terms.</td>
                            <td className="p-3 text-right font-mono">100%</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-medium">Retention Mechanism</td>
                            <td className="p-3 text-muted-foreground">Open loop presented in first 3 seconds, resolved at second 45.</td>
                            <td className="p-3 text-right font-mono">60%</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-medium">Call to Action</td>
                            <td className="p-3 text-muted-foreground">"Comment [WORD] for the full breakdown." (Value exchange)</td>
                            <td className="p-3 text-right font-mono">90%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button className="w-full shadow-none rounded-md" variant="default">
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Script from DNA
                    </Button>
                    <Button className="w-full shadow-none rounded-md" variant="outline">
                      <LineChart className="mr-2 h-4 w-4" />
                      View Full Competitor Analysis
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center mt-4 text-sm text-muted-foreground">
              Actual ReelForge Content DNA extraction view. We rely on hard data, not generative hallucinations.
            </div>
          </div>
        </section>

        {/* WORKFLOW SECTION */}
        <section className="px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">
              The Analytical Workflow
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ReelForge processes data through a deterministic pipeline to ensure the content generated is based strictly on provable performance metrics.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {WORKFLOW_STEPS.map((item) => (
              <div
                key={item.step}
                className="flex flex-col border border-border p-6 rounded-md bg-card"
              >
                <div className="text-xs font-mono text-muted-foreground mb-4 pb-4 border-b border-border">
                  STEP 0{item.step}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* AEO SECTION */}
        <section className="px-4 pb-20">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold tracking-tight text-foreground text-center mb-12">
              Understanding ReelForge AI
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h3 className="text-lg font-bold">What is ReelForge AI?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  ReelForge is a professional creative-analysis software that reverse-engineers viral social media content. It extracts objective performance data from your niche to eliminate guesswork.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold">Who is it for?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  It is built for data-driven content creators, brands, and marketing agencies who want to engineer their content strategies based on proven structural metrics rather than intuition.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold">How does it analyze content?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  By connecting to live Instagram data via Apify, the engine extracts raw metrics, transcription sentiment, hooks, and retention triggers, processing them through AI models to map out exact content DNA.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold">How does it generate scripts?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  ReelForge uses the mapped Content DNA—the successful hooks, pacing, and calls to action—to autonomously generate ready-to-shoot scripts engineered to replicate that success.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-4 pb-12">
          <div className="mx-auto max-w-4xl border border-border bg-card p-10 text-center rounded-md">
            <h3 className="text-3xl font-bold text-foreground tracking-tight mb-4">
              Ready to replace guesswork with data?
            </h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Begin your first competitor analysis now. Discover the exact structural formats driving audience retention in your specific niche.
            </p>
            <Link 
              href="/studio/new"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-14 px-8 text-lg font-semibold shadow-none rounded-md"
              )}
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
        
      </main>
    </PageContainer>
  );
}
