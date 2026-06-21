import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { registerRules, loginRules } from '../validators/authValidators.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);

export default router;
