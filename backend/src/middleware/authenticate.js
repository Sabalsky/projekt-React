import { authService } from '../services/authService.js';
import { AppError } from '../utils/AppError.js';

// sprawdza token JWT z naglowka "Authorization: Bearer ...".
// jak jest ok, to dokleja dane usera do req.user, zeby kontroler wiedzial kto to
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
