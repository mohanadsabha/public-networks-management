ALTER TABLE "available_usernames" ADD COLUMN "last_upload_usage" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "available_usernames" ADD COLUMN "last_download_usage" integer DEFAULT 0;