import { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { Users, Search, BarChart3, ArrowRight, Target, TrendingUp, CheckCircle2, LineChart, FileText, Activity, Play } from "lucide-react";

const WORKFLOW_STEPS = [
  {
    step: 1,
    title: "Data Ingestion",
    description: "Input an Instagram profile URL. ReelForge AI connects to the Apify live pipeline to extract complete profile data, post history, and engagement metrics.",
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
    description: "Using the proven data points, ReelForge AI generates ready-to-shoot scripts engineered to replicate the success of the analyzed viral content.",
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
              "url": "https://reel-forge-ai-psi.vercel.app"
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "ReelForge AI",
              "url": "https://reel-forge-ai-psi.vercel.app"
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ReelForge AI",
              "url": "https://reel-forge-ai-psi.vercel.app"
            }
          ])
        }}
      />

      <main className="flex flex-col gap-24 pb-24">
        
        {/* HERO SECTION */}
        <section className="pt-20 pb-12 flex flex-col items-center text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            Engineer Content with Data.
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground mb-10 leading-relaxed">
            ReelForge AI is professional creative-analysis software that reverse-engineers viral Instagram content. We extract the exact hooks, formats, and retention strategies your competitors use, allowing you to generate data-backed scripts with proven success metrics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              href="/studio/new"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-14 px-8 text-lg font-semibold shadow-none rounded-none border border-foreground"
              )}
            >
              Start Analysis Workflow
              <span className="ml-2 h-5 w-5 border border-foreground inline-flex items-center justify-center font-mono text-sm leading-none pt-0.5">&rarr;</span>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-foreground"></span>
              <span>Live Apify Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-foreground"></span>
              <span>Gemini/Groq Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-foreground"></span>
              <span>Open Data Model</span>
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
              ReelForge AI processes data through a deterministic pipeline to ensure the content generated is based strictly on provable performance metrics.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {WORKFLOW_STEPS.map((item) => (
              <div
                key={item.step}
                className="flex flex-col border border-border p-6 rounded-none bg-card"
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
                  ReelForge AI is a professional creative-analysis software that reverse-engineers viral social media content. It extracts objective performance data from your niche to eliminate guesswork.
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
                  ReelForge AI uses the mapped Content DNA—the successful hooks, pacing, and calls to action—to autonomously generate ready-to-shoot scripts engineered to replicate that success.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-4 pb-12">
          <div className="mx-auto max-w-4xl border border-border bg-card p-10 text-center rounded-none">
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
                "h-14 px-8 text-lg font-semibold shadow-none rounded-none border border-foreground"
              )}
            >
              Get Started Now
              <span className="ml-2 h-5 w-5 border border-foreground inline-flex items-center justify-center font-mono text-sm leading-none pt-0.5">&rarr;</span>
            </Link>
          </div>
        </section>
        
        {/* FOOTER / INTERNAL LINKS */}
        <footer className="px-4 border-t border-border mt-12 pt-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <div className="mb-4 md:mb-0">
              © {new Date().getFullYear()} ReelForge AI. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Link href="/about" className="hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/pricing" className="hover:text-foreground transition-colors">
                Pricing
              </Link>
            </div>
          </div>
        </footer>
        
      </main>
    </PageContainer>
  );
}
