ALTER TABLE "reviews" ALTER COLUMN "reviewer_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "widgets" ADD COLUMN "installs" integer DEFAULT 0 NOT NULL;