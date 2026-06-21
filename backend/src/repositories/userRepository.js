import { getDb } from '../config/database.js';

/**
 * Repozytorium uzytkownikow - jedyne miejsce z zapytaniami SQL o tabele users.
 * Zwraca surowe rekordy (snake_case); mapowanie na DTO robi warstwa wyzej.
 */
export const userRepository = {
  create({ username, email, passwordHash }) {
    const stmt = getDb().prepare(
      `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`
    );
    const info = stmt.run(username, email, passwordHash);
    return this.findById(Number(info.lastInsertRowid));
  },

  findById(id) {
    return getDb().prepare(`SELECT * FROM users WHERE id = ?`).get(id);
  },

  findByEmail(email) {
    return getDb().prepare(`SELECT * FROM users WHERE email = ?`).get(email);
  },

  findByUsername(username) {
    return getDb().prepare(`SELECT * FROM users WHERE username = ?`).get(username);
  },

  findAll({ limit, offset }) {
    return getDb()
      .prepare(`SELECT * FROM users ORDER BY id LIMIT ? OFFSET ?`)
      .all(limit, offset);
  },

  count() {
    return getDb().prepare(`SELECT COUNT(*) AS c FROM users`).get().c;
  },

  update(id, { username, email }) {
    getDb()
      .prepare(`UPDATE users SET username = ?, email = ? WHERE id = ?`)
      .run(username, email, id);
    return this.findById(id);
  },

  remove(id) {
    const info = getDb().prepare(`DELETE FROM users WHERE id = ?`).run(id);
    return info.changes > 0;
  },
};
