import { getDb } from '../config/database.js';

/**
 * Repozytorium ofert (licytacji). Przechowuje pelna historie ofert dla aukcji.
 */
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

  /** Historia ofert aukcji (z nazwa licytujacego), od najnowszej. */
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

  /** Najwyzsza oferta aukcji (lub undefined gdy brak ofert). */
  findHighest(auctionId) {
    return getDb()
      .prepare(`SELECT * FROM bids WHERE auction_id = ? ORDER BY amount DESC LIMIT 1`)
      .get(auctionId);
  },
};
