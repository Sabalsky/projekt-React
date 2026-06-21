import { Router } from 'express';
import { auctionController } from '../controllers/auctionController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  idParam,
  createAuctionRules,
  updateAuctionRules,
  listAuctionRules,
  bidRules,
} from '../validators/auctionValidators.js';

const router = Router();

router.get('/', listAuctionRules, validate, auctionController.list);
router.get('/:id', idParam, validate, auctionController.getById);
router.post('/', authenticate, createAuctionRules, validate, auctionController.create);
router.put('/:id', authenticate, updateAuctionRules, validate, auctionController.update);
router.delete('/:id', authenticate, idParam, validate, auctionController.remove);

// Licytacja
router.get('/:id/bids', idParam, validate, auctionController.bidHistory);
router.post('/:id/bids', authenticate, bidRules, validate, auctionController.placeBid);

export default router;
