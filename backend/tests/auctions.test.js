import { jest } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { initDatabase, closeDatabase } from '../src/config/database.js';

let app;

beforeEach(() => {
  initDatabase(':memory:');
  app = createApp();
});
afterEach(() => closeDatabase());

async function registerAndLogin(creds) {
  const res = await request(app).post('/auth/register').send(creds);
  return { token: res.body.token, user: res.body.user };
}

const futureAuction = {
  title: 'Testowy przedmiot',
  description: 'opis',
  category: 'Elektronika',
  startingPrice: 100,
  startDate: new Date(Date.now() - 1000).toISOString(),
  endDate: new Date(Date.now() + 3600_000).toISOString(),
};

describe('Aukcje - CRUD i walidacja', () => {
  test('tworzenie aukcji wymaga tokenu JWT (401)', async () => {
    const res = await request(app).post('/auctions').send(futureAuction);
    expect(res.status).toBe(401);
  });

  test('zalogowany uzytkownik tworzy aukcje (201) z current_price = cena wywolawcza', async () => {
    const { token } = await registerAndLogin({ username: 'owner', email: 'o@e.com', password: 'haslo123' });
    const res = await request(app).post('/auctions').set('Authorization', `Bearer ${token}`).send(futureAuction);
    expect(res.status).toBe(201);
    expect(res.body.currentPrice).toBe(100);
    expect(res.body.status).toBe('active');
  });

  test('walidacja: brak tytulu zwraca 400 z details', async () => {
    const { token } = await registerAndLogin({ username: 'owner', email: 'o@e.com', password: 'haslo123' });
    const res = await request(app).post('/auctions').set('Authorization', `Bearer ${token}`).send({ ...futureAuction, title: '' });
    expect(res.status).toBe(400);
    expect(res.body.error.details).toBeDefined();
  });

  test('filtrowanie po kategorii i paginacja', async () => {
    const { token } = await registerAndLogin({ username: 'owner', email: 'o@e.com', password: 'haslo123' });
    await request(app).post('/auctions').set('Authorization', `Bearer ${token}`).send(futureAuction);
    await request(app).post('/auctions').set('Authorization', `Bearer ${token}`).send({ ...futureAuction, category: 'Sport' });

    const res = await request(app).get('/auctions?category=Sport&page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].category).toBe('Sport');
  });

  test('nie mozna usunac cudzej aukcji (403)', async () => {
    const owner = await registerAndLogin({ username: 'owner', email: 'o@e.com', password: 'haslo123' });
    const other = await registerAndLogin({ username: 'other', email: 'x@e.com', password: 'haslo123' });
    const created = await request(app).post('/auctions').set('Authorization', `Bearer ${owner.token}`).send(futureAuction);
    const res = await request(app).delete(`/auctions/${created.body.id}`).set('Authorization', `Bearer ${other.token}`);
    expect(res.status).toBe(403);
  });
});

describe('Licytacja - reguly biznesowe', () => {
  async function setupAuction() {
    const owner = await registerAndLogin({ username: 'owner', email: 'o@e.com', password: 'haslo123' });
    const bidder = await registerAndLogin({ username: 'bidder', email: 'b@e.com', password: 'haslo123' });
    const created = await request(app).post('/auctions').set('Authorization', `Bearer ${owner.token}`).send(futureAuction);
    return { owner, bidder, auctionId: created.body.id };
  }

  test('oferta wyzsza niz cena aktualna jest przyjeta (201) i podnosi current_price', async () => {
    const { bidder, auctionId } = await setupAuction();
    const res = await request(app).post(`/auctions/${auctionId}/bids`).set('Authorization', `Bearer ${bidder.token}`).send({ amount: 150 });
    expect(res.status).toBe(201);
    const auction = await request(app).get(`/auctions/${auctionId}`);
    expect(auction.body.currentPrice).toBe(150);
  });

  test('oferta nie wyzsza niz aktualna cena jest odrzucona (400)', async () => {
    const { bidder, auctionId } = await setupAuction();
    const res = await request(app).post(`/auctions/${auctionId}/bids`).set('Authorization', `Bearer ${bidder.token}`).send({ amount: 100 });
    expect(res.status).toBe(400);
  });

  test('wlasciciel nie moze licytowac wlasnej aukcji (403)', async () => {
    const { owner, auctionId } = await setupAuction();
    const res = await request(app).post(`/auctions/${auctionId}/bids`).set('Authorization', `Bearer ${owner.token}`).send({ amount: 150 });
    expect(res.status).toBe(403);
  });

  test('nie mozna licytowac po zakonczeniu aukcji (400)', async () => {
    const owner = await registerAndLogin({ username: 'owner', email: 'o@e.com', password: 'haslo123' });
    const bidder = await registerAndLogin({ username: 'bidder', email: 'b@e.com', password: 'haslo123' });
    const ended = {
      ...futureAuction,
      startDate: new Date(Date.now() - 7200_000).toISOString(),
      endDate: new Date(Date.now() - 1000).toISOString(),
    };
    const created = await request(app).post('/auctions').set('Authorization', `Bearer ${owner.token}`).send(ended);
    const res = await request(app).post(`/auctions/${created.body.id}/bids`).set('Authorization', `Bearer ${bidder.token}`).send({ amount: 150 });
    expect(res.status).toBe(400);
  });

  test('historia ofert jest przechowywana i posortowana malejaco', async () => {
    const { bidder, auctionId } = await setupAuction();
    const second = await registerAndLogin({ username: 'second', email: 's@e.com', password: 'haslo123' });
    await request(app).post(`/auctions/${auctionId}/bids`).set('Authorization', `Bearer ${bidder.token}`).send({ amount: 150 });
    await request(app).post(`/auctions/${auctionId}/bids`).set('Authorization', `Bearer ${second.token}`).send({ amount: 200 });
    const res = await request(app).get(`/auctions/${auctionId}/bids`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].amount).toBe(200);
  });
});
