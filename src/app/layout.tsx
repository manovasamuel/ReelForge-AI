import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastContainer } from "@/components/ui/toast";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ClerkProviderWrapper } from "@/lib/auth/clerk-provider-wrapper";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const GOOGLE_ADS_ID = "AW-18396355739";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://reel-forge-ai-psi.vercel.app"),
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
    url: "https://reel-forge-ai-psi.vercel.app",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Google Ads tag (gtag.js) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-ads-config" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
          `}
        </Script>

        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1723457092829418');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1723457092829418&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
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
