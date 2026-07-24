export const performanceIntelligenceMockData = {
  "bp_1": {
    metadata: {
      blueprintId: "bp_1",
      status: "Analyzed",
      analyzedAt: "Just now"
    },
    executiveSummary: {
      outcome: "Strong reach and high initial engagement, but struggled with mid-video retention.",
      successFactor: "The contrarian hook ('Stop building Notion templates') generated 3x average impressions.",
      weakness: "40% of viewers dropped off during the B-roll transition at 0:12.",
      keyRecommendation: "Shorten the B-roll sequence and introduce the primary solution 5 seconds earlier in future campaigns."
    },
    insights: {
      winningMoments: [
        { label: "Contrarian Hook", description: "The opening 3 seconds retained 85% of viewers, significantly outperforming the 60% baseline.", metric: "85% Retention" },
        { label: "CTA Conversion", description: "The 'Link in comments' CTA generated a 2.5% CTR on LinkedIn, beating the industry average.", metric: "2.5% CTR" }
      ],
      improvementOpportunities: [
        { label: "Mid-video Drop-off", description: "40% of viewers left during the slow B-roll transition at 0:12. The pacing slowed down too much.", recommendation: "Cut B-roll from 3s to 1s. Use faster J-cuts." },
        { label: "Low Save Rate", description: "While CTR was high, the save rate was only 0.2%. The content was persuasive but not viewed as a reference tool.", recommendation: "Add a highly actionable, on-screen checklist summary at the end." }
      ],
      benchmarks: [
        { category: "Brand", status: "Aligned", description: "Tone was direct and authoritative, perfectly matching the established Brand Voice." },
        { category: "Audience", status: "Over-performing", description: "Highly resonated with the 'Solopreneur' persona based on comment sentiment." },
        { category: "Competitor", status: "Advantage", description: "Outperformed 'Competitor A' by leading with a specific problem rather than generic advice." }
      ]
    },
    recommendations: {
      highImpact: [
        "Shorten B-roll transition sequences to a maximum of 1.5 seconds.",
        "Move the core value proposition to the 0:10 mark (currently at 0:15)."
      ],
      mediumImpact: [
        "Include a bulleted summary on-screen during the final 5 seconds to increase saves.",
        "Test a 'Story-Driven' caption variant on Instagram instead of 'Short & Punchy'."
      ],
      experimental: [
        "Try splitting this into a two-part hook next time to build even more tension.",
        "Test posting at 8:00 AM EST on LinkedIn based on engagement spikes."
      ]
    }
  }
}
