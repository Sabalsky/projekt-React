import { createApp } from './app.js';
import { initDatabase, closeDatabase } from './config/database.js';
import { config } from './config/env.js';
import { logger } from './config/logger.js';

// start aplikacji - najpierw baza, potem serwer
initDatabase();
const app = createApp();

const server = app.listen(config.port, () => {
  logger.info(`Serwer dziala na http://localhost:${config.port}`);
  logger.info(`Dokumentacja Swagger: http://localhost:${config.port}/api-docs`);
});

// zeby ladnie zamknac baze przy ctrl+c
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    logger.info(`Otrzymano ${signal}, zamykam serwer...`);
    server.close(() => {
      closeDatabase();
      process.exit(0);
    });
  });
}
