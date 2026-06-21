import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { userRepository } from '../repositories/userRepository.js';
import { toUserDto } from '../dto/index.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../config/logger.js';

const SALT_ROUNDS = 10;

// rejestracja, logowanie i wydawanie tokenow JWT
export const authService = {
  async register({ username, email, password }) {
    if (userRepository.findByEmail(email)) {
      throw AppError.conflict('Uzytkownik z tym adresem email juz istnieje');
    }
    if (userRepository.findByUsername(username)) {
      throw AppError.conflict('Ta nazwa uzytkownika jest juz zajeta');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = userRepository.create({ username, email, passwordHash });
    logger.info(`Zarejestrowano uzytkownika id=${user.id} (${email})`);

    return { user: toUserDto(user), token: this.issueToken(user) };
  },

  async login({ email, password }) {
    const user = userRepository.findByEmail(email);
    if (!user) {
      throw AppError.unauthorized('Nieprawidlowy email lub haslo');
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      throw AppError.unauthorized('Nieprawidlowy email lub haslo');
    }
    logger.info(`Zalogowano uzytkownika id=${user.id}`);
    return { user: toUserDto(user), token: this.issueToken(user) };
  },

  issueToken(user) {
    return jwt.sign({ sub: user.id, username: user.username }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });
  },

  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch {
      throw AppError.unauthorized('Token nieprawidlowy lub wygasl');
    }
  },
};
