import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { config } from './config/env.js';
import { logger } from './config/logger.js';
import { openapiSpec } from './config/openapi.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import auctionRoutes from './routes/auctionRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

/**
 * Tworzy i konfiguruje aplikacje Express (bez uruchamiania nasluchu).
 * Wydzielone od server.js, dzieki czemu testy moga importowac samo `app`.
 */
export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  // Logowanie zadan HTTP przez winston (wymaganie: logowanie operacji)
  app.use(
    morgan('tiny', {
      stream: { write: (msg) => logger.http(msg.trim()) },
      skip: () => config.nodeEnv === 'test',
    })
  );

  // Healthcheck
  app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

  // Dokumentacja API
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
  app.get('/openapi.json', (_req, res) => res.json(openapiSpec));

  // Zasoby
  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);
  app.use('/auctions', auctionRoutes);

  // Obsluga bledow (na koncu lancucha)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
