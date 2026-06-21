import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

/**
 * Middleware uruchamiany po lancuchu regul express-validator.
 * Zbiera bledy walidacji i zwraca 400 z czytelnymi szczegolami.
 */
export function validate(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const details = result.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));
  next(AppError.badRequest('Bledy walidacji danych wejsciowych', details));
}
