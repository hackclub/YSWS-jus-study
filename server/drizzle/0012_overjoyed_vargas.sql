CREATE TABLE "devlog_attachments" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"cdnURL" text PRIMARY KEY NOT NULL,
	"devlogId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "joe_fraud_reviews" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"finishedAt" timestamp,
	"shipId" uuid PRIMARY KEY NOT NULL,
	"joeProjectId" uuid NOT NULL,
	"confidence" integer,
	"passed" boolean
);
--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."category";--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('CAD', 'Game Development', 'Web Development', 'PCB Design', 'App Development', 'Desktop App Development');--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "category" SET DATA TYPE "public"."category" USING "category"::"public"."category";--> statement-breakpoint
ALTER TABLE "project_reviews" ADD PRIMARY KEY ("shipId");--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "repository" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "devlog_attachments" ADD CONSTRAINT "devlog_attachments_devlogId_project_devlogs_id_fk" FOREIGN KEY ("devlogId") REFERENCES "public"."project_devlogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "joe_fraud_reviews" ADD CONSTRAINT "joe_fraud_reviews_shipId_project_ship_id_fk" FOREIGN KEY ("shipId") REFERENCES "public"."project_ship"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_devlogs" DROP COLUMN "attachment";--> statement-breakpoint
ALTER TABLE "project_reviews" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "project_reviews" DROP COLUMN "type";--> statement-breakpoint
DROP TYPE "public"."review_type";