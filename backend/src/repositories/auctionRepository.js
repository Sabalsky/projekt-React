import { getDb } from '../config/database.js';

// zapytania SQL do tabeli auctions.
// kolumny do sortowania trzymam na sztywno tutaj, zeby nie dalo sie wstrzyknac czegos do ORDER BY
const SORTABLE = {
  created_at: 'created_at',
  end_date: 'end_date',
  current_price: 'current_price',
  title: 'title',
};

export const auctionRepository = {
  create(data) {
    const stmt = getDb().prepare(`
      INSERT INTO auctions
        (title, description, category, starting_price, current_price, start_date, end_date, owner_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      data.title,
      data.description,
      data.category,
      data.startingPrice,
      data.startingPrice, // current_price startuje od ceny wywolawczej
      data.startDate,
      data.endDate,
      data.ownerId
    );
    return this.findById(Number(info.lastInsertRowid));
  },

  findById(id) {
    return getDb().prepare(`SELECT * FROM auctions WHERE id = ?`).get(id);
  },

  // lista aukcji z filtrami (kategoria, status), sortowaniem i paginacja.
  // status nie jest w bazie, wiec licze go datami wzgledem 'now'
  findAll({ category, status, sortBy, order, limit, offset }) {
    const where = [];
    const params = [];

    if (category) {
      where.push('category = ?');
      params.push(category);
    }
    if (status === 'active') {
      where.push(`(datetime(start_date) <= datetime('now') AND datetime(end_date) > datetime('now'))`);
    } else if (status === 'ended') {
      where.push(`datetime(end_date) <= datetime('now')`);
    } else if (status === 'scheduled') {
      where.push(`datetime(start_date) > datetime('now')`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const sortCol = SORTABLE[sortBy] || 'created_at';
    const sortDir = order === 'asc' ? 'ASC' : 'DESC';

    const total = getDb()
      .prepare(`SELECT COUNT(*) AS c FROM auctions ${whereSql}`)
      .get(...params).c;

    const rows = getDb()
      .prepare(
        `SELECT * FROM auctions ${whereSql} ORDER BY ${sortCol} ${sortDir} LIMIT ? OFFSET ?`
      )
      .all(...params, limit, offset);

    return { rows, total };
  },

  update(id, data) {
    getDb()
      .prepare(
        `UPDATE auctions
           SET title = ?, description = ?, category = ?, starting_price = ?,
               start_date = ?, end_date = ?
         WHERE id = ?`
      )
      .run(
        data.title,
        data.description,
        data.category,
        data.startingPrice,
        data.startDate,
        data.endDate,
        id
      );
    return this.findById(id);
  },

  // podbicie aktualnej ceny po nowej ofercie
  updateCurrentPrice(id, amount) {
    getDb().prepare(`UPDATE auctions SET current_price = ? WHERE id = ?`).run(amount, id);
    return this.findById(id);
  },

  remove(id) {
    const info = getDb().prepare(`DELETE FROM auctions WHERE id = ?`).run(id);
    return info.changes > 0;
  },
};
