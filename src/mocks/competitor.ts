export const competitorMockData = {
  trackedCompetitors: [
    { id: "technova", name: "TechNova", handle: "@technovahq", followers: "2.4M", status: "Active Tracking", avatar: "T" },
    { id: "creatorforge", name: "CreatorForge", handle: "@creatorforge", followers: "850K", status: "Active Tracking", avatar: "C" },
    { id: "synapse", name: "Synapse AI", handle: "@synapseai", followers: "1.2M", status: "Paused", avatar: "S" }
  ],
  profiles: {
    "technova": {
      profile: {
        id: "technova",
        name: "TechNova",
        handle: "@technovahq",
        avatar: "T",
        status: "Active Tracking",
        lastUpdated: "2 hours ago"
      },
      executiveSummary: {
        title: "Aggressive Pivot to Educational Short-Form",
        content: "TechNova has shifted away from product-feature announcements toward creator-focused educational content. Their engagement has spiked 300% over the last 30 days. They are aggressively targeting mid-market creators experiencing 'tool fatigue.'",
        keyTakeaway: "They are winning on trust, not features. We need to counter their educational hooks with high-value technical breakdowns.",
      },
      performance: {
        followers: "2.4M",
        followerGrowth: "+12.4% (30d)",
        engagementRate: "4.2%",
        engagementGrowth: "+300% (30d)",
        topFormat: "Educational Reels",
        avgViews: "185K"
      },
      positioning: {
        tagline: "The modern tool stack for serious creators.",
        coreIdentity: "Authoritative, educational, slightly contrarian.",
        marketPosition: "Premium alternative to legacy SaaS.",
        perceivedValue: "Saves time, reduces friction, scales businesses."
      },
      contentDNA: [
        { pillar: "Tool Fatigue / Burnout", frequency: "40%", format: "Talking Head + Text Hook" },
        { pillar: "Workflow Breakdowns", frequency: "35%", format: "Screen Recording + Voiceover" },
        { pillar: "Founder Stories", frequency: "25%", format: "High-production Interview" }
      ],
      captionStrategy: {
        tone: "Direct, empathetic, actionable.",
        avgLength: "Long-form (150+ words)",
        hashtags: ["#creatortools", "#creatorburnout", "#productivity"],
        primaryCTA: "Link in bio for the free workflow template.",
        ctaFrequency: "75% of posts"
      },
      audiencePsychology: {
        demographics: "Creators 25-35, $50k-$150k annual revenue.",
        painPoints: ["Overwhelmed by software subscriptions", "Algorithm burnout", "Inconsistent content quality"],
        motivations: ["Reclaiming time", "Building a predictable content engine", "Looking professional"],
        buyingTriggers: ["Feeling burned out", "Launching a new product/course"]
      },
      strengths: [
        "Extremely strong hooks (First 3 seconds are flawless)",
        "High trust factor (Founder is the face of the brand)",
        "Consistent posting schedule (Daily at 9AM EST)"
      ],
      weaknesses: [
        "Visuals are slightly repetitive (Same studio background)",
        "Little interaction in the comments section",
        "Over-reliance on 'fear of missing out' hooks"
      ],
      recommendations: [
        {
          id: "rec_1",
          title: "Counter-Position on 'Repetitive Visuals'",
          explanation: "TechNova is using the exact same studio setup daily. We can disrupt their audience's pattern recognition by launching a highly dynamic, multi-location short-form series.",
          expectedImpact: "High",
          difficulty: "Medium",
          actionLabel: "Generate 'Dynamic Scene' Blueprint",
          actionHref: "/blueprint/new?template=dynamic_scene"
        },
        {
          id: "rec_2",
          title: "Exploit the 'Community Gap'",
          explanation: "They have a 4.2% engagement rate but rarely reply to comments. Launching a highly interactive, community-driven Q&A format will capture their underserved highly-engaged users.",
          expectedImpact: "High",
          difficulty: "Low",
          actionLabel: "Generate 'Community Q&A' Blueprint",
          actionHref: "/blueprint/new?template=community_qa"
        }
      ],
      relatedBlueprints: [
        { id: "bp_12", title: "TechNova Counter-Strategy: Trust", status: "Published", lastUpdated: "5 days ago" },
        { id: "bp_14", title: "Educational Hooks v2", status: "Draft", lastUpdated: "Yesterday" }
      ]
    }
  }
}
