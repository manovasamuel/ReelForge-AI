import { NextResponse } from "next/server";
import { RepurposeService, RepurposeError } from "@/services/repurpose/repurpose.service";
import type { ReelContentPackage } from "@/types/script-generation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pkg } = body as { pkg?: ReelContentPackage };

    if (!pkg || !pkg.id) {
      return NextResponse.json(
        { error: { message: "A valid Reel Content Package is required.", code: "MISSING_PACKAGE" } },
        { status: 400 }
      );
    }

    const service = new RepurposeService();
    const report = await service.generateRepurpose(pkg);

    return NextResponse.json({ data: report });
  } catch (err) {
    if (err instanceof RepurposeError) {
      const status = err.code === "INVALID_INPUT" ? 400 : 500;
      return NextResponse.json({ error: { message: err.message, code: err.code } }, { status });
    }

    return NextResponse.json(
      { error: { message: "Internal server error adapting repurpose report.", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
