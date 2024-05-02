DO $$ BEGIN
 CREATE TYPE "activity_operations" AS ENUM('READ', 'INSERT', 'UPDATE', 'DELETE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "color" AS ENUM('rose', 'yellow', 'red', 'purple', 'blue', 'green', 'orange', 'brown', 'gray');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "columns" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"name" text NOT NULL,
	"colorSpace" "color" DEFAULT 'purple' NOT NULL,
	"order" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "columns_order_unique" UNIQUE("order")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cards" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"column_id" bigint NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"order" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cards_order_unique" UNIQUE("order")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cards" ADD CONSTRAINT "cards_column_id_columns_id_fk" FOREIGN KEY ("column_id") REFERENCES "columns"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
