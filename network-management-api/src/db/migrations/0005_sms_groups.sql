CREATE TABLE IF NOT EXISTS "sms_groups" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(120) NOT NULL,
  "description" text,
  "created_by_user_id" integer,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "sms_group_members" (
  "id" serial PRIMARY KEY NOT NULL,
  "group_id" integer NOT NULL,
  "subscriber_id" integer NOT NULL,
  "created_at" timestamptz DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE "sms_groups"
    ADD CONSTRAINT "sms_groups_created_by_user_id_admin_users_id_fk"
    FOREIGN KEY ("created_by_user_id") REFERENCES "admin_users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "sms_group_members"
    ADD CONSTRAINT "sms_group_members_group_id_sms_groups_id_fk"
    FOREIGN KEY ("group_id") REFERENCES "sms_groups"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "sms_group_members"
    ADD CONSTRAINT "sms_group_members_subscriber_id_subscribers_id_fk"
    FOREIGN KEY ("subscriber_id") REFERENCES "subscribers"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "sms_group_members_group_subscriber_uidx"
  ON "sms_group_members" ("group_id", "subscriber_id");
