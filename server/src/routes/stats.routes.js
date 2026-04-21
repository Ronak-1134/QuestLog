import { Router } from 'express';
const router = Router();
router.get('/global',      (_req, res) => res.json({ status: 'success', data: {} }));
router.get('/shame',       (_req, res) => res.json({ status: 'success', data: {} }));
router.get('/breakdown',   (_req, res) => res.json({ status: 'success', data: {} }));
router.get('/predict/:id', (_req, res) => res.json({ status: 'success', data: {} }));
export default router;