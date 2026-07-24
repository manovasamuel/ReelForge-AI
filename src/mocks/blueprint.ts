export const blueprintMockData = {
  workspace: [
    { id: "bp_1", title: "Workflow Teardown Series", objective: "Educate & Build Trust", targetPersona: "The Burned-Out Solo", status: "Draft", lastUpdated: "2 hours ago" },
    { id: "bp_2", title: "Scale Your Agency Voice", objective: "Overcome Objections", targetPersona: "The Scaling Agency", status: "Ready", lastUpdated: "Yesterday" },
    { id: "bp_3", title: "Brand Anthem Video", objective: "Communicate Core Promise", targetPersona: "Broad Audience", status: "Published", lastUpdated: "5 days ago" }
  ],
  blueprints: {
    "bp_1": {
      metadata: {
        id: "bp_1",
        title: "Workflow Teardown Series",
        status: "Draft",
        objective: "Educate & Build Trust",
        targetPersona: "The Burned-Out Solo",
        estimatedDuration: "60 seconds",
        lastUpdated: "2 hours ago",
        version: "v1.2"
      },
      contentBlocks: [
        {
          id: "block_1",
          type: "Hook",
          content: "You're spending 10 hours a week managing your content system, and you're still not growing. Here is exactly how to reclaim that time.",
          aiSuggestions: ["Make it punchier", "Increase urgency", "Add a statistic"]
        },
        {
          id: "block_2",
          type: "Context",
          content: "Most creators hit a revenue plateau because they confuse busywork with productive work. They build complex Notion templates instead of hitting record.",
          aiSuggestions: ["Make more empathetic", "Shorten"]
        },
        {
          id: "block_3",
          type: "Main Script",
          content: "Step 1: Decouple ideation from execution. Stop trying to come up with ideas on the same day you film.\nStep 2: Use Layered Memory. If your tool doesn't remember your brand voice, you are essentially starting from scratch every single prompt.\nStep 3: Standardize the output. You don't need a new format every day, you need one format that converts predictably.",
          aiSuggestions: ["Expand step 2", "Make steps more actionable"]
        },
        {
          id: "block_4",
          type: "Visual Direction",
          content: "Dynamic cut between talking head (studio lighting) and b-roll of a messy, overwhelming Notion dashboard being replaced by a clean, automated ReelForge workflow.",
          aiSuggestions: ["Generate alternative b-roll"]
        },
        {
          id: "block_5",
          type: "CTA",
          content: "Stop fighting the algorithm. Click the link in my bio to steal my exact automated workflow template.",
          aiSuggestions: ["Increase conversion focus"]
        }
      ],
      strategicContext: {
        brandAlignment: {
          title: "Aligns with 'Workflow Engineering' Pillar",
          explanation: "This directly reinforces the core promise of eliminating friction. It uses the approved 'Direct and definitive' tone of voice, avoiding any hype words."
        },
        audienceInsight: {
          title: "Targets 'Tool Fatigue' Pain Point",
          explanation: "The Burned-Out Solo persona is currently overwhelmed by context switching. Addressing this head-on builds immediate trust and positions us as the antidote."
        },
        competitorGap: {
          title: "Exploits TechNova's Educational Gap",
          explanation: "TechNova focuses on basic entry-level tutorials. This 'Workflow Teardown' provides advanced, strategic education that their audience is actively seeking but not receiving."
        },
        confidence: "High"
      }
    }
  }
}
