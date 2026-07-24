ALTER TABLE "exports" DROP CONSTRAINT "exports_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "exports" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "usage" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "usage" ADD COLUMN "workspace_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "usage" ADD CONSTRAINT "usage_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exports" DROP COLUMN "workspace_id";