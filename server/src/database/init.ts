import { Database } from "bun:sqlite";

export const db = new Database(":memory:");

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
  
  console.log('Database initialized successfully');
}

export default db;
