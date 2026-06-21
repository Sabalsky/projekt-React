import { auctionRepository } from '../repositories/auctionRepository.js';
import { toAuctionDto } from '../dto/index.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../config/logger.js';

// obsluga aukcji - dodawanie, edycja, usuwanie i lista z filtrami
export const auctionService = {
  create(data, ownerId) {
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      throw AppError.badRequest('Data zakonczenia musi byc pozniejsza niz data rozpoczecia');
    }
    const auction = auctionRepository.create({ ...data, ownerId });
    logger.info(`Utworzono aukcje id=${auction.id} przez uzytkownika ${ownerId}`);
    return toAuctionDto(auction);
  },

  getById(id) {
    const auction = auctionRepository.findById(id);
    if (!auction) throw AppError.notFound('Aukcja nie zostala znaleziona');
    return toAuctionDto(auction);
  },

  // surowy rekord z bazy - potrzebny w bidService do sprawdzania dat i wlasciciela
  getRawOrThrow(id) {
    const auction = auctionRepository.findById(id);
    if (!auction) throw AppError.notFound('Aukcja nie zostala znaleziona');
    return auction;
  },

  list(query) {
    const page = query.page;
    const limit = query.limit;
    const offset = (page - 1) * limit;

    const { rows, total } = auctionRepository.findAll({
      category: query.category,
      status: query.status,
      sortBy: query.sortBy,
      order: query.order,
      limit,
      offset,
    });

    return {
      items: rows.map(toAuctionDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  update(id, data, currentUserId) {
    const auction = this.getRawOrThrow(id);
    if (auction.owner_id !== currentUserId) {
      throw AppError.forbidden('Mozesz edytowac tylko wlasne aukcje');
    }
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      throw AppError.badRequest('Data zakonczenia musi byc pozniejsza niz data rozpoczecia');
    }
    if (data.startingPrice > auction.current_price) {
      throw AppError.badRequest('Cena wywolawcza nie moze byc wyzsza niz aktualna oferta');
    }
    const updated = auctionRepository.update(id, data);
    logger.info(`Zaktualizowano aukcje id=${id}`);
    return toAuctionDto(updated);
  },

  remove(id, currentUserId) {
    const auction = this.getRawOrThrow(id);
    if (auction.owner_id !== currentUserId) {
      throw AppError.forbidden('Mozesz usunac tylko wlasne aukcje');
    }
    auctionRepository.remove(id);
    logger.info(`Usunieto aukcje id=${id}`);
  },
};
