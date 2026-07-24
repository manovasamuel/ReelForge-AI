export const brandMockData = {
  profile: {
    id: "acme_corp",
    name: "Acme Corp",
    handle: "@acmecorp",
    avatar: "A",
    status: "Active",
    lastUpdated: "Just now",
    healthScore: "92/100",
    knowledgeVersion: "v2.4"
  },
  executiveSummary: {
    title: "Solidified Premium Positioning",
    content: "Acme Corp has successfully transitioned from a utility-first SaaS tool into a premium workflow ecosystem. Brand sentiment remains overwhelmingly positive, though there is a minor gap in educational top-of-funnel content that competitors are beginning to exploit.",
    keyTakeaway: "Protect the premium perception while aggressively expanding educational content pillars."
  },
  identity: {
    coreIdentity: "The professional's choice for scalable execution.",
    mission: "To eliminate friction between strategic thought and creative execution.",
    vision: "A world where every creator operates with the efficiency of a media enterprise.",
    positioning: "Premium, highly reliable, and fundamentally empowering. We are not a toy; we are infrastructure."
  },
  toneOfVoice: {
    personality: "Confident, calm, intelligent, and slightly understated.",
    communicationStyle: "Direct and definitive. We do not use hyperbole.",
    vocabulary: "Architecture, execution, scale, intelligence, predictability.",
    doSay: ["Engineered for...", "Predictable outcomes", "Scale your strategy"],
    avoidSaying: ["Supercharge", "Magic", "Hack", "Revolutionary"]
  },
  visualIdentity: {
    colors: [
      { label: "Primary (Background)", hex: "#000000", isDark: true },
      { label: "Surface (Cards)", hex: "#111111", isDark: true },
      { label: "Accent (Purple)", hex: "#7C3AED", isDark: true },
      { label: "Foreground (Text)", hex: "#FFFFFF", isDark: false }
    ],
    typography: {
      heading: "Geist Display (Bold, tracking-tight)",
      body: "Geist Sans (Medium, leading-relaxed)",
      personality: "Architectural, highly legible, modern."
    },
    direction: "Minimal, technical, dark-mode default with subtle glassmorphism and purple emissive glows.",
    moodboard: [
      { id: 1, type: "abstract", label: "Layered Glass" },
      { id: 2, type: "interface", label: "Clean UI Grids" },
      { id: 3, type: "typography", label: "Massive Headlines" },
      { id: 4, type: "lighting", label: "Studio Emissive" }
    ]
  },
  contentPillars: [
    { pillar: "Workflow Engineering", frequency: "40%", format: "Deep-dive tutorials, system breakdowns." },
    { pillar: "Strategic Intelligence", frequency: "30%", format: "Market analysis, competitor teardowns." },
    { pillar: "Product Architecture", frequency: "20%", format: "Feature reveals, design philosophy." },
    { pillar: "Creator Scale", frequency: "10%", format: "Interviews with high-revenue users." }
  ],
  messagingFramework: {
    corePromise: "Content architecture, engineered.",
    valueProposition: "Translate scattered ideas into predictable, high-performing blueprints.",
    supportingMessages: [
      "Layered memory that scales with your brand.",
      "Intelligence over templates.",
      "Zero layout shift, 60fps performance."
    ],
    differentiators: [
      "We remember your brand voice automatically.",
      "We recommend actions, not just data."
    ],
    keyCTAs: ["Start Forging", "Deploy Engine", "Analyze Competitor"]
  },
  strengths: [
    "Extremely strong visual consistency across all touchpoints.",
    "Highly trusted by technical and professional users.",
    "Clear, unmistakable value proposition."
  ],
  weaknesses: [
    "Tone can occasionally feel too cold or detached.",
    "Lack of 'behind the scenes' humanizing content.",
    "Top-of-funnel awareness is lower than heavily-marketed competitors."
  ],
  growthOpportunities: [
    {
      opportunity: "Educational Top-of-Funnel Pipeline",
      whyItMatters: "Competitors are winning entry-level users through basic education. We can capture them with 'advanced' education.",
      estimatedImpact: "High",
      suggestedAction: "Launch 'Strategy Breakdowns' series."
    },
    {
      opportunity: "Humanize the Architecture",
      whyItMatters: "The brand is highly respected but lacks warmth. Showing the engineering process builds empathy.",
      estimatedImpact: "Medium",
      suggestedAction: "Start a 'Building ReelForge' founder vlog."
    }
  ],
  recommendations: [
    {
      id: "rec_b1",
      title: "Launch Educational Blueprint Campaign",
      explanation: "To address the top-of-funnel weakness, initiate a 4-part short-form video series breaking down advanced content strategies using our 'Workflow Engineering' pillar.",
      expectedImpact: "High",
      difficulty: "Medium",
      actionLabel: "Generate Educational Series",
      actionHref: "/blueprint/new?template=educational_series"
    },
    {
      id: "rec_b2",
      title: "Refresh 'About Us' Messaging",
      explanation: "Ensure the website copy strictly adheres to the updated 'Avoid Saying' list. Several legacy pages still use the word 'Supercharge'.",
      expectedImpact: "Low",
      difficulty: "Low",
      actionLabel: "Open Copy Auditor",
      actionHref: "/settings/brand"
    }
  ],
  suggestedBlueprints: [
    { id: "bp_101", title: "Brand Anthem Video", objective: "Communicate Core Promise", status: "Draft", lastUpdated: "2 hours ago" },
    { id: "bp_102", title: "Feature Teaser: Memory", objective: "Product Architecture", status: "Ready", lastUpdated: "Yesterday" }
  ]
}
