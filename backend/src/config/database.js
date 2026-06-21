import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './env.js';
import { logger } from './logger.js';

// Obsluga bazy SQLite. Korzystam z wbudowanego node:sqlite, zeby nie instalowac
// dodatkowych paczek (dziala od Node 22.5).

let db;

// laczy sie z baza i zaklada tabele jak ich nie ma. dbFile = ':memory:' uzywam w testach
export function initDatabase(dbFile = config.dbFile) {
  if (dbFile !== ':memory:') {
    const dir = path.dirname(dbFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  db = new DatabaseSync(dbFile);
  db.exec('PRAGMA foreign_keys = ON;');
  createSchema();
  logger.info(`Baza SQLite zainicjalizowana (${dbFile})`);
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error('Baza nie jest zainicjalizowana - najpierw initDatabase()');
  }
  return db;
}

// zamykam polaczenie - przydaje sie w testach
export function closeDatabase() {
  if (db) {
    db.close();
    db = undefined;
  }
}

function createSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT    NOT NULL UNIQUE,
      email         TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS auctions (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      title         TEXT    NOT NULL,
      description   TEXT    NOT NULL DEFAULT '',
      category      TEXT    NOT NULL,
      starting_price REAL   NOT NULL,
      current_price REAL    NOT NULL,
      start_date    TEXT    NOT NULL,
      end_date      TEXT    NOT NULL,
      owner_id      INTEGER NOT NULL,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bids (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      auction_id INTEGER NOT NULL,
      bidder_id  INTEGER NOT NULL,
      amount     REAL    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
      FOREIGN KEY (bidder_id)  REFERENCES users(id)    ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_auctions_category ON auctions(category);
    CREATE INDEX IF NOT EXISTS idx_auctions_owner    ON auctions(owner_id);
    CREATE INDEX IF NOT EXISTS idx_bids_auction      ON bids(auction_id);
  `);
}
