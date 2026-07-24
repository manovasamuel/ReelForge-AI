import { NextResponse } from "next/server";
import { refreshCoordinator } from "@/services/intelligence/refresh-coordinator.service";

/**
 * Triggered by Vercel Cron (or external scheduler) to run the Background Intelligence Refresh pipeline.
 * E.g., configured in vercel.json to run every hour.
 */
export async function GET(request: Request) {
  try {
    // 1. Verify cron secret to protect the endpoint from public triggering
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[CRON] Initiating Background Intelligence Refresh...");
    
    // 2. Delegate to the Coordinator layer
    const processedCount = await refreshCoordinator.processDueProfiles();
    
    return NextResponse.json({
      success: true,
      message: `Successfully processed ${processedCount} profiles.`,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    console.error("[CRON] Intelligence Refresh failed:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
