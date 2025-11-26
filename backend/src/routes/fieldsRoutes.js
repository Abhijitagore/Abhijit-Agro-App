import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    getAllFields,
    getFieldById,
    createField,
    updateField,
    deleteField
} from '../controllers/fieldsController.js';

import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllFields);
router.get('/:id', getFieldById);
router.post('/', upload.single('image'), createField);
router.put('/:id', upload.single('image'), updateField);
router.delete('/:id', deleteField);

export default router;
