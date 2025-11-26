import { query } from '../config/database.js';

// Get all crops for the authenticated user
export const getAllCrops = async (req, res) => {
    try {
        const result = await query(
            `SELECT c.*, f.name as field_name 
       FROM crops c 
       LEFT JOIN fields f ON c.field_id = f.id 
       WHERE c.user_id = $1 
       ORDER BY c.created_at DESC`,
            [req.user.id]
        );

        res.json({ crops: result.rows });
    } catch (error) {
        console.error('Error fetching crops:', error);
        res.status(500).json({ error: 'Failed to fetch crops' });
    }
};

// Get single crop with all related data
export const getCropById = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch crop
        const cropResult = await query(
            `SELECT c.*, f.name as field_name 
       FROM crops c 
       LEFT JOIN fields f ON c.field_id = f.id 
       WHERE c.id = $1 AND c.user_id = $2`,
            [id, req.user.id]
        );

        if (cropResult.rows.length === 0) {
            return res.status(404).json({ error: 'Crop not found' });
        }

        const crop = cropResult.rows[0];

        // Fetch schedules
        const schedulesResult = await query(
            'SELECT * FROM schedules WHERE crop_id = $1 ORDER BY date',
            [id]
        );

        // Fetch fertilizers
        const fertilizersResult = await query(
            'SELECT * FROM fertilizers WHERE crop_id = $1 ORDER BY date DESC',
            [id]
        );

        // Fetch pesticides
        const pesticidesResult = await query(
            'SELECT * FROM pesticides WHERE crop_id = $1 ORDER BY date DESC',
            [id]
        );

        // Fetch sprays
        const spraysResult = await query(
            'SELECT * FROM sprays WHERE crop_id = $1 ORDER BY date DESC, time DESC',
            [id]
        );

        res.json({
            crop: {
                ...crop,
                schedule: schedulesResult.rows,
                fertilizers: fertilizersResult.rows,
                pesticides: pesticidesResult.rows,
                sprays: spraysResult.rows,
            },
        });
    } catch (error) {
        console.error('Error fetching crop:', error);
        res.status(500).json({ error: 'Failed to fetch crop details' });
    }
};

// Create new crop
export const createCrop = async (req, res) => {
    try {
        const {
            name,
            variety,
            field_id,
            area,
            planted_date,
            expected_harvest_date,
            status,
            progress,
            health,
            image,
            notes,
        } = req.body;

        const result = await query(
            `INSERT INTO crops 
       (user_id, name, variety, field_id, area, planted_date, expected_harvest_date, 
        status, progress, health, image, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
            [
                req.user.id,
                name,
                variety,
                field_id || null,
                area,
                planted_date,
                expected_harvest_date,
                status || 'Planted',
                progress || 0,
                health || 'Good',
                image || '🌾',
                notes || null,
            ]
        );

        res.status(201).json({ crop: result.rows[0] });
    } catch (error) {
        console.error('Error creating crop:', error);
        res.status(500).json({ error: 'Failed to create crop' });
    }
};

// Update crop
export const updateCrop = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Build dynamic update query
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.keys(updates).forEach((key) => {
            if (updates[key] !== undefined) {
                fields.push(`${key} = $${paramCount}`);
                values.push(updates[key]);
                paramCount++;
            }
        });

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(req.user.id, id);

        const result = await query(
            `UPDATE crops 
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $${paramCount} AND id = $${paramCount + 1} 
       RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Crop not found' });
        }

        res.json({ crop: result.rows[0] });
    } catch (error) {
        console.error('Error updating crop:', error);
        res.status(500).json({ error: 'Failed to update crop' });
    }
};

// Delete crop
export const deleteCrop = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            'DELETE FROM crops WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Crop not found' });
        }

        res.json({ message: 'Crop deleted successfully' });
    } catch (error) {
        console.error('Error deleting crop:', error);
        res.status(500).json({ error: 'Failed to delete crop' });
    }
};

// ========== SCHEDULE OPERATIONS ==========

// Add schedule to crop
export const addSchedule = async (req, res) => {
    try {
        const { crop_id } = req.params;
        const { date, task } = req.body;

        // Verify crop ownership
        const cropCheck = await query(
            'SELECT id FROM crops WHERE id = $1 AND user_id = $2',
            [crop_id, req.user.id]
        );

        if (cropCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Crop not found' });
        }

        const result = await query(
            'INSERT INTO schedules (crop_id, date, task) VALUES ($1, $2, $3) RETURNING *',
            [crop_id, date, task]
        );

        res.status(201).json({ schedule: result.rows[0] });
    } catch (error) {
        console.error('Error adding schedule:', error);
        res.status(500).json({ error: 'Failed to add schedule' });
    }
};

// Update schedule (toggle done status)
export const updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { done } = req.body;

        const result = await query(
            `UPDATE schedules SET done = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
            [done, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        res.json({ schedule: result.rows[0] });
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ error: 'Failed to update schedule' });
    }
};

// Delete schedule
export const deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            'DELETE FROM schedules WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        res.status(500).json({ error: 'Failed to delete schedule' });
    }
};

// ========== FERTILIZER OPERATIONS ==========

export const addFertilizer = async (req, res) => {
    try {
        const { crop_id } = req.params;
        const { date, type, quantity, notes } = req.body;

        const result = await query(
            'INSERT INTO fertilizers (crop_id, date, type, quantity, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [crop_id, date, type, quantity, notes || null]
        );

        res.status(201).json({ fertilizer: result.rows[0] });
    } catch (error) {
        console.error('Error adding fertilizer:', error);
        res.status(500).json({ error: 'Failed to add fertilizer' });
    }
};

export const deleteFertilizer = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('DELETE FROM fertilizers WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Fertilizer not found' });
        }

        res.json({ message: 'Fertilizer deleted successfully' });
    } catch (error) {
        console.error('Error deleting fertilizer:', error);
        res.status(500).json({ error: 'Failed to delete fertilizer' });
    }
};

// ========== PESTICIDE OPERATIONS ==========

export const addPesticide = async (req, res) => {
    try {
        const { crop_id } = req.params;
        const { date, type, quantity, notes } = req.body;

        const result = await query(
            'INSERT INTO pesticides (crop_id, date, type, quantity, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [crop_id, date, type, quantity, notes || null]
        );

        res.status(201).json({ pesticide: result.rows[0] });
    } catch (error) {
        console.error('Error adding pesticide:', error);
        res.status(500).json({ error: 'Failed to add pesticide' });
    }
};

export const deletePesticide = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('DELETE FROM pesticides WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pesticide not found' });
        }

        res.json({ message: 'Pesticide deleted successfully' });
    } catch (error) {
        console.error('Error deleting pesticide:', error);
        res.status(500).json({ error: 'Failed to delete pesticide' });
    }
};

// ========== SPRAY OPERATIONS ==========

export const addSpray = async (req, res) => {
    try {
        const { crop_id } = req.params;
        const { date, time, name, quantity, notes } = req.body;

        const result = await query(
            'INSERT INTO sprays (crop_id, date, time, name, quantity, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [crop_id, date, time || null, name, quantity, notes || null]
        );

        res.status(201).json({ spray: result.rows[0] });
    } catch (error) {
        console.error('Error adding spray:', error);
        res.status(500).json({ error: 'Failed to add spray' });
    }
};

export const deleteSpray = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('DELETE FROM sprays WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Spray not found' });
        }

        res.json({ message: 'Spray deleted successfully' });
    } catch (error) {
        console.error('Error deleting spray:', error);
        res.status(500).json({ error: 'Failed to delete spray' });
    }
};
