import { FileText, Target, BrainCircuit, Lightbulb, TrendingUp, Sparkles, AlertCircle } from "lucide-react"

export const dashboardMockData = {
  user: {
    firstName: "Creator",
    workspaceName: "Acme Corp Content",
  },
  quickActions: [
    { id: "new_blueprint", label: "New Blueprint", icon: FileText, href: "/blueprint" },
    { id: "analyze_competitor", label: "Analyze Competitor", icon: Target, href: "/competitor" },
    { id: "import_brand", label: "Import Brand", icon: BrainCircuit, href: "/brand" },
    { id: "view_intelligence", label: "View Intelligence", icon: Lightbulb, href: "/analytics" },
  ],
  kpis: [
    { 
      id: "blueprints", 
      label: "Active Blueprints", 
      value: "12", 
      trend: "+3 this week", 
      trendDirection: "up", 
      icon: FileText 
    },
    { 
      id: "competitors", 
      label: "Tracked Competitors", 
      value: "4", 
      trend: "Stable", 
      trendDirection: "neutral", 
      icon: Target 
    },
    { 
      id: "memory", 
      label: "Memory Layers", 
      value: "L3", 
      trend: "Brand Voice active", 
      trendDirection: "up", 
      icon: BrainCircuit 
    },
    { 
      id: "suggestions", 
      label: "AI Suggestions", 
      value: "8", 
      trend: "Requires review", 
      trendDirection: "warning", 
      icon: Sparkles 
    }
  ],
  aiActivity: [
    {
      id: "act_1",
      title: "Viral hook detected",
      description: "Competitor 'TechNova' posted a reel outperforming their baseline by 300%.",
      timestamp: "2 hours ago",
      actionLabel: "Analyze Competitor",
      actionHref: "/competitor/technova",
      icon: TrendingUp,
      type: "insight"
    },
    {
      id: "act_2",
      title: "Blueprint draft incomplete",
      description: "The 'Q3 Product Launch' blueprint is missing a pacing guide.",
      timestamp: "5 hours ago",
      actionLabel: "Continue Editing",
      actionHref: "/blueprint/draft/q3",
      icon: AlertCircle,
      type: "warning"
    },
    {
      id: "act_3",
      title: "Audience insight generated",
      description: "New pain point identified: 'Tool fatigue' among mid-market creators.",
      timestamp: "1 day ago",
      actionLabel: "View Insight",
      actionHref: "/audience/insights",
      icon: Lightbulb,
      type: "insight"
    }
  ],
  recentBlueprints: [
    {
      id: "bp_1",
      title: "Q3 Product Launch Series",
      status: "Draft",
      lastModified: "2 hours ago",
    },
    {
      id: "bp_2",
      title: "Founder Story - Episode 4",
      status: "Ready",
      lastModified: "Yesterday",
    },
    {
      id: "bp_3",
      title: "Feature Highlight: Layered Memory",
      status: "Published",
      lastModified: "3 days ago",
    },
    {
      id: "bp_4",
      title: "Top 5 Mistakes in AI Content",
      status: "Draft",
      lastModified: "1 week ago",
    }
  ],
  workspaceInsights: [
    {
      id: "wi_1",
      title: "Brand Voice Alignment",
      description: "Recent blueprints match your L3 memory profile with 94% accuracy.",
    }
  ]
}
