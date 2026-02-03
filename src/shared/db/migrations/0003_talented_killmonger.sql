CREATE TABLE "yield_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" text NOT NULL,
	"rate" numeric(10, 2) NOT NULL,
	"currency" char(3) DEFAULT 'ARS' NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "investments" ALTER COLUMN "days" DROP NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "yield_rates_provider_date_idx" ON "yield_rates" USING btree ("provider_id","date");