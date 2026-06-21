import { body, param, query } from 'express-validator';

export const idParam = [param('id').isInt({ min: 1 }).withMessage('id musi byc liczba calkowita')];

const baseAuctionRules = [
  body('title').isString().trim().isLength({ min: 3, max: 120 }).withMessage('title: 3-120 znakow'),
  body('description').optional().isString().isLength({ max: 2000 }).withMessage('opis: max 2000 znakow'),
  body('category').isString().trim().notEmpty().withMessage('category jest wymagana'),
  body('startingPrice').isFloat({ gt: 0 }).withMessage('startingPrice musi byc liczba > 0'),
  body('startDate').isISO8601().withMessage('startDate musi byc data ISO 8601'),
  body('endDate').isISO8601().withMessage('endDate musi byc data ISO 8601'),
];

export const createAuctionRules = [...baseAuctionRules];
export const updateAuctionRules = [...idParam, ...baseAuctionRules];

export const listAuctionRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('category').optional().isString().trim(),
  query('status').optional().isIn(['active', 'ended', 'scheduled']).withMessage('status: active|ended|scheduled'),
  query('sortBy').optional().isIn(['created_at', 'end_date', 'current_price', 'title']),
  query('order').optional().isIn(['asc', 'desc']),
];

export const bidRules = [
  ...idParam,
  body('amount').isFloat({ gt: 0 }).withMessage('amount musi byc liczba > 0'),
];
