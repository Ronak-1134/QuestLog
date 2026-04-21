import { Router } from 'express';
const router = Router();
router.post('/sync',   (_req, res) => res.json({ status: 'success', data: { synced: 0 } }));
router.get('/status',  (_req, res) => res.json({ status: 'success', data: { lastSync: null } }));
export default router;