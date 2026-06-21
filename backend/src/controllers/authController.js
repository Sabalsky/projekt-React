import { authService } from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authController = {
  register: asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    const result = await authService.register({ username, email, password });
    res.status(201).json(result);
  }),

  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.status(200).json(result);
  }),
};
