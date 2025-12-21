import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

let db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    // SQLite fungerar inte i web-miljö utan extra konfiguration
    // För web skulle vi behöva använda IndexedDB eller localStorage
    // För nu, låt oss bara krascha tydligt i web om någon försöker använda det
    if (Platform.OS === 'web') {
      throw new Error(
        'SQLite stöds inte i web-miljö. Använd mobilapp (iOS/Android) istället.'
      );
    }
    
    db = SQLite.openDatabaseSync('findly.db');
    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(db: SQLite.SQLiteDatabase): void {
  // Skapa tabeller
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pin_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS onboarding_status (
      id INTEGER PRIMARY KEY,
      is_complete INTEGER DEFAULT 0,
      first_space_created INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS spaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS zones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      space_id INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS boxes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      space_id INTEGER NOT NULL,
      zone_id INTEGER,
      label_code TEXT UNIQUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE,
      FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      space_id INTEGER NOT NULL,
      zone_id INTEGER,
      box_id INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE,
      FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL,
      FOREIGN KEY (box_id) REFERENCES boxes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS item_tags (
      item_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (item_id, tag_id),
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS item_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      uri TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS box_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      box_id INTEGER NOT NULL,
      uri TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (box_id) REFERENCES boxes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS guests_local (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pin TEXT NOT NULL,
      enabled INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

/**
 * Rensar alla användare från databasen (användbart för test/reset)
 */
export function clearUsers(): void {
  const db = getDatabase();
  db.execSync('DELETE FROM users');
  db.execSync('DELETE FROM onboarding_status');
}

export function resetDatabase(): void {
  if (db) {
    db.closeSync();
    db = null;
  }
  // I test-miljön kan vi återställa databasen
  const testDb = SQLite.openDatabaseSync('findly.db');
  testDb.execSync(`
    DROP TABLE IF EXISTS item_tags;
    DROP TABLE IF EXISTS item_images;
    DROP TABLE IF EXISTS box_images;
    DROP TABLE IF EXISTS items;
    DROP TABLE IF EXISTS tags;
    DROP TABLE IF EXISTS boxes;
    DROP TABLE IF EXISTS zones;
    DROP TABLE IF EXISTS spaces;
    DROP TABLE IF EXISTS guests_local;
    DROP TABLE IF EXISTS onboarding_status;
    DROP TABLE IF EXISTS users;
  `);
  testDb.closeSync();
}
