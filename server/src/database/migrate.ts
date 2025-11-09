#!/usr/bin/env bun
import { readFileSync } from 'fs';
import { join } from 'path';
import { sqlite } from './index';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env' });

async function runMigrations() {
  try {
    console.log('🚀 Running database migrations...');

    // Create migration tracking table if it doesn't exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "hash" text NOT NULL,
        "created_at" integer DEFAULT (strftime('%s', 'now'))
      )
    `);

    // Read and execute migration tracker first
    const trackerPath = join(__dirname, 'migrations', 'migration_tracker.sql');
    const trackerSQL = readFileSync(trackerPath, 'utf8');
    sqlite.exec(trackerSQL);

    // Read and execute initial schema migration
    const migrationPath = join(__dirname, 'migrations', '0001_initial_schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📝 Executing migration: 0001_initial_schema');
    sqlite.exec(migrationSQL);

    console.log('✅ Migrations completed successfully!');
    console.log('📊 Database tables created successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (import.meta.main) {
  runMigrations();
}