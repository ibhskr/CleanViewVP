import * as SQLite from "expo-sqlite";

// 1. Open the database
export const db = SQLite.openDatabaseSync("media.db");

export function initMediaDB() {
  // 2. Optimization: Enable WAL mode for concurrent read/write
  db.execSync("PRAGMA journal_mode = WAL;");

  // 3. Create table with appropriate constraints
  db.execSync(`
    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY NOT NULL,
      uri TEXT NOT NULL,
      filename TEXT,
      folderPath TEXT,
      folderName TEXT,
      duration INTEGER,
      size INTEGER,
      modified INTEGER
    );
    
    -- 4. Speed up folder-specific queries
    CREATE INDEX IF NOT EXISTS idx_folderPath ON videos(folderPath);
  `);
}