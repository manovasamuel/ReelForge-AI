import type { Metadata } from "next";
// Custom typography will use standard native fonts to avoid generic SaaS looks
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastContainer } from "@/components/ui/toast";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ClerkProviderWrapper } from "@/lib/auth/clerk-provider-wrapper";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://reelforge.ai"),
  title: {
    default: "ReelForge AI | Extract Winning Patterns & Generate Viral Reels",
    template: "%s | ReelForge AI",
  },
  description:
    "Extract winning content patterns and generate viral Instagram Reels with AI. Discover competitors, analyze top reels, and create full content packages in seconds.",
  keywords: [
    "Instagram Reels",
    "content intelligence",
    "competitor analysis",
    "AI content generator",
    "viral reels maker",
    "ReelForge AI",
    "social media AI",
  ],
  // Removed hardcoded global canonical to allow page-level definitions
  openGraph: {
    title: "ReelForge AI | Extract Winning Patterns & Generate Viral Reels",
    description: "Analyze competitors, extract patterns, and generate high-converting Instagram content powered by AI.",
    url: "https://reelforge.ai",
    siteName: "ReelForge AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReelForge AI | Generate Viral Reels with AI",
    description: "Extract winning content patterns and generate viral Instagram Reels in seconds.",
    creator: "@reelforgeai",
  },
};

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="font-sans h-full antialiased"
      suppressHydrationWarning
    >
      <body className="flex h-full overflow-hidden bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProviderWrapper>
            <TooltipProvider delay={300}>
              {/* Desktop sidebar */}
              <Sidebar />

              {/* Main content area */}
              <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <div className="flex-1 overflow-y-auto">{children}</div>
              </div>
              <ToastContainer />
            </TooltipProvider>
          </ClerkProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
