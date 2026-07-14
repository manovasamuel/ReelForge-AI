CREATE TABLE "profile_cache" (
	"username_clean" varchar(255) PRIMARY KEY NOT NULL,
	"raw_profile" jsonb NOT NULL,
	"last_scraped_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_profile_cache_expires_at" ON "profile_cache" USING btree ("expires_at");