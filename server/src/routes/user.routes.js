import { Router } from 'express';
const router = Router();
router.get('/:id/library',        (_req, res) => res.json({ status: 'success', data: [] }));
router.post('/library',           (_req, res) => res.status(201).json({ status: 'success', data: {} }));
router.get('/:id/backlog',        (_req, res) => res.json({ status: 'success', data: [] }));
router.get('/:id/stats',          (_req, res) => res.json({ status: 'success', data: {} }));
router.patch('/:id/game/:gameId', (_req, res) => res.json({ status: 'success', data: {} }));
export default router;