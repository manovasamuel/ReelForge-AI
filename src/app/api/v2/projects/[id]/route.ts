import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth/server-user";
import { ProjectRepository } from "@/lib/db/repositories/project.repository";
import type { SavedProject } from "@/types/project";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await ProjectRepository.findById(id, userId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("GET /api/v2/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve project or database unavailable" },
      { status: 503 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (body.action === "duplicate") {
      const { newId, newName } = body;
      if (!newId || !newName) {
        return NextResponse.json({ error: "Missing newId or newName for duplication" }, { status: 400 });
      }
      const duplicated = await ProjectRepository.duplicate(id, newId, newName, userId);
      if (!duplicated) {
        return NextResponse.json({ error: "Original project not found" }, { status: 404 });
      }
      return NextResponse.json({ project: duplicated });
    } else {
      const { updates } = body;
      const updated = await ProjectRepository.update(id, userId, updates || {});
      if (!updated) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      return NextResponse.json({ project: updated });
    }
  } catch (error) {
    console.error("PUT /api/v2/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update project or database unavailable" },
      { status: 503 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await ProjectRepository.delete(id, userId);
    if (!deleted) {
      return NextResponse.json({ error: "Project not found or already deleted" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/v2/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete project or database unavailable" },
      { status: 503 }
    );
  }
}
