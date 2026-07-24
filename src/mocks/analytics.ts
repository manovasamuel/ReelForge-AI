export const analyticsMockData = {
  overview: {
    totalReach: "1.2M",
    reachTrend: "+15%",
    avgEngagementRate: "4.8%",
    engagementTrend: "+0.5%",
    totalWatchTime: "4,500 hrs",
    watchTimeTrend: "+12%",
    totalConversions: "3,200",
    conversionTrend: "+8%"
  },
  topBlueprints: [
    { id: "bp_1", title: "Stop Wasting Time on Notion", platform: "Instagram", reach: "450K", engagement: "5.2%", status: "Published", date: "2026-07-20" },
    { id: "bp_2", title: "The Layered Memory Framework", platform: "LinkedIn", reach: "280K", engagement: "6.1%", status: "Published", date: "2026-07-15" },
    { id: "bp_3", title: "How I Scaled My Agency in 30 Days", platform: "YouTube", reach: "100K", engagement: "3.8%", status: "Published", date: "2026-07-10" },
    { id: "bp_4", title: "3 Hooks You Are Doing Wrong", platform: "Instagram", reach: "210K", engagement: "4.9%", status: "Published", date: "2026-07-05" }
  ],
  platformSplit: [
    { platform: "Instagram", reach: "800K", engagement: "4.5%", ctr: "1.2%", watchTime: "2,000 hrs" },
    { platform: "LinkedIn", reach: "300K", engagement: "6.2%", ctr: "2.5%", watchTime: "1,500 hrs" },
    { platform: "YouTube", reach: "100K", engagement: "3.8%", ctr: "4.1%", watchTime: "1,000 hrs" }
  ],
  funnel: {
    impressions: { label: "Impressions", value: "2,000,000", percentage: 100 },
    views: { label: "Views (3s+)", value: "1,200,000", percentage: 60 },
    engagement: { label: "Engagements", value: "57,600", percentage: 4.8 },
    conversions: { label: "Conversions (Link Clicks)", value: "3,200", percentage: 0.16 } // Relative to impressions
  }
}
