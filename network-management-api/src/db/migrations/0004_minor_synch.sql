ALTER TYPE "public"."subject_type" ADD VALUE 'Router' BEFORE 'Other';--> statement-breakpoint
ALTER TYPE "public"."invoice_status" ADD VALUE 'debt';--> statement-breakpoint
CREATE TABLE "routers" (
	"id" serial PRIMARY KEY NOT NULL,
	"router_name" varchar(100),
	"router_image" varchar(255),
	"router_image_public_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "router_id" integer;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "router_port" numeric;--> statement-breakpoint
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "public"."routers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscribers" DROP COLUMN "router_name";--> statement-breakpoint
ALTER TABLE "subscribers" DROP COLUMN "router_image";--> statement-breakpoint
ALTER TABLE "subscribers" DROP COLUMN "router_image_public_id";