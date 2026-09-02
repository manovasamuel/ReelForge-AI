import { Metadata } from "next";
import { PageContainer } from "@/components/layout";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about ReelForge AI and our mission.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <PageContainer>
      <main className="flex flex-col gap-16 pb-24 pt-20 px-4 max-w-4xl mx-auto">
        <section className="text-center mb-8">
          <Reveal variant="clipPath" delay={0.1}>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 pb-2">
              The Science of <span className="text-muted-foreground">Virality</span>
            </h1>
          </Reveal>
        </section>

        <section className="space-y-12">
          <Reveal variant="fadeUp" delay={0.2}>
            <p className="text-xl md:text-2xl text-foreground leading-relaxed text-left font-medium">
              ReelForge AI was built on a simple premise: content creation shouldn't rely on guesswork. 
            </p>
          </Reveal>

          <StaggerGroup className="grid md:grid-cols-2 gap-12" delayChildren={0.3} staggerChildren={0.15}>
            <StaggerItem>
              <div className="space-y-4">
                <div className="h-px w-12 bg-foreground mb-6"></div>
                <h3 className="text-lg font-bold text-foreground">Data Over Intuition</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  By leveraging live data pipelines and advanced AI processing, we provide creators and agencies with the exact structural components driving retention in their specific niches.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="space-y-4">
                <div className="h-px w-12 bg-foreground mb-6"></div>
                <h3 className="text-lg font-bold text-foreground">Engineering Success</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  We believe that virality is an engineering problem. With ReelForge AI, you can extract the DNA of successful content and autonomously generate scripts proven to work.
                </p>
              </div>
            </StaggerItem>
          </StaggerGroup>
        </section>
      </main>
    </PageContainer>
  );
}
