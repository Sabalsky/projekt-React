import { auctionService } from '../services/auctionService.js';
import { bidService } from '../services/bidService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const auctionController = {
  // POST /auctions  (chroniony JWT)
  create: asyncHandler(async (req, res) => {
    const created = auctionService.create(req.body, req.user.id);
    res.status(201).json(created);
  }),

  // GET /auctions  (filtrowanie, sortowanie, paginacja)
  list: asyncHandler(async (req, res) => {
    const result = auctionService.list({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      category: req.query.category,
      status: req.query.status,
      sortBy: req.query.sortBy,
      order: req.query.order,
    });
    res.status(200).json(result);
  }),

  // GET /auctions/:id
  getById: asyncHandler(async (req, res) => {
    res.status(200).json(auctionService.getById(Number(req.params.id)));
  }),

  // PUT /auctions/:id  (chroniony JWT)
  update: asyncHandler(async (req, res) => {
    const updated = auctionService.update(Number(req.params.id), req.body, req.user.id);
    res.status(200).json(updated);
  }),

  // DELETE /auctions/:id  (chroniony JWT)
  remove: asyncHandler(async (req, res) => {
    auctionService.remove(Number(req.params.id), req.user.id);
    res.status(204).send();
  }),

  // POST /auctions/:id/bids  (chroniony JWT)
  placeBid: asyncHandler(async (req, res) => {
    const bid = bidService.placeBid(Number(req.params.id), Number(req.body.amount), req.user.id);
    res.status(201).json(bid);
  }),

  // GET /auctions/:id/bids
  bidHistory: asyncHandler(async (req, res) => {
    res.status(200).json(bidService.history(Number(req.params.id)));
  }),
};
