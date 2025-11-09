const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

function runMigrations() {
  try {
    console.log('🚀 Running database migrations...');

    const databasePath = process.env.DATABASE_PATH || './data/sirko.sqlite';

    // Ensure data directory exists
    const dataDir = path.dirname(databasePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Create SQLite database connection
    const sqlite = new Database(databasePath);

    // Enable WAL mode for better concurrency
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    sqlite.pragma('optimize');

    // Create migration tracking table if it doesn't exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "hash" text NOT NULL,
        "created_at" integer DEFAULT (strftime('%s', 'now'))
      )
    `);

    // Read and execute migration tracker first
    const trackerPath = path.join(__dirname, 'migrations', 'migration_tracker.sql');
    const trackerSQL = fs.readFileSync(trackerPath, 'utf8');
    sqlite.exec(trackerSQL);

    // Read and execute initial schema migration
    const migrationPath = path.join(__dirname, 'migrations', '0001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Executing migration: 0001_initial_schema');
    sqlite.exec(migrationSQL);

    console.log('✅ Migrations completed successfully!');
    console.log('📊 Database tables created successfully');

    // Close database connection
    sqlite.close();

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}