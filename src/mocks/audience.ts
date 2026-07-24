export const audienceMockData = {
  profile: {
    id: "acme_core_audience",
    name: "Acme Core Audience",
    status: "Active Tracking",
    healthScore: "88/100",
    lastUpdated: "Just now"
  },
  executiveSummary: {
    title: "High Intent, High Friction",
    content: "The primary audience consists of experienced creators hitting operational bottlenecks. They possess strong intent to upgrade their workflows but experience high friction during adoption due to 'tool fatigue' and fear of disruption. Educational content that bridges this trust gap is our highest leverage opportunity.",
    keyTakeaway: "Stop selling features. Start selling operational stability and time reclamation."
  },
  personas: [
    {
      id: "persona_1",
      name: "The Burned-Out Solo",
      archetype: "Solo Creator",
      quote: "\"I spend more time managing my content system than actually creating.\"",
      goals: ["Reclaim 10 hours a week", "Automate cross-platform posting", "Maintain consistent quality"],
      painPoint: "Tool fatigue and context switching.",
      preferredFormat: "Short-form actionable workflows (Reels/Shorts)",
      primaryCTA: "Get the Free Template"
    },
    {
      id: "persona_2",
      name: "The Scaling Agency",
      archetype: "Agency Founder",
      quote: "\"I need a system that my junior editors can execute without my constant oversight.\"",
      goals: ["Standardize client deliverables", "Remove themselves from the bottleneck", "Increase profit margins"],
      painPoint: "Inconsistent brand voice across team members.",
      preferredFormat: "Long-form strategic breakdowns (YouTube/Webinars)",
      primaryCTA: "Book a Demo"
    }
  ],
  demographics: {
    ageRange: "25 - 45",
    gender: "60% Male, 40% Female",
    incomeLevel: "$50k - $150k / year",
    location: "Primarily North America (65%), UK/EU (20%)",
    profession: "Content Creators, Agency Owners, Marketing Managers"
  },
  psychographics: {
    worldview: "Believes content is the ultimate modern leverage, but fears the algorithmic treadmill.",
    values: ["Autonomy", "Efficiency", "Professionalism", "Authenticity"],
    frustrations: ["Algorithms changing", "SaaS subscriptions piling up", "Vague 'guru' advice"],
    sourcesOfInfo: ["Niche newsletters", "Twitter/X operators", "YouTube deep-dives"]
  },
  painPoints: [
    "Context switching between 5+ different tools to produce one asset.",
    "Losing the 'authentic voice' when delegating to team members.",
    "The mental weight of staring at a blank page when production timelines are tight."
  ],
  goals: [
    "Build a predictable content engine that runs on a schedule.",
    "Decouple creative ideation from mechanical execution.",
    "Elevate the perceived production value of their content without increasing time spent."
  ],
  buyingTriggers: [
    "Experiencing a viral hit and realizing they have no system to capture the momentum.",
    "Hitting revenue plateaus because they cannot produce enough content to scale.",
    "A key team member (editor/writer) leaving, exposing their lack of internal systems."
  ],
  contentPreferences: {
    formats: ["15-30s Technical Shorts", "10m Deep Dive YouTube Breakdowns", "Text-heavy Twitter/X Threads"],
    consumptionHabits: "Binges educational content during off-hours (evenings/weekends). Prefers high-density information without fluff.",
    platforms: ["YouTube", "Twitter/X", "Instagram Reels", "LinkedIn"]
  },
  objections: [
    "It takes too long to learn a new system.",
    "AI tools always sound robotic and compromise my brand voice.",
    "I already pay for too many software subscriptions."
  ],
  journey: [
    {
      stage: "Unaware",
      mindset: "I'm just too busy to grow. This is what it takes.",
      primaryQuestion: "How are other creators producing so much?",
      emotionalState: "Overwhelmed, reactive.",
      recommendedContent: "Contrarian takes on 'hustle culture'. Highlight the hidden costs of poor systems.",
      ctaRecommendation: "Follow / Subscribe"
    },
    {
      stage: "Problem Aware",
      mindset: "My workflow is broken, but I don't know how to fix it.",
      primaryQuestion: "What systems are the top 1% using?",
      emotionalState: "Frustrated, seeking direction.",
      recommendedContent: "Behind-the-scenes teardowns of successful content engines.",
      ctaRecommendation: "Download Blueprint / Template"
    },
    {
      stage: "Solution Aware",
      mindset: "ReelForge looks powerful, but will it actually save me time?",
      primaryQuestion: "Can this replicate my specific brand voice?",
      emotionalState: "Cautiously optimistic, skeptical.",
      recommendedContent: "Case studies, Voice Memory demonstrations, unedited workflow videos.",
      ctaRecommendation: "Start Free Trial"
    },
    {
      stage: "Decision",
      mindset: "I need to migrate my workflow today.",
      primaryQuestion: "How quickly can I get this running?",
      emotionalState: "Motivated, ready to execute.",
      recommendedContent: "Onboarding guides, ROI calculators, integration tutorials.",
      ctaRecommendation: "Deploy Engine"
    }
  ],
  growthOpportunities: [
    {
      opportunity: "The 'Reluctant LinkedIn' Creator",
      whyItExists: "Many video creators know they should post text on LinkedIn but hate the platform's culture.",
      estimatedImpact: "High",
      suggestedAction: "Create a 'No-Cringe LinkedIn Strategy' Blueprint addressing this specific objection."
    },
    {
      opportunity: "Agency Standardization",
      whyItExists: "Agencies struggle to maintain client voice. Our Memory architecture solves this perfectly.",
      estimatedImpact: "Medium",
      suggestedAction: "Launch an Agency-specific use-case landing page and webinar."
    }
  ],
  recommendations: [
    {
      id: "rec_a1",
      title: "Address the 'Robotic AI' Objection",
      explanation: "A major friction point is the fear of losing authenticity. We need a content series proving that our Layered Memory architecture preserves nuance better than standard LLMs.",
      expectedImpact: "High",
      difficulty: "Low",
      actionLabel: "Generate 'Voice Integrity' Blueprint",
      actionHref: "/blueprint/new?template=voice_integrity"
    },
    {
      id: "rec_a2",
      title: "Target the 'Viral Hit' Trigger",
      explanation: "Creators are most vulnerable when a video pops off and they have no system to capitalize on it. Launch a campaign targeting the 'What to do after going viral' search intent.",
      expectedImpact: "Medium",
      difficulty: "Medium",
      actionLabel: "Build Momentum Campaign",
      actionHref: "/blueprint/new?template=momentum_campaign"
    }
  ],
  suggestedBlueprints: [
    { id: "bp_201", title: "Workflow Teardown Series", targetPersona: "The Burned-Out Solo", funnelStage: "Problem Aware", objective: "Educate & Build Trust", status: "Ready" },
    { id: "bp_202", title: "Scale Your Agency Voice", targetPersona: "The Scaling Agency", funnelStage: "Solution Aware", objective: "Overcome Objections", status: "Draft" }
  ]
}
