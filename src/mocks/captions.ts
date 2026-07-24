export const captionMockData = {
  "bp_1": {
    metadata: {
      blueprintId: "bp_1",
      status: "Generated",
      lastUpdated: "Just now"
    },
    platforms: {
      "instagram": {
        id: "instagram",
        name: "Instagram",
        captions: [
          {
            id: "ig_cap_1",
            style: "Short & Punchy",
            text: "Stop spending 10 hours a week managing your content system. 🛑\n\nIf you're confusing busywork with productive work, you'll never scale.\n\nSteal my exact automated workflow.",
            aiSuggestions: ["Make more urgent", "Add emojis", "Shorten further"]
          },
          {
            id: "ig_cap_2",
            style: "Educational",
            text: "Are you hitting a revenue plateau? Here’s why: you’re spending 10 hours a week on Notion instead of recording. 🎥\n\nStep 1: Decouple ideation from execution.\nStep 2: Use Layered Memory for your brand voice.\nStep 3: Standardize the output.\n\nStop fighting the algorithm and start building a system.",
            aiSuggestions: ["Rewrite for a beginner", "Make more contrarian"]
          }
        ],
        ctas: [
          { id: "ig_cta_1", text: "Link in bio to steal this workflow.", goal: "Traffic", funnelStage: "Decision" },
          { id: "ig_cta_2", text: "Comment 'SYSTEM' to get the template.", goal: "Engagement", funnelStage: "Solution Aware" }
        ],
        hashtags: [
          { category: "Broad Reach", tags: ["#contentcreator", "#productivity", "#marketing"] },
          { category: "Niche", tags: ["#creatorworkflow", "#solopreneur", "#notiontemplate"] },
          { category: "Brand", tags: ["#reelforge", "#workflowengineering"] }
        ],
        seo: {
          title: "Not applicable for Instagram",
          keywords: ["content system", "workflow", "reclaim time"],
          metaDescription: ""
        }
      },
      "linkedin": {
        id: "linkedin",
        name: "LinkedIn",
        captions: [
          {
            id: "li_cap_1",
            style: "Thought Leadership",
            text: "Most creators hit a revenue plateau because they confuse busywork with productive work.\n\nBuilding complex Notion templates feels good. Hitting record pays the bills.\n\nIf you are spending 10 hours a week managing your content system, your system is broken.\n\nHere is how I decoupled my creative ideation from mechanical execution to reclaim my time and increase output quality.",
            aiSuggestions: ["Make more professional", "Expand on the solution", "Add bullet points"]
          }
        ],
        ctas: [
          { id: "li_cta_1", text: "Link in the comments for the full workflow teardown.", goal: "Traffic", funnelStage: "Decision" },
          { id: "li_cta_2", text: "How much time do you spend on content ops vs creation? Let me know below.", goal: "Engagement", funnelStage: "Problem Aware" }
        ],
        hashtags: [
          { category: "Professional", tags: ["#ContentStrategy", "#Solopreneur", "#CreatorEconomy", "#Productivity"] }
        ],
        seo: {
          title: "How to Reclaim 10 Hours a Week from Content Creation",
          keywords: ["creator economy", "content operations", "scaling an agency"],
          metaDescription: ""
        }
      },
      "x": {
        id: "x",
        name: "X (Twitter)",
        captions: [
          {
            id: "x_cap_1",
            style: "Thread Starter",
            text: "You're spending 10 hours a week managing your content system.\n\nYou're not growing. You're just busy.\n\nHere is exactly how I decoupled ideation from execution to reclaim my time: 🧵",
            aiSuggestions: ["Make punchier", "Increase hook tension"]
          },
          {
            id: "x_cap_2",
            style: "Contrarian Hook",
            text: "Stop building complex Notion templates.\n\nIf your content system takes 10 hours a week to manage, it's a liability, not an asset.",
            aiSuggestions: ["Make more aggressive", "Add a rhetorical question"]
          }
        ],
        ctas: [
          { id: "x_cta_1", text: "Click here to steal my automated workflow.", goal: "Traffic", funnelStage: "Decision" }
        ],
        hashtags: [
          { category: "Standard", tags: ["#ContentCreation", "#Solopreneur"] }
        ],
        seo: {
          title: "",
          keywords: [],
          metaDescription: ""
        }
      },
      "youtube": {
        id: "youtube",
        name: "YouTube",
        captions: [
          {
            id: "yt_cap_1",
            style: "SEO Focused Description",
            text: "Are you spending 10 hours a week managing your content system without seeing growth? In this workflow teardown, I reveal how to stop confusing busywork with productive work. \n\nWe cover:\n0:00 - The Productivity Trap\n1:20 - Decoupling Ideation\n3:45 - Layered Memory for Brand Voice\n6:10 - Standardizing Output\n\nIf you want to reclaim your time, stop fighting the algorithm and start building a system.",
            aiSuggestions: ["Expand timestamps", "Make more engaging", "Add social links placeholder"]
          }
        ],
        ctas: [
          { id: "yt_cta_1", text: "Download the Workflow Template here: [LINK]", goal: "Lead Gen", funnelStage: "Decision" },
          { id: "yt_cta_2", text: "Subscribe for more workflow teardowns.", goal: "Audience Growth", funnelStage: "Awareness" }
        ],
        hashtags: [
          { category: "Tags", tags: ["content strategy", "creator workflow", "notion template", "productivity for creators", "reelforge"] }
        ],
        seo: {
          title: "Stop Wasting Time: The Ultimate Creator Content Workflow",
          keywords: ["content creation workflow", "how to save time editing", "notion for creators"],
          metaDescription: "Learn how to save 10 hours a week on content creation. We break down the exact workflow to decouple ideation from execution."
        }
      }
    }
  }
}
