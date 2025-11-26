import express from 'express';
import {
    getAllRevenue,
    getRevenueById,
    createRevenue,
    updateRevenue,
    deleteRevenue,
    getRevenueStats,
} from '../controllers/revenueController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

router.get('/', getAllRevenue);
router.get('/stats', getRevenueStats);
router.get('/:id', getRevenueById);
router.post('/', createRevenue);
router.put('/:id', updateRevenue);
router.delete('/:id', deleteRevenue);

export default router;
