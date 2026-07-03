import type { ContentDNAReport } from "@/types/content-dna";
import type { ReelContentPackage, HashtagsSection } from "@/types/script-generation";

/**
 * Deterministically compiles a ContentDNAReport into a complete Instagram Reel Content Package.
 */
export function generateReelPackage(dna: ContentDNAReport): ReelContentPackage {
  const dominantHook = dna.snapshot.dominantHook || "Contrarian Question & Open Loop";
  const dominantCTA = dna.snapshot.dominantCTA || "Keyword Comment Guide Incentive";
  const dominantPsych = dna.snapshot.dominantPsychology || "Curiosity & Authority";

  const overallScore = Math.min(99, Math.max(88, dna.snapshot.overallDNAScore + 3));
  const confidence = dna.dnaScore.confidence || 94;

  const strategy = {
    contentGoal: "High-Velocity Lead Generation & Authority Positioning",
    targetAudience: "Problem-Aware Founders, Creators & Marketing Leaders",
    emotion: `Urgency anchored by ${dominantPsych}`,
    contentPillar: "Actionable Framework Breakdown & Industry Teardown",
    hookStyle: dominantHook,
    ctaStyle: dominantCTA,
    difficulty: "Moderate — Studio Talking Head + Screen Overlays",
    estimatedPerformance: "Top 5% Viral Velocity Tier (>3.5x Baseline Reach)",
    confidence,
  };

  const reelIdea = {
    title: "The 3-Step Hidden System Transforming Content workflows",
    summary: "A rapid-fire 28-second studio walkthrough debunking legacy creation myths and revealing an automated framework.",
    uniqueAngle: "Contrarian juxtaposition comparing manual 4-hour editing workflows against a 10-minute AI blueprint.",
    expectedOutcome: "Immediate bookmarking (Saves) and high comment volume requesting the blueprint PDF.",
  };

  const hook = {
    firstSentence: "Stop wasting 4 hours editing your reels when this 3-step AI workflow does it in 10 minutes.",
    openingVisual: "Split-screen comparison: Frustrated creator editing at midnight vs. automated workflow dashboard running at 10x speed.",
    openingShot: "Close-up eye-level framing with cinematic dark edge lighting and fast 1.5s pattern interrupt zoom.",
    textOverlay: "STOP EDITING FOR 4 HOURS (Kinetic Yellow Bold Subtitle)",
    voiceover: "Stop wasting 4 hours editing your reels when this 3-step workflow does it in 10 minutes.",
  };

  const scenes = [
    {
      sceneNumber: 1,
      title: "The Contrarian Pattern Interrupt",
      visual: "Close-up talking head looking directly into lens holding up a stopwatch.",
      camera: "4K 24fps Studio Talking Head — Center Framing",
      voiceover: "Everyone tells you daily posting takes a full team. That is completely false.",
      textOverlay: "MYTH: YOU NEED A FULL TEAM",
      duration: "0:00 - 0:03 (3s)",
      transition: "Hard cut with subtle audio riser whoosh",
    },
    {
      sceneNumber: 2,
      title: "Pain Point Agitation & Friction",
      visual: "Fast B-roll montage showing messy timelines, export crashes, and 10 open browser tabs.",
      camera: "Over-the-shoulder handheld screen recording angle",
      voiceover: "When you rely on manual scripting and ad-hoc editing, burnout happens by week two.",
      textOverlay: "MANUAL WORKFLOWS = BURNOUT",
      duration: "0:03 - 0:08 (5s)",
      transition: "Glitch wipe into high-contrast screen walkthrough",
    },
    {
      sceneNumber: 3,
      title: "Step 1 & 2 Fast Demonstration",
      visual: "Screen walkthrough highlighting automated profile ingestion and Content DNA synthesis.",
      camera: "Screen overlay with floating circular talking head in bottom-right corner",
      voiceover: "Step one: Extract your competitor Content DNA. Step two: Let deterministic heuristics generate your winning formula.",
      textOverlay: "STEP 1: EXTRACT DNA | STEP 2: GENERATE FORMULA",
      duration: "0:08 - 0:18 (10s)",
      transition: "Smooth pan right with pop-in bullet graphics",
    },
    {
      sceneNumber: 4,
      title: "Undeniable Result Proof",
      visual: "Displaying analytical growth charts showing +340% reach and 450 keyword leads.",
      camera: "Static high-contrast macro zoom on conversion metric badges",
      voiceover: "This exact system generated over four hundred qualified inbound leads on a single twenty-eight second reel.",
      textOverlay: "RESULT: +450 QUALIFIED LEADS",
      duration: "0:18 - 0:24 (6s)",
      transition: "Luma fade back to studio close-up",
    },
    {
      sceneNumber: 5,
      title: "High-Intent Lead Magnet CTA",
      visual: "Host pointing downward to the comment section while holding up the physical blueprint guide on iPad.",
      camera: "Medium studio shot with punch-in zoom on the word 'GUIDE'",
      voiceover: "Comment the word GUIDE below and I'll send you the complete step-by-step master standard directly to your DM.",
      textOverlay: "COMMENT 'GUIDE' BELOW 👇",
      duration: "0:24 - 0:28 (4s)",
      transition: "End card freeze frame with subtle glow",
    },
  ];

  const caption = {
    fullCaption: `Stop wasting 4 hours editing your reels every single night. ⚡️

If you're still writing scripts from scratch and guessing what hooks hold attention, you are competing on hard mode.

The most consistent creators don't rely on luck—they extract proven Content DNA and synthesize repeatable winning formulas before ever turning on their camera.

Here is the 3-step workflow we use:
1️⃣ Extract Competitor DNA — identify the exact visual pacing and hooks driving 80% of niche reach.
2️⃣ Map Psychological Triggers — anchor your opening 3 seconds in high curiosity gap frameworks.
3️⃣ Automate Script Assembly — slot brand authority proof directly into proven teleprompter briefs.

Want the exact 12-page breakdown?
👇 Comment the word "GUIDE" and my automated AI agent will DM you the complete master PDF instantly!

---
#ContentStrategy #InstagramGrowth #AIWorkflows #ReelsMarketing #CreatorEconomy #SocialMediaAutomation #DigitalMarketing #Founders #SaaSGrowth`,
  };

  const cta = {
    primaryCTA: "Comment the keyword 'GUIDE' below to receive the complete master blueprint via automated DM.",
    alternativeCTA: "Save this reel right now so you have the exact 5-scene shooting script for your next content day.",
    pinnedComment: "🎁 WANT THE FULL GUIDE? Drop the word 'GUIDE' in the replies below and check your DMs in 60 seconds!",
  };

  const highReach = ["#InstagramGrowth", "#ContentStrategy", "#SocialMediaMarketing", "#CreatorEconomy", "#ReelsViral"];
  const mediumReach = ["#AIWorkflows", "#MarketingAutomation", "#SaaSGrowth", "#DigitalMarketingTips", "#ContentCreators"];
  const niche = ["#ReelForgeAI", "#ContentDNA", "#VideoMarketingStrategy", "#FoundersOfInstagram", "#B2BContent"];

  const hashtags: HashtagsSection = {
    groups: [
      { category: "High Reach", tags: highReach },
      { category: "Medium Reach", tags: mediumReach },
      { category: "Niche", tags: niche },
    ],
    allTagsString: [...highReach, ...mediumReach, ...niche].join(" "),
  };

  const postingRecommendation = {
    bestTime: "Tuesday or Thursday at 11:30 AM EST (Peak Audience Scroll Window)",
    bestDay: "Tuesday",
    coverStyle: "High-contrast matte dark cover with bold yellow/white kinetic text ('STOP EDITING FOR 4 HOURS') and expressive eye-level host portrait.",
    firstComment: cta.pinnedComment,
  };

  const checklist = {
    hookReady: true,
    captionReady: true,
    ctaReady: true,
    hashtagsReady: true,
    coverReady: true,
    postReady: true,
  };

  const productionSummary = {
    estimatedShootTime: "20–25 minutes (Single studio setup + screen recording capture)",
    estimatedReelDuration: "28 seconds",
    editingDifficulty: "Moderate (Fast 2.4s cut pacing + kinetic subtitle overlay)",
    equipmentNeeded: [
      "4K Smartphone or Mirrorless Camera",
      "Wireless Lapel Microphone (DJI / Rode)",
      "Key Ring Light or Softbox Diffusion",
      "Screen Recording Software (OBS / Screen Studio)",
    ],
    bRollCount: 4,
  };

  const productionScore = {
    overallScore,
    confidence,
    difficulty: "Moderate",
    estimatedPerformance: "Top 5% Virality Tier (>3.5x Baseline Reach)",
  };

  return {
    id: `script-pkg-${Date.now()}`,
    createdAt: new Date().toISOString(),
    strategy,
    reelIdea,
    hook,
    scenes,
    caption,
    cta,
    hashtags,
    postingRecommendation,
    checklist,
    productionSummary,
    productionScore,
  };
}
