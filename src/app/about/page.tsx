import { Metadata } from "next";
import { PageContainer } from "@/components/layout";

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
      <main className="flex flex-col gap-12 pb-24 pt-20 px-4 max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-6">
            About ReelForge AI
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed text-left">
            ReelForge AI was built on a simple premise: content creation shouldn't rely on guesswork. 
            By leveraging live data pipelines and advanced AI processing, we provide creators and 
            agencies with the exact structural components driving retention in their specific niches.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed text-left mt-4">
            We believe that virality is an engineering problem. With ReelForge AI, you can extract 
            the DNA of successful content and autonomously generate scripts proven to work.
          </p>
        </div>
      </main>
    </PageContainer>
  );
}
