import { userRepository } from '../repositories/userRepository.js';
import { toUserDto } from '../dto/index.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../config/logger.js';

// operacje na uzytkownikach (CRUD)
export const userService = {
  getById(id) {
    const user = userRepository.findById(id);
    if (!user) throw AppError.notFound('Uzytkownik nie zostal znaleziony');
    return toUserDto(user);
  },

  list({ page, limit }) {
    const offset = (page - 1) * limit;
    const items = userRepository.findAll({ limit, offset }).map(toUserDto);
    const total = userRepository.count();
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  update(id, { username, email }, currentUserId) {
    const user = userRepository.findById(id);
    if (!user) throw AppError.notFound('Uzytkownik nie zostal znaleziony');
    if (user.id !== currentUserId) {
      throw AppError.forbidden('Mozesz edytowac tylko wlasne konto');
    }

    const byEmail = userRepository.findByEmail(email);
    if (byEmail && byEmail.id !== id) throw AppError.conflict('Email jest juz zajety');
    const byName = userRepository.findByUsername(username);
    if (byName && byName.id !== id) throw AppError.conflict('Nazwa uzytkownika jest juz zajeta');

    const updated = userRepository.update(id, { username, email });
    logger.info(`Zaktualizowano uzytkownika id=${id}`);
    return toUserDto(updated);
  },

  remove(id, currentUserId) {
    const user = userRepository.findById(id);
    if (!user) throw AppError.notFound('Uzytkownik nie zostal znaleziony');
    if (user.id !== currentUserId) {
      throw AppError.forbidden('Mozesz usunac tylko wlasne konto');
    }
    userRepository.remove(id);
    logger.info(`Usunieto uzytkownika id=${id}`);
  },
};
