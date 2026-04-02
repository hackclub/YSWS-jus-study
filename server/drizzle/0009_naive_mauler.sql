ALTER TYPE "public"."ship_status" ADD VALUE 'pre-payout' BEFORE 'finished';--> statement-breakpoint
CREATE TABLE "user_stats" (
	"userId" text PRIMARY KEY NOT NULL,
	"votesCast" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_stats" ALTER COLUMN "sigma" SET DEFAULT 8.333333333333334;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "nickname" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(id::text, '')) || ' ' || coalesce(slackId, '') || ' ' || coalesce(nickname, '')) STORED;--> statement-breakpoint
ALTER TABLE "project_ship" ADD COLUMN "payout" integer;--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_search_idx" ON "users" USING gin ("search_vector");--> statement-breakpoint
ALTER TABLE "project_stats" DROP COLUMN "isSettled";