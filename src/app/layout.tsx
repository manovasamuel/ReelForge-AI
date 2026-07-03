import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ReelForge AI",
    template: "%s | ReelForge AI",
  },
  description:
    "Internal AI Content Intelligence Platform — Analyze competitors, extract patterns, and generate Instagram content powered by AI.",
  keywords: [
    "Instagram",
    "content intelligence",
    "competitor analysis",
    "AI content generation",
    "reels",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex h-full overflow-hidden bg-background text-foreground">
        <TooltipProvider delay={300}>
          {/* Desktop sidebar */}
          <Sidebar />

          {/* Main content area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            <div className="flex-1 overflow-y-auto">{children}</div>
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
