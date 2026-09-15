ALTER TABLE "available_usernames" RENAME COLUMN "current_usage" TO "total_usage";--> statement-breakpoint
ALTER TABLE "available_usernames" ADD COLUMN "upload_usage" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "available_usernames" ADD COLUMN "download_usage" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "username_history" ADD COLUMN "change_cause" text;