import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  projects,
  profileAnalyses,
  brandReports,
  contentDna,
  generatedScripts,
  repurposePackages,
} from "@/lib/db/schema";
import type { SavedProject, StorageStats } from "@/types/project";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export class ProjectRepository {
  /**
   * Ensure DB is initialized
   */
  private static getDb() {
    if (!db) {
      throw new Error("Database client is unconfigured or unavailable.");
    }
    return db;
  }

  /**
   * Map database row to SavedProject object
   */
  private static mapRowToProject(row: typeof projects.$inferSelect): SavedProject {
    const metadata = (row.metadata as Record<string, any>) || {};
    const stateSnapshot = (row.stateSnapshot as Record<string, any>) || {
      profile: null,
      brandReport: null,
      competitors: null,
      competitorAnalysis: null,
      contentCollection: null,
      contentIntelligence: null,
      contentDNA: null,
      scriptPackage: null,
      repurposePackage: null,
      selectedCompetitor: metadata.selectedCompetitor || null,
    };

    return {
      id: row.id,
      version: metadata.version || "1.2.0",
      name: row.name,
      instagramUrl:
        metadata.instagramUrl ||
        (row.targetUsername !== "unsaved"
          ? `https://instagram.com/${row.targetUsername}`
          : "Unsaved Profile"),
      createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
      state: stateSnapshot as SavedProject["state"],
    };
  }

  /**
   * Retrieve all projects owned by a specific user
   */
  public static async findAllByUserId(userId: string): Promise<SavedProject[]> {
    const database = this.getDb();
    const rows = await database
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));

    return rows.map(this.mapRowToProject);
  }

  /**
   * Retrieve a specific project by ID and owner
   */
  public static async findById(id: string, userId: string): Promise<SavedProject | null> {
    const database = this.getDb();
    const rows = await database
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapRowToProject(rows[0]);
  }

  /**
   * Persist a project (create or update) with strict user ownership
   */
  public static async save(project: SavedProject, userId: string): Promise<SavedProject> {
    const database = this.getDb();
    const now = new Date();
    const targetUsername =
      project.state.profile?.username ||
      project.instagramUrl
        .replace("https://instagram.com/", "")
        .replace("https://www.instagram.com/", "")
        .replace("/", "") ||
      "unsaved";

    // 1. Upsert primary project record and UI state snapshot
    await database
      .insert(projects)
      .values({
        id: project.id,
        userId,
        name: project.name,
        targetUsername,
        status: "COMPLETED",
        currentPhase: 9,
        metadata: {
          version: project.version,
          instagramUrl: project.instagramUrl,
          selectedCompetitor: project.state.selectedCompetitor || null,
        },
        stateSnapshot: project.state,
        createdAt: new Date(project.createdAt),
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: projects.id,
        set: {
          name: project.name,
          targetUsername,
          metadata: {
            version: project.version,
            instagramUrl: project.instagramUrl,
            selectedCompetitor: project.state.selectedCompetitor || null,
          },
          stateSnapshot: project.state,
          updatedAt: now,
        },
      });

    // 2. Synchronize normalized phase tables asynchronously without blocking Workspace persistence
    if (project.state.profile) {
      database
        .insert(profileAnalyses)
        .values({
          projectId: project.id,
          username: project.state.profile.username,
          fullName: project.state.profile.display_name || null,
          bio: project.state.profile.bio || null,
          followersCount: project.state.profile.follower_count || 0,
          followingCount: project.state.profile.following_count || 0,
          postsCount: project.state.profile.post_count || 0,
          engagementRate: "0.00",
          profilePicUrl: project.state.profile.profile_picture_url || null,
          isVerified: project.state.profile.is_verified || false,
          rawSnapshot: project.state.profile,
        })
        .onConflictDoUpdate({
          target: profileAnalyses.projectId,
          set: {
            username: project.state.profile.username,
            fullName: project.state.profile.display_name || null,
            bio: project.state.profile.bio || null,
            followersCount: project.state.profile.follower_count || 0,
            followingCount: project.state.profile.following_count || 0,
            postsCount: project.state.profile.post_count || 0,
            engagementRate: "0.00",
            profilePicUrl: project.state.profile.profile_picture_url || null,
            isVerified: project.state.profile.is_verified || false,
            rawSnapshot: project.state.profile,
          },
        })
        .catch((e) => console.error("Error syncing profileAnalyses table:", e));
    }

    if (project.state.brandReport) {
      database
        .insert(brandReports)
        .values({
          projectId: project.id,
          archetype: project.state.brandReport.brandType || "Personal Brand",
          toneVoice: project.state.brandReport.brandTone || "Professional",
          industryVertical: project.state.brandReport.industry || "General",
          contentPillars: project.state.brandReport.primaryContentPillars || [],
          targetAudience: {
            description: project.state.brandReport.targetAudience || "",
            age: project.state.brandReport.estimatedAudienceAge || "",
          },
        })
        .onConflictDoUpdate({
          target: brandReports.projectId,
          set: {
            archetype: project.state.brandReport.brandType || "Personal Brand",
            toneVoice: project.state.brandReport.brandTone || "Professional",
            industryVertical: project.state.brandReport.industry || "General",
            contentPillars: project.state.brandReport.primaryContentPillars || [],
            targetAudience: {
              description: project.state.brandReport.targetAudience || "",
              age: project.state.brandReport.estimatedAudienceAge || "",
            },
          },
        })
        .catch((e) => console.error("Error syncing brandReports table:", e));
    }

    if (project.state.contentDNA) {
      database
        .insert(contentDna)
        .values({
          projectId: project.id,
          winningHookFormulas: project.state.contentDNA.winningHooks || {},
          optimalDurationSeconds: 30,
          recommendedPostingWindows: [],
          visualStyleGuide: project.state.contentDNA.winningVisualStyle || {},
          masterBlueprintSummary: project.state.contentDNA.blueprintExport?.description || "Master Blueprint",
        })
        .onConflictDoUpdate({
          target: contentDna.projectId,
          set: {
            winningHookFormulas: project.state.contentDNA.winningHooks || {},
            optimalDurationSeconds: 30,
            recommendedPostingWindows: [],
            visualStyleGuide: project.state.contentDNA.winningVisualStyle || {},
            masterBlueprintSummary: project.state.contentDNA.blueprintExport?.description || "Master Blueprint",
          },
        })
        .catch((e) => console.error("Error syncing contentDna table:", e));
    }

    if (project.state.scriptPackage) {
      database
        .insert(generatedScripts)
        .values({
          projectId: project.id,
          title: project.state.scriptPackage.reelIdea?.title || "Generated Script",
          logline: project.state.scriptPackage.reelIdea?.summary || "",
          targetDurationSeconds: 30,
          scenes: project.state.scriptPackage.scenes || [],
          teleprompterText: project.state.scriptPackage.scenes?.map((s) => s.voiceover).join(" ") || "",
          directorsNotes: project.state.scriptPackage.productionSummary?.editingDifficulty || null,
        })
        .onConflictDoUpdate({
          target: generatedScripts.projectId,
          set: {
            title: project.state.scriptPackage.reelIdea?.title || "Generated Script",
            logline: project.state.scriptPackage.reelIdea?.summary || "",
            targetDurationSeconds: 30,
            scenes: project.state.scriptPackage.scenes || [],
            teleprompterText: project.state.scriptPackage.scenes?.map((s) => s.voiceover).join(" ") || "",
            directorsNotes: project.state.scriptPackage.productionSummary?.editingDifficulty || null,
          },
        })
        .catch((e) => console.error("Error syncing generatedScripts table:", e));
    }

    if (project.state.repurposePackage) {
      database
        .insert(repurposePackages)
        .values({
          projectId: project.id,
          linkedinPost: project.state.repurposePackage.linkedIn || {},
          twitterThread: project.state.repurposePackage.x || {},
          threadsPost: project.state.repurposePackage.threads || {},
          facebookReelCaption: project.state.repurposePackage.facebook || {},
          youtubeShortsMeta: project.state.repurposePackage.youtubeShorts || {},
        })
        .onConflictDoUpdate({
          target: repurposePackages.projectId,
          set: {
            linkedinPost: project.state.repurposePackage.linkedIn || {},
            twitterThread: project.state.repurposePackage.x || {},
            threadsPost: project.state.repurposePackage.threads || {},
            facebookReelCaption: project.state.repurposePackage.facebook || {},
            youtubeShortsMeta: project.state.repurposePackage.youtubeShorts || {},
          },
        })
        .catch((e) => console.error("Error syncing repurposePackages table:", e));
    }

    return {
      ...project,
      version: "1.2.0",
      updatedAt: now.toISOString(),
    };
  }

  /**
   * Update specific fields of an existing project
   */
  public static async update(
    id: string,
    userId: string,
    updates: Partial<SavedProject>
  ): Promise<SavedProject | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const merged: SavedProject = {
      ...existing,
      ...updates,
      id: existing.id, // Prevent overriding ID
      version: "1.2.0",
      updatedAt: new Date().toISOString(),
    };

    return this.save(merged, userId);
  }

  /**
   * Permanently delete a project by ID and owner
   */
  public static async delete(id: string, userId: string): Promise<boolean> {
    const database = this.getDb();
    const result = await database
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning({ id: projects.id });

    return result.length > 0;
  }

  /**
   * Duplicate a project with a new ID and name
   */
  public static async duplicate(
    id: string,
    newId: string,
    newName: string,
    userId: string
  ): Promise<SavedProject | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const now = new Date().toISOString();
    const duplicateProject: SavedProject = {
      ...existing,
      id: newId,
      version: "1.2.0",
      name: newName,
      createdAt: now,
      updatedAt: now,
      state: JSON.parse(JSON.stringify(existing.state)),
    };

    return this.save(duplicateProject, userId);
  }

  /**
   * Compute storage stats for all user projects
   */
  public static async getStats(userId: string): Promise<StorageStats> {
    const userProjects = await this.findAllByUserId(userId);
    const totalProjects = userProjects.length;

    if (totalProjects === 0) {
      return {
        totalProjects: 0,
        totalStorageUsedBytes: 0,
        totalStorageUsedFormatted: "0 B",
        largestProjectName: "None",
        largestProjectSizeBytes: 0,
        largestProjectSizeFormatted: "0 B",
        averageProjectSizeBytes: 0,
        averageProjectSizeFormatted: "0 B",
        lastSaved: null,
      };
    }

    let totalBytes = 0;
    let largestName = "";
    let largestBytes = 0;
    let latestTimestamp: number = 0;
    let lastSavedIso: string | null = null;

    for (const p of userProjects) {
      const serialized = JSON.stringify(p);
      const bytes = new Blob([serialized]).size;
      totalBytes += bytes;

      if (bytes > largestBytes) {
        largestBytes = bytes;
        largestName = p.name;
      }

      const updatedMs = new Date(p.updatedAt).getTime();
      if (updatedMs > latestTimestamp) {
        latestTimestamp = updatedMs;
        lastSavedIso = p.updatedAt;
      }
    }

    const avgBytes = Math.round(totalBytes / totalProjects);

    return {
      totalProjects,
      totalStorageUsedBytes: totalBytes,
      totalStorageUsedFormatted: formatBytes(totalBytes),
      largestProjectName: largestName || "Unnamed Project",
      largestProjectSizeBytes: largestBytes,
      largestProjectSizeFormatted: formatBytes(largestBytes),
      averageProjectSizeBytes: avgBytes,
      averageProjectSizeFormatted: formatBytes(avgBytes),
      lastSaved: lastSavedIso,
    };
  }
}
