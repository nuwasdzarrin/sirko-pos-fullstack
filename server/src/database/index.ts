import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env' });

const databasePath = process.env.DATABASE_PATH || './data/sirko.sqlite';

// Ensure data directory exists
import { mkdir } from 'fs';
import { dirname } from 'path';
mkdir(dirname(databasePath), { recursive: true });

// Create SQLite database connection
const sqlite = new Database(databasePath);

// Enable WAL mode for better concurrency
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('optimize');

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Export the raw SQLite instance for migrations
export { sqlite };

// Export schema
export * from './schema';