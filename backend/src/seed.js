import { initDatabase, getDb, closeDatabase } from './config/database.js';
import { authService } from './services/authService.js';
import { auctionService } from './services/auctionService.js';
import { bidService } from './services/bidService.js';
import { logger } from './config/logger.js';

/**
 * Skrypt wypelniajacy baze przykladowymi danymi (uzytkownicy, aukcje, oferty).
 * Uruchom: npm run seed
 */
async function seed() {
  initDatabase();
  const db = getDb();

  // Czyszczenie istniejacych danych
  db.exec('DELETE FROM bids; DELETE FROM auctions; DELETE FROM users;');

  const alice = await authService.register({ username: 'alice', email: 'alice@example.com', password: 'haslo123' });
  const bob = await authService.register({ username: 'bob', email: 'bob@example.com', password: 'haslo123' });
  const carol = await authService.register({ username: 'carol', email: 'carol@example.com', password: 'haslo123' });

  const now = Date.now();
  const iso = (msOffset) => new Date(now + msOffset).toISOString();
  const day = 24 * 60 * 60 * 1000;

  const a1 = auctionService.create(
    { title: 'Rower gorski Trek', description: 'Rama 19", stan bardzo dobry', category: 'Sport', startingPrice: 500, startDate: iso(-day), endDate: iso(5 * day) },
    alice.user.id
  );
  const a2 = auctionService.create(
    { title: 'Laptop Dell XPS 13', description: 'i7, 16GB RAM, 512GB SSD', category: 'Elektronika', startingPrice: 2500, startDate: iso(-2 * day), endDate: iso(3 * day) },
    bob.user.id
  );
  auctionService.create(
    { title: 'Zegarek Omega Seamaster', description: 'Automatyczny, z dokumentami', category: 'Moda', startingPrice: 8000, startDate: iso(day), endDate: iso(7 * day) },
    alice.user.id
  );

  // Kilka ofert na aktywne aukcje
  bidService.placeBid(a1.id, 550, bob.user.id);
  bidService.placeBid(a1.id, 600, carol.user.id);
  bidService.placeBid(a2.id, 2600, alice.user.id);
  bidService.placeBid(a2.id, 2750, carol.user.id);

  logger.info('Baza wypelniona danymi przykladowymi.');
  logger.info('Konta testowe: alice@example.com / bob@example.com / carol@example.com (haslo: haslo123)');
  closeDatabase();
}

seed().catch((e) => {
  logger.error(e);
  process.exit(1);
});
