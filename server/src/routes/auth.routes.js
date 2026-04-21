import { Router } from 'express';
const router = Router();
router.post('/register', (_req, res) => res.status(201).json({ status: 'success', data: null }));
router.get('/me',        (_req, res) => res.json({ status: 'success', data: null }));
export default router;