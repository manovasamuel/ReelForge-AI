import type { CollectedContentItem, ContentType } from "@/types/content-collection";

const HOOK_PREVIEWS = [
  "Stop scrolling if you want to double your workflow efficiency in 2026. Here is the exact 3-step blueprint we use internally...",
  "3 unspoken secrets top creators use to hook viewers in the first 1.5 seconds. Save this before your next shoot!",
  "Why 90% of SaaS onboarding funnels fail (and the simple UX shift that increased our activation rate by 42%)...",
  "A behind the scenes breakdown of our latest high-converting campaign setup. Swipe right for the slide-by-slide checklist 👉",
  "Stop complicating your content engine. We built this automated pipeline in under 4 hours without writing backend boilerplate.",
  "The biggest mistake new brand managers make on Instagram is ignoring audio pacing. Here is how to sync visual cuts seamlessly.",
  "How we generated 1.2M impressions this month using only 4 core content pillars. Full framework documented below 👇",
  "Don't buy expensive camera rigs until you master this lighting hack using a standard $30 desk lamp.",
  "Case Study: How @founder scaled their digital community from 0 to 50K engaged members in 90 days flat.",
  "Unlocking the psychological triggers behind viral retention: Why visual pattern interrupts every 4 seconds matter.",
  "Our top 5 software tools for content repurposing across LinkedIn, X, YouTube Shorts, and Threads in 2026.",
  "Swipe through our complete typography and color grading guide for high-retention educational carousels.",
];

const HASHTAG_BANKS = [
  ["#contentstrategy", "#reelsgrowth", "#instagramtips", "#digitalmarketing", "#creatoreconomy"],
  ["#saasmarketing", "#b2bgrowth", "#productledgrowth", "#techfounder", "#startuplife"],
  ["#socialmediatips", "#viralhooks", "#copywritingtips", "#brandingstrategy", "#growthhacking"],
  ["#videoproduction", "#reelsediting", "#contentcreator", "#filmmakingtips", "#creativeworkflow"],
];

/**
 * Deterministically generates a library of 24 collected Instagram content items
 * for the given competitor username.
 */
export function inferContentCollection(competitorUsername: string): CollectedContentItem[] {
  const username = competitorUsername.replace(/^@/, "");
  const baseSeed = username.length * 1337;
  const now = new Date();

  return Array.from({ length: 24 }).map((_, index) => {
    // Distribute types: 12 reels, 6 carousels, 4 images, 2 videos
    let type: ContentType = "reel";
    if (index % 4 === 1) type = "carousel";
    else if (index % 6 === 2) type = "image";
    else if (index % 11 === 0 && index > 0) type = "video";
    else if (index % 8 === 3) type = "post";

    const isPinned = index < 3;
    const isHighEngagement = index % 3 === 0 || isPinned;

    // Deterministic metrics based on index
    const baseViews = 25_000 + ((baseSeed + index * 17_341) % 450_000);
    const views = isHighEngagement ? baseViews * 2.4 : baseViews;
    const likes = Math.round(views * (0.045 + ((index % 5) * 0.01)));
    const comments = Math.round(likes * (0.06 + ((index % 3) * 0.02)));

    // Dates distributed across last 60 days
    const daysAgo = Math.round(index * 2.3);
    const publishDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    const captionIndex = (baseSeed + index) % HOOK_PREVIEWS.length;
    const hashtagIndex = (baseSeed + index) % HASHTAG_BANKS.length;

    return {
      id: `media-${username}-${index + 101}`,
      competitorUsername: username,
      thumbnailUrl: `https://picsum.photos/seed/${username}-media-${index + 101}/400/600`,
      type,
      views: Math.round(views),
      likes,
      comments,
      publishDate,
      caption: HOOK_PREVIEWS[captionIndex],
      hashtags: HASHTAG_BANKS[hashtagIndex],
      durationSeconds: type === "reel" || type === "video" ? 15 + ((index * 7) % 45) : undefined,
      mediaCount: type === "carousel" ? 5 + (index % 5) : undefined,
      isPinned,
    };
  });
}
