ALTER TABLE "sms_logs" DROP CONSTRAINT IF EXISTS "sms_logs_template_id_sms_templates_id_fk";
--> statement-breakpoint
ALTER TABLE "sms_logs" ADD CONSTRAINT "sms_logs_template_id_sms_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."sms_templates"("id") ON DELETE set null ON UPDATE no action;
