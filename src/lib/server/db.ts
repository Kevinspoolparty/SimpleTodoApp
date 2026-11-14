import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const dataDirectory = join(process.cwd(), 'data');

mkdirSync(dataDirectory, { recursive: true });

const db = new Database(join(dataDirectory, 'todos.db'));

db.pragma('journal_mode = WAL');

// TODO: make sure this aligns with the DB and the rest of my software
db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        inactive INTEGER NOT NULL DEFAULT 0
        archived INTEGER NOT NULL DEFAULT 0
    )
`);

export default db;