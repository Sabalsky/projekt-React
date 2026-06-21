import { body, param } from 'express-validator';

export const idParam = [param('id').isInt({ min: 1 }).withMessage('id musi byc liczba calkowita')];

export const updateUserRules = [
  ...idParam,
  body('username').isString().trim().isLength({ min: 3, max: 30 }).withMessage('username: 3-30 znakow'),
  body('email').isEmail().withMessage('Nieprawidlowy adres email').normalizeEmail(),
];
