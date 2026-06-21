import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

// leci po regulach express-validatora. jak cos sie nie zgadza,
// zbiera bledy i zwraca 400 z lista co jest nie tak
export function validate(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const details = result.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));
  next(AppError.badRequest('Bledy walidacji danych wejsciowych', details));
}
