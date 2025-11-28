ALTER TABLE "account" ALTER COLUMN "access_token_expires_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "refresh_token_expires_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "expires_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "expires_at" SET DATA TYPE timestamp (3) with time zone;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "date_cloture" SET DATA TYPE timestamp (3) with time zone;