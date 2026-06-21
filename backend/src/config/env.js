import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralna konfiguracja aplikacji czytana ze zmiennych srodowiskowych.
 * Dzieki temu reszta kodu nie odwoluje sie bezposrednio do process.env.
 */
export const config = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  dbFile: process.env.DB_FILE || './data/auction.db',
  logLevel: process.env.LOG_LEVEL || 'info',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  nodeEnv: process.env.NODE_ENV || 'development',
};
