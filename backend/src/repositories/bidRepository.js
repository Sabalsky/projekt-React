import { getDb } from '../config/database.js';

// zapytania o oferty - tutaj trzymana jest cala historia licytacji
export const bidRepository = {
  create({ auctionId, bidderId, amount }) {
    const stmt = getDb().prepare(
      `INSERT INTO bids (auction_id, bidder_id, amount) VALUES (?, ?, ?)`
    );
    const info = stmt.run(auctionId, bidderId, amount);
    return this.findById(Number(info.lastInsertRowid));
  },

  findById(id) {
    return getDb().prepare(`SELECT * FROM bids WHERE id = ?`).get(id);
  },

  // historia ofert danej aukcji, dorzucam nazwe licytujacego (JOIN), od najwyzszej kwoty
  findByAuction(auctionId) {
    return getDb()
      .prepare(
        `SELECT b.*, u.username AS bidder_username
           FROM bids b
           JOIN users u ON u.id = b.bidder_id
          WHERE b.auction_id = ?
          ORDER BY b.amount DESC, b.created_at DESC`
      )
      .all(auctionId);
  },

  // najwyzsza oferta (albo undefined jak nikt jeszcze nie licytowal)
  findHighest(auctionId) {
    return getDb()
      .prepare(`SELECT * FROM bids WHERE auction_id = ? ORDER BY amount DESC LIMIT 1`)
      .get(auctionId);
  },
};
