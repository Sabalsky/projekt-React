import { AppError } from '../utils/AppError.js';
import { logger } from '../config/logger.js';

/**
 * Obsluga nieznanych tras - zwraca 404 w jednolitym formacie.
 */
export function notFoundHandler(req, _res, next) {
  next(AppError.notFound(`Nie znaleziono trasy: ${req.method} ${req.originalUrl}`));
}

/**
 * Globalny error handler - jedyne miejsce budujace odpowiedz bledu.
 * Mapuje AppError na kod HTTP; nieoczekiwane bledy -> 500.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  // Naruszenie unikalnosci w SQLite
  if (err && typeof err.message === 'string' && err.message.includes('UNIQUE constraint')) {
    return res.status(409).json({ error: { message: 'Naruszenie unikalnosci danych' } });
  }

  logger.error(err);
  res.status(500).json({ error: { message: 'Wewnetrzny blad serwera' } });
}
