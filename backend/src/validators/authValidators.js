import { body } from 'express-validator';

export const registerRules = [
  body('username')
    .isString().withMessage('username musi byc tekstem')
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('username: 3-30 znakow'),
  body('email')
    .isEmail().withMessage('Nieprawidlowy adres email')
    .normalizeEmail(),
  body('password')
    .isString()
    .isLength({ min: 6, max: 100 }).withMessage('haslo: min. 6 znakow'),
];

export const loginRules = [
  body('email').isEmail().withMessage('Nieprawidlowy adres email').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('haslo jest wymagane'),
];
