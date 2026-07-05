import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth/server-user";
import { ProjectRepository } from "@/lib/db/repositories/project.repository";
import type { SavedProject } from "@/types/project";

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await ProjectRepository.findAllByUserId(userId);
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("GET /api/v2/projects error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve projects or database unavailable" },
      { status: 503 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as SavedProject;
    if (!body || !body.id || !body.name) {
      return NextResponse.json({ error: "Invalid project payload" }, { status: 400 });
    }

    const saved = await ProjectRepository.save(body, userId);
    return NextResponse.json({ project: saved });
  } catch (error) {
    console.error("POST /api/v2/projects error:", error);
    return NextResponse.json(
      { error: "Failed to save project or database unavailable" },
      { status: 503 }
    );
  }
}
