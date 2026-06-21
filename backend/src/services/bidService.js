import { bidRepository } from '../repositories/bidRepository.js';
import { auctionRepository } from '../repositories/auctionRepository.js';
import { auctionService } from './auctionService.js';
import { toBidDto } from '../dto/index.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../config/logger.js';

/**
 * Logika licytacji - serce regul biznesowych systemu:
 *  - oferta musi byc wyzsza niz aktualna cena,
 *  - nie mozna licytowac przed startem ani po zakonczeniu aukcji,
 *  - wlasciciel nie moze licytowac wlasnej aukcji,
 *  - kazda oferta trafia do historii.
 */
export const bidService = {
  placeBid(auctionId, amount, bidderId) {
    const auction = auctionService.getRawOrThrow(auctionId);
    const now = new Date();
    const start = new Date(auction.start_date);
    const end = new Date(auction.end_date);

    if (now < start) {
      throw AppError.badRequest('Aukcja jeszcze sie nie rozpoczela');
    }
    if (now >= end) {
      throw AppError.badRequest('Aukcja zostala juz zakonczona - nie mozna licytowac');
    }
    if (auction.owner_id === bidderId) {
      throw AppError.forbidden('Nie mozesz licytowac wlasnej aukcji');
    }
    if (amount <= auction.current_price) {
      throw AppError.badRequest(
        `Oferta musi byc wyzsza niz aktualna cena (${auction.current_price})`
      );
    }

    const bid = bidRepository.create({ auctionId, bidderId, amount });
    auctionRepository.updateCurrentPrice(auctionId, amount);
    logger.info(`Nowa oferta ${amount} na aukcji ${auctionId} od uzytkownika ${bidderId}`);
    return toBidDto(bid);
  },

  history(auctionId) {
    auctionService.getRawOrThrow(auctionId); // 404 gdy aukcja nie istnieje
    return bidRepository.findByAuction(auctionId).map(toBidDto);
  },
};
