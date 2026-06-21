import { authService } from '../services/authService.js';
import { AppError } from '../utils/AppError.js';

/**
 * Middleware autoryzacji JWT. Oczekuje naglowka: Authorization: Bearer <token>.
 * Po sukcesie dokleja req.user = { id, username }.
 */
export function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(AppError.unauthorized('Wymagany naglowek Authorization: Bearer <token>'));
  }

  const payload = authService.verifyToken(token);
  req.user = { id: payload.sub, username: payload.username };
  next();
}
