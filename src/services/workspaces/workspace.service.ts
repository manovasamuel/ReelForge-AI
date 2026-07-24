import { db } from "../../lib/db";
import { workspaces, workspaceMembers, users } from "../../lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto";

export type Role = "owner" | "admin" | "editor" | "viewer";

export class WorkspaceService {
  /**
   * Create a new workspace and automatically assign the creator as the owner.
   */
  public static async createWorkspace(name: string, userId: string, avatarUrl?: string) {
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${crypto.randomBytes(4).toString("hex")}`;
    
    return await db!.transaction(async (tx) => {
      // 1. Create Workspace
      const [workspace] = await tx.insert(workspaces).values({
        name,
        slug,
        avatarUrl
      }).returning();

      // 2. Assign Owner
      await tx.insert(workspaceMembers).values({
        workspaceId: workspace.id,
        userId,
        role: "owner"
      });

      return workspace;
    });
  }

  /**
   * Add a member to a workspace
   */
  public static async addMember(workspaceId: string, userId: string, role: Role = "viewer") {
    const [member] = await db!.insert(workspaceMembers).values({
      workspaceId,
      userId,
      role
    }).returning();
    return member;
  }

  /**
   * Remove a member from a workspace
   */
  public static async removeMember(workspaceId: string, userId: string) {
    await db!.delete(workspaceMembers)
      .where(and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      ));
    return true;
  }

  /**
   * Get all workspaces for a given user
   */
  public static async getUserWorkspaces(userId: string) {
    const memberships = await db!.select({
      workspace: workspaces,
      role: workspaceMembers.role
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, userId))
    .orderBy(desc(workspaces.updatedAt));

    return memberships.map(m => ({ ...m.workspace, role: m.role }));
  }

  /**
   * Check if a user has a specific required role (or higher) in a workspace.
   */
  public static async checkPermission(userId: string, workspaceId: string, requiredRole: Role): Promise<boolean> {
    const membership = await db!.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      )
    });

    if (!membership) return false;

    const roleHierarchy: Record<Role, number> = {
      "viewer": 1,
      "editor": 2,
      "admin": 3,
      "owner": 4
    };

    return roleHierarchy[membership.role as Role] >= roleHierarchy[requiredRole];
  }

  /**
   * Resolve an active workspace given a userId and a requested workspaceId.
   * If requested is valid, returns it. Otherwise returns their personal default workspace.
   */
  public static async resolveActiveWorkspace(userId: string, requestedWorkspaceId?: string) {
    const userWorkspaces = await this.getUserWorkspaces(userId);
    if (userWorkspaces.length === 0) {
      // Emergency fallback if they somehow have no workspaces (should be created on signup)
      return null;
    }

    if (requestedWorkspaceId) {
      const match = userWorkspaces.find(w => w.id === requestedWorkspaceId);
      if (match) return match;
    }

    // Default to the first one (most recently updated or personal)
    return userWorkspaces[0];
  }
}
