import type { ReelContentPackage } from "@/types/script-generation";
import type { RepurposeReport, PlatformContentMetrics } from "@/types/repurpose";

function calculateMetrics(text: string): PlatformContentMetrics {
  const characterCount = text.length;
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  // Standard reading speed approx 200 words per minute (3.33 words per sec)
  const readingTimeSeconds = Math.max(5, Math.round((wordCount / 200) * 60));

  return { wordCount, characterCount, readingTimeSeconds };
}

/**
 * Deterministically transforms a ReelContentPackage into omnichannel platform content.
 */
export function generateRepurposeReport(pkg: ReelContentPackage): RepurposeReport {
  const title = pkg.reelIdea?.title || "How to Scale Content Workflows";
  const hookText = pkg.hook?.firstSentence || "Stop wasting time editing content.";
  const fullCaption = pkg.caption?.fullCaption || "";
  const primaryCTA = pkg.cta?.primaryCTA || "Comment 'GUIDE' below for the master blueprint.";
  const allHashtags = pkg.hashtags?.allTagsString || "#InstagramGrowth #ContentStrategy #AIWorkflows";

  // 1. INSTAGRAM
  const instagramText = `${title}\n\n${fullCaption}\n\n${primaryCTA}\n\n${allHashtags}`;
  const instagramMetrics = calculateMetrics(instagramText);

  // 2. LINKEDIN
  const professionalHook = `How top 1% marketing leaders are automating content workflows (without sacrificing authenticity):`;
  const longFormPost = `${professionalHook}\n\nMost founders spend 15 to 20 hours a week struggling with ad-hoc video editing and random copywriting.\n\nHere is the exact framework we discovered after analyzing over 500 top-performing industry assets:\n\n1. Strategic Extraction (Content DNA)\nBefore shooting a single frame, analyze dominant visual hooks and pacing vectors in your niche. Stop guessing what retains attention.\n\n2. Teleprompter Architecture\nDesign high-retention 5-scene frameworks anchored by a contrarian opening statement within the first 3 seconds.\n\n3. Omnichannel Scaling\nProduce one core pillar video asset, then transform the transcript into platform-native formats.\n\nEfficiency isn't about working harder; it's about building a deterministic content engine.`;
  const linkedInCTA = `What is your biggest bottleneck in your current creation workflow? Share below or connect with me for our complete 12-page systems audit.`;
  const linkedInHashtags = ["#B2BMarketing", "#ContentStrategy", "#SaaSGrowth", "#ExecutiveLeadership", "#DigitalTransformation"];
  const linkedInFullText = `${longFormPost}\n\n${linkedInCTA}\n\n${linkedInHashtags.join(" ")}`;
  const linkedInMetrics = calculateMetrics(linkedInFullText);

  // 3. X (TWITTER) THREAD
  const t1 = `1/ Stop spending 4 hours editing a single short-form video.\n\nIf you want to scale your brand authority in 2026, you need a deterministic content engine.\n\nHere is the 5-step workflow replacing entire production teams 🧵👇`;
  const t2 = `2/ The 3-Second Rule:\n\n80% of video drop-off happens before second 4. If your hook doesn't create an immediate curiosity gap or pattern interrupt, your editing budget is wasted.\n\nOpen with a contrarian statement or stark visual comparison.`;
  const t3 = `3/ The Script Formula:\n\nNever freelance on camera. Structure every video into 5 precise blocks:\n• Hook (0-3s)\n• Agitation (3-8s)\n• Fast Demo (8-18s)\n• Undeniable Proof (18-24s)\n• Keyword CTA (24-28s)`;
  const t4 = `4/ Automated Repurposing:\n\nDon't let high-effort studio videos die on one platform. Transform every winning script into LinkedIn thought leadership, X threads, and newsletter deep dives immediately.`;
  const t5 = `5/ Systemization yields consistency. Consistency drives inbound revenue.\n\nStop relying on willpower when you can rely on engineering.`;
  const xCTA = `Want the complete 12-page breakdown PDF? Retweet the first tweet and reply "SYSTEM" below and I'll DM it over instantly!`;
  const thread = [
    { tweetNumber: 1, content: t1 },
    { tweetNumber: 2, content: t2 },
    { tweetNumber: 3, content: t3 },
    { tweetNumber: 4, content: t4 },
    { tweetNumber: 5, content: t5 },
  ];
  const xFullText = `${thread.map((t) => t.content).join("\n\n")}\n\n${xCTA}`;
  const xMetrics = calculateMetrics(xFullText);

  // 4. THREADS
  const conversationalPost = `Real talk: everyone tells you that you need a 5-person editing team to post daily. Honestly? That's complete myth.\n\nWe switched from 4-hour manual editing sessions to a structured 10-minute AI script pipeline and our reach jumped 340% in two weeks.\n\nThe secret isn't flashier transitions—it's nailing the first 3 seconds and giving viewers zero friction to take action.`;
  const threadsCTA = `Drop a ⚡️ in the replies if you're ready to simplify your content system this week!`;
  const threadsFullText = `${conversationalPost}\n\n${threadsCTA}`;
  const threadsMetrics = calculateMetrics(threadsFullText);

  // 5. FACEBOOK COMMUNITY POST
  const communityPost = `Hey everyone! 👋 Quick question for the creators and founders in here:\n\nHow many hours a week are you currently spending on video scripting and editing?\n\nWe just wrapped up testing a new 3-step content workflow that cuts production time down to 20 minutes while increasing comment engagement by 4x. We found that short, contrarian hooks combined with clear keyword incentives outperform high-budget edits every single time.\n\nI put together a complete checklist showing how we storyboard our 5-scene studio reels.`;
  const facebookCTA = `Comment "CHECKLIST" below if you want me to drop the PDF link in your inbox! Let's win together 🔥`;
  const facebookFullText = `${communityPost}\n\n${facebookCTA}`;
  const facebookMetrics = calculateMetrics(facebookFullText);

  // 6. YOUTUBE SHORTS
  const ytTitle = `${title} | 3-Step Content Framework #Shorts`;
  const ytDescription = `${hookText}\n\nDiscover the 3-step framework that transforms 4-hour manual video editing workflows into a rapid 10-minute studio pipeline.\n\nTIMESTAMPS:\n0:00 - The Contrarian Myth\n0:05 - Why Manual Workflows Fail\n0:12 - The 3-Step Solution\n0:22 - Result Proof & Case Study\n\n#ContentCreation #YouTubeShorts #DigitalMarketing #AIWorkflows #VideoStrategy`;
  const ytTags = ["Content Creation", "Video Marketing", "AI Workflows", "Instagram Reels", "YouTube Shorts Growth", "Marketing Strategy", "SaaS Growth"];
  const ytCTA = `Subscribe for daily systems breakdowns and check the pinned comment to download our free creator blueprint!`;
  const ytFullText = `${ytTitle}\n\n${ytDescription}\n\n${ytCTA}\n\n${ytTags.join(", ")}`;
  const ytMetrics = calculateMetrics(ytFullText);

  return {
    id: `repurpose-${Date.now()}`,
    createdAt: new Date().toISOString(),
    sourcePackageId: pkg.id,
    instagram: {
      title,
      caption: fullCaption,
      cta: primaryCTA,
      hashtags: allHashtags,
      metrics: instagramMetrics,
    },
    linkedIn: {
      professionalHook,
      longFormPost,
      cta: linkedInCTA,
      hashtags: linkedInHashtags,
      metrics: linkedInMetrics,
    },
    x: {
      thread,
      cta: xCTA,
      metrics: xMetrics,
    },
    threads: {
      conversationalPost,
      cta: threadsCTA,
      metrics: threadsMetrics,
    },
    facebook: {
      communityPost,
      cta: facebookCTA,
      metrics: facebookMetrics,
    },
    youtubeShorts: {
      title: ytTitle,
      description: ytDescription,
      tags: ytTags,
      cta: ytCTA,
      metrics: ytMetrics,
    },
  };
}
