CREATE TYPE "public"."activity_action" AS ENUM('Created', 'Updated', 'Deleted');--> statement-breakpoint
CREATE TYPE "public"."subject_type" AS ENUM('Subscriber', 'Customer', 'Username', 'Speed', 'Invoice', 'Role', 'Admin User', 'Mikrotik', 'SMS', 'Support', 'Card Group', 'Group Bandwidth Scheduler', 'Other');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('unpaid', 'partial', 'paid');--> statement-breakpoint
CREATE TYPE "public"."payment_methods" AS ENUM('cash', 'bank_transfer', 'credit');--> statement-breakpoint
CREATE TYPE "public"."sms_log_status" AS ENUM('sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."support_ticket_channel" AS ENUM('phone', 'visit', 'whatsapp', 'other');--> statement-breakpoint
CREATE TYPE "public"."support_ticket_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."support_ticket_status" AS ENUM('open', 'in_progress', 'waiting_customer', 'resolved');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" integer,
	"admin_name" varchar(200),
	"action" "activity_action" NOT NULL,
	"subject_type" "subject_type" NOT NULL,
	"subject_id" integer,
	"subject_name" varchar(255),
	"method" varchar(10) NOT NULL,
	"endpoint" varchar(255) NOT NULL,
	"status_code" integer DEFAULT 200,
	"ip_address" varchar(120),
	"details" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"username" varchar(100) NOT NULL,
	"email" varchar(200) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role_id" integer NOT NULL,
	"status" "user_status" DEFAULT 'active',
	"password_reset_token" varchar(255),
	"password_reset_token_expiry" timestamp with time zone,
	"last_login_at" timestamp,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "available_usernames" (
	"id" serial PRIMARY KEY NOT NULL,
	"speed_id" integer NOT NULL,
	"username" varchar(100) NOT NULL,
	"password" varchar(100) NOT NULL,
	"usage_limit" integer,
	"current_usage" integer DEFAULT 0,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"is_owner_username" boolean DEFAULT false,
	"is_used" boolean DEFAULT false,
	"is_expired" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "available_usernames_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscriber_id" integer NOT NULL,
	"created_by" integer NOT NULL,
	"amount" numeric(10, 2) DEFAULT '0',
	"paid_amount" numeric(10, 2) DEFAULT '0',
	"payment_method" "payment_methods" NOT NULL,
	"status" "invoice_status" DEFAULT 'unpaid',
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(60) NOT NULL,
	"display_name" varchar(120) NOT NULL,
	"description" text,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sms_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"sent_by_user_id" integer NOT NULL,
	"subscriber_id" integer,
	"phone" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"recipient_type" varchar(20) NOT NULL,
	"status" "sms_log_status" NOT NULL,
	"provider_response" text,
	"error_message" text,
	"template_id" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sms_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"body" text NOT NULL,
	"created_by_user_id" integer,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "speed_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscriber_id" integer NOT NULL,
	"old_speed" integer NOT NULL,
	"new_speed" integer NOT NULL,
	"usage_start_date" timestamp with time zone,
	"usage_end_date" timestamp with time zone,
	"days_used" integer DEFAULT 0,
	"changed_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "speed_tiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"speed_value" integer NOT NULL,
	"price" numeric(10, 2),
	"deleted" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"username_id" integer,
	"line_id" varchar(20),
	"full_name" varchar(200),
	"facility_type" varchar(200),
	"phone" varchar(50),
	"router_name" varchar(100),
	"router_image" varchar(255),
	"router_image_public_id" varchar(255),
	"monthly_price" numeric(10, 2) DEFAULT '-1',
	"is_suspended" boolean DEFAULT false,
	"is_paused" boolean DEFAULT false,
	"notes" text,
	"balance" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now(),
	"suspend_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "subscribers_line_id_unique" UNIQUE("line_id")
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_number" varchar(32) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text NOT NULL,
	"status" "support_ticket_status" DEFAULT 'open' NOT NULL,
	"priority" "support_ticket_priority" DEFAULT 'medium' NOT NULL,
	"channel" "support_ticket_channel" DEFAULT 'phone' NOT NULL,
	"subscriber_name" varchar(200) NOT NULL,
	"subscriber_phone" varchar(50) NOT NULL,
	"assigned_to" varchar(200) DEFAULT 'Unassigned' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	CONSTRAINT "support_tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "username_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscriber_id" integer NOT NULL,
	"old_username" varchar(100) NOT NULL,
	"old_password" varchar(255),
	"usage_start_date" timestamp with time zone,
	"usage_end_date" timestamp with time zone,
	"changed_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_admin_id_admin_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "available_usernames" ADD CONSTRAINT "available_usernames_speed_id_speed_tiers_id_fk" FOREIGN KEY ("speed_id") REFERENCES "public"."speed_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_logs" ADD CONSTRAINT "sms_logs_sent_by_user_id_admin_users_id_fk" FOREIGN KEY ("sent_by_user_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_logs" ADD CONSTRAINT "sms_logs_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_logs" ADD CONSTRAINT "sms_logs_template_id_sms_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."sms_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_templates" ADD CONSTRAINT "sms_templates_created_by_user_id_admin_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speed_history" ADD CONSTRAINT "speed_history_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_username_id_available_usernames_id_fk" FOREIGN KEY ("username_id") REFERENCES "public"."available_usernames"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "username_history" ADD CONSTRAINT "username_history_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE no action ON UPDATE no action;