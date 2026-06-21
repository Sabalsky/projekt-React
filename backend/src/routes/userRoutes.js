import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { idParam, updateUserRules } from '../validators/userValidators.js';
import { registerRules } from '../validators/authValidators.js';

const router = Router();

router.post('/', registerRules, validate, userController.create);
router.get('/', userController.list);
router.get('/:id', idParam, validate, userController.getById);
router.put('/:id', authenticate, updateUserRules, validate, userController.update);
router.delete('/:id', authenticate, idParam, validate, userController.remove);

export default router;
