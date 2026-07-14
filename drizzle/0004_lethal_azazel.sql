CREATE TABLE "ai_cache" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"type" varchar(100) NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_ai_cache_expires_at" ON "ai_cache" USING btree ("expires_at");