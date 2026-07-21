CREATE TYPE "public"."feedback_status" AS ENUM('new', 'triaged', 'resolved', 'wont_fix');--> statement-breakpoint
CREATE TYPE "public"."feedback_type" AS ENUM('bug', 'feature', 'general');--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" "feedback_type" NOT NULL,
	"message" text NOT NULL,
	"status" "feedback_status" DEFAULT 'new' NOT NULL,
	"path" text,
	"user_agent" text,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feedback_user_id_idx" ON "feedback" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "feedback_status_idx" ON "feedback" USING btree ("status");--> statement-breakpoint
CREATE INDEX "feedback_created_at_idx" ON "feedback" USING btree ("created_at");