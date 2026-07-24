import { NextResponse } from "next/server";
import { PublishingService } from "@/services/publishing/publishing.service";
import { PublishingCronService } from "@/services/publishing/cron.service";
import { AnalyticsService } from "@/services/analytics/analytics.service";

// Verify Vercel Cron Secret (if set)
const verifyCronSecret = (request: Request) => {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET) {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return false;
    }
  }
  return true;
};

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const publishingService = new PublishingService();
    const cronService = new PublishingCronService(publishingService);

    const result = await cronService.processScheduledPosts();

    return NextResponse.json({
      success: true,
      message: `Processed ${result.processed} scheduled posts.`,
      data: result
    });
  } catch (error: any) {
    console.error("Cron /api/cron/publishing failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
