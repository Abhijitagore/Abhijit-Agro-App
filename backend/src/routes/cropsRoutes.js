import express from 'express';
import {
    getAllCrops,
    getCropById,
    createCrop,
    updateCrop,
    deleteCrop,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    addFertilizer,
    deleteFertilizer,
    addPesticide,
    deletePesticide,
    addSpray,
    deleteSpray,
} from '../controllers/cropsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

// Crop CRUD
router.get('/', getAllCrops);
router.get('/:id', getCropById);
router.post('/', createCrop);
router.put('/:id', updateCrop);
router.delete('/:id', deleteCrop);

// Schedule operations
router.post('/:crop_id/schedules', addSchedule);
router.put('/schedules/:id', updateSchedule);
router.delete('/schedules/:id', deleteSchedule);

// Fertilizer operations
router.post('/:crop_id/fertilizers', addFertilizer);
router.delete('/fertilizers/:id', deleteFertilizer);

// Pesticide operations
router.post('/:crop_id/pesticides', addPesticide);
router.delete('/pesticides/:id', deletePesticide);

// Spray operations
router.post('/:crop_id/sprays', addSpray);
router.delete('/sprays/:id', deleteSpray);

export default router;
