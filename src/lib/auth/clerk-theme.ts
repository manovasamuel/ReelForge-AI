import { dark, shadcn } from "@clerk/themes";

/**
 * Cohesive Clerk Appearance Configuration for ReelForge AI.
 * Harmonizes Clerk modals, sign-in, sign-up, user button, and account management
 * with the application's layered neutral design system and tokens.
 */
export function getClerkAppearance(isDark: boolean) {
  return {
    baseTheme: isDark ? [dark, shadcn] : [shadcn],
    variables: {
      colorPrimary: isDark ? "#f4f4f5" : "#09090b",
      colorPrimaryForeground: isDark ? "#09090b" : "#ffffff",
      colorBackground: isDark ? "#18181b" : "#ffffff",
      colorInputBackground: isDark ? "#121214" : "#f4f4f5",
      colorInputText: isDark ? "#f4f4f5" : "#09090b",
      colorText: isDark ? "#f4f4f5" : "#09090b",
      colorTextSecondary: isDark ? "#a1a1aa" : "#71717a",
      colorNeutral: isDark ? "#f4f4f5" : "#09090b",
      colorTextOnPrimaryBackground: isDark ? "#09090b" : "#ffffff",
      borderRadius: "0px",
      fontFamily: "var(--font-sans), sans-serif",
    },
    elements: {
      rootBox: "mx-auto w-full",
      card: "bg-card border border-border shadow-xl rounded-none text-foreground",
      cardBox: "shadow-none rounded-none border border-border bg-card",
      modalBackdrop: "bg-black/80 backdrop-blur-xs",
      modalContent: "bg-card border border-border shadow-2xl rounded-none text-foreground overflow-hidden max-w-4xl",
      modalCloseButton: "text-muted-foreground hover:text-foreground hover:bg-muted rounded-none size-8 flex items-center justify-center transition-colors transform-none hover:transform-none",
      userProfileModal: "bg-card border border-border text-foreground",
      userProfileRoot: "bg-card text-foreground",
      userProfileCard: "bg-card border border-border text-foreground shadow-none rounded-none",
      navbar: "border-r border-border bg-muted/40 text-foreground",
      navbarButton: "text-muted-foreground hover:text-foreground hover:bg-muted rounded-none transition-colors",
      navbarButtonActive: "text-foreground bg-muted font-medium rounded-none",
      pageScrollBox: "bg-card text-foreground",
      scrollBox: "bg-card text-foreground",
      headerTitle: "text-foreground font-semibold text-lg tracking-tight",
      headerSubtitle: "text-muted-foreground text-sm",
      socialButtonsBlockButton: "bg-muted/40 border border-border text-foreground hover:bg-muted transition-colors rounded-none font-medium",
      socialButtonsBlockButtonText: "text-foreground font-medium",
      socialButtonsProviderIcon: "text-foreground",
      dividerLine: "bg-border",
      dividerText: "text-muted-foreground text-xs uppercase tracking-wider",
      formFieldLabel: "text-foreground text-xs font-medium uppercase tracking-wider",
      formFieldInput: "bg-background border border-input text-foreground rounded-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-all",
      formButtonPrimary: isDark
        ? "bg-foreground text-background hover:opacity-90 rounded-none font-semibold transition-opacity tracking-tight shadow-sm"
        : "bg-foreground text-background hover:opacity-90 rounded-none font-semibold transition-opacity tracking-tight shadow-sm",
      footerActionLink: "text-foreground font-medium underline underline-offset-4 hover:opacity-80 transition-opacity",
      footerActionText: "text-muted-foreground text-sm",
      footer: "bg-transparent text-muted-foreground border-t border-border/50",
      userButtonPopoverCard: "bg-card border border-border shadow-2xl rounded-none text-foreground p-0 min-w-[240px]",
      userButtonPopoverFooter: "border-t border-border bg-muted/20",
      userButtonPopoverActionButton: "text-foreground hover:bg-muted hover:text-foreground rounded-none transition-colors",
      userButtonPopoverActionButtonText: "text-foreground text-sm font-medium",
      userButtonPopoverActionButtonIcon: "text-muted-foreground",
      identityPreview: "bg-muted/40 border border-border text-foreground rounded-none",
      identityPreviewText: "text-foreground text-sm",
      identityPreviewEditButton: "text-foreground hover:opacity-80",
      badge: "bg-muted border border-border text-foreground font-medium rounded-none",
      profileSection: "border-b border-border py-4",
      profileSectionTitle: "text-foreground font-semibold text-base",
      profileSectionTitleText: "text-foreground font-semibold",
      profileSectionSubtitleText: "text-muted-foreground text-xs",
      profileSectionContent: "text-foreground",
      avatarBox: "rounded-none border border-border",
      userButtonAvatarBox: "w-9 h-9 rounded-full ring-2 ring-border hover:ring-foreground/50 transition-all",
    },
  };
}
