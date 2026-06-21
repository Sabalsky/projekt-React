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

// konfiguracja Expressa. wydzielilem to od server.js, zeby testy mogly
// importowac samo app bez odpalania serwera na porcie
export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  // logowanie kazdego zapytania HTTP do logow
  app.use(
    morgan('tiny', {
      stream: { write: (msg) => logger.http(msg.trim()) },
      skip: () => config.nodeEnv === 'test',
    })
  );

  // Healthcheck
  app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

  // Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
  app.get('/openapi.json', (_req, res) => res.json(openapiSpec));

  // trasy
  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);
  app.use('/auctions', auctionRoutes);

  // to musi byc na samym koncu - obsluga bledow i nieznanych tras
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
