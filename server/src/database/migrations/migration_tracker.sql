-- Migration tracking table
CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	"hash" text NOT NULL,
	"created_at" integer DEFAULT (strftime('%s', 'now'))
);

-- Insert initial migration
INSERT OR IGNORE INTO "__drizzle_migrations" ("hash") VALUES ('0001_initial_schema');