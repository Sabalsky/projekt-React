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

describe('Uzytkownicy i uwierzytelnianie', () => {
  test('rejestracja zwraca 201, token i nie ujawnia hasla', async () => {
    const res = await request(app).post('/users').send({ username: 'jan', email: 'jan@e.com', password: 'haslo123' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.password_hash).toBeUndefined();
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('rejestracja z zajetym emailem zwraca 409', async () => {
    await request(app).post('/users').send({ username: 'jan', email: 'jan@e.com', password: 'haslo123' });
    const res = await request(app).post('/users').send({ username: 'jan2', email: 'jan@e.com', password: 'haslo123' });
    expect(res.status).toBe(409);
  });

  test('logowanie blednym haslem zwraca 401', async () => {
    await request(app).post('/users').send({ username: 'jan', email: 'jan@e.com', password: 'haslo123' });
    const res = await request(app).post('/auth/login').send({ email: 'jan@e.com', password: 'zle' });
    expect(res.status).toBe(401);
  });

  test('pobranie nieistniejacego uzytkownika zwraca 404', async () => {
    const res = await request(app).get('/users/9999');
    expect(res.status).toBe(404);
  });

  test('uzytkownik moze edytowac wlasne konto (200), ale nie cudze (403)', async () => {
    const jan = await request(app).post('/users').send({ username: 'jan', email: 'jan@e.com', password: 'haslo123' });
    const ola = await request(app).post('/users').send({ username: 'ola', email: 'ola@e.com', password: 'haslo123' });

    const ok = await request(app)
      .put(`/users/${jan.body.user.id}`)
      .set('Authorization', `Bearer ${jan.body.token}`)
      .send({ username: 'jan_nowy', email: 'jan@e.com' });
    expect(ok.status).toBe(200);
    expect(ok.body.username).toBe('jan_nowy');

    const forbidden = await request(app)
      .put(`/users/${ola.body.user.id}`)
      .set('Authorization', `Bearer ${jan.body.token}`)
      .send({ username: 'hack', email: 'ola@e.com' });
    expect(forbidden.status).toBe(403);
  });
});
