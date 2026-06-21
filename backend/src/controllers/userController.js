import { userService } from '../services/userService.js';
import { authService } from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const userController = {
  // POST /users  (rejestracja - alias /auth/register, wymagany przez specyfikacje)
  create: asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    const result = await authService.register({ username, email, password });
    res.status(201).json(result);
  }),

  // GET /users?page=&limit=
  list: asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    res.status(200).json(userService.list({ page, limit }));
  }),

  // GET /users/:id
  getById: asyncHandler(async (req, res) => {
    res.status(200).json(userService.getById(Number(req.params.id)));
  }),

  // PUT /users/:id  (chroniony JWT)
  update: asyncHandler(async (req, res) => {
    const { username, email } = req.body;
    const updated = userService.update(Number(req.params.id), { username, email }, req.user.id);
    res.status(200).json(updated);
  }),

  // DELETE /users/:id  (chroniony JWT)
  remove: asyncHandler(async (req, res) => {
    userService.remove(Number(req.params.id), req.user.id);
    res.status(204).send();
  }),
};
