import { Database } from "bun:sqlite";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";

const dbPath = './data/database.sqlite';

const dbDir = dirname(dbPath);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);

export function initializeDatabase(): void {
  console.log('Initializing database...');
  
  db.exec("PRAGMA foreign_keys = ON");
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS entities (
      id TEXT NOT NULL,
      type TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id, type)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS request_events (
      id TEXT PRIMARY KEY,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      response_time INTEGER,
      status_code INTEGER,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_request_events_status ON request_events(status);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_request_events_timestamp ON request_events(timestamp);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_request_events_path ON request_events(path);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS statistics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      top5_queries TEXT NOT NULL, -- JSON array of {path, count}
      total_requests INTEGER NOT NULL,
      popular_characters TEXT, -- JSON array of {characterId, requestCount}
      popular_movies TEXT, -- JSON array of {movieId, requestCount}
      computed_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_statistics_computed_at ON statistics(computed_at);
  `);
  
  console.log('Database initialized successfully');
}

export default db;
