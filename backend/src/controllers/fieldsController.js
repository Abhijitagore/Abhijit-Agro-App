import { query } from '../config/database.js';

// Get all fields for the authenticated user
export const getAllFields = async (req, res) => {
    try {
        // Admin sees all fields with user info, normal users only see their own
        const isAdmin = req.user.is_admin || false;
        
        let queryText, queryParams;
        
        if (isAdmin) {
            queryText = `
                SELECT f.*, u.name as user_name, u.email as user_email
                FROM fields f
                LEFT JOIN users u ON f.user_id = u.id
                ORDER BY f.created_at DESC
    `;
            queryParams = [];
        } else {
            queryText = 'SELECT * FROM fields WHERE user_id = $1 ORDER BY created_at DESC';
            queryParams = [req.user.id];
        }
        
        const result = await query(queryText, queryParams);
        res.json({ fields: result.rows });
    } catch (error) {
        console.error('Error fetching fields:', error);
        res.status(500).json({ error: 'Failed to fetch fields' });
    }
};

// Get single field by ID
export const getFieldById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            'SELECT * FROM fields WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Field not found' });
        }

        res.json({ field: result.rows[0] });
    } catch (error) {
        console.error('Error fetching field:', error);
        res.status(500).json({ error: 'Failed to fetch field' });
    }
};

// Create a new field
export const createField = async (req, res) => {
    try {
        const { name, location, area, area_unit, soil_type, notes } = req.body;
        let image = req.body.image; // In case URL is passed directly

        if (req.file) {
            image = `/ uploads / ${ req.file.filename } `;
        }

        const result = await query(
            `INSERT INTO fields
    (user_id, name, location, area, area_unit, soil_type, image, notes)
VALUES($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING * `,
            [
                req.user.id,
                name,
                location,
                area,
                area_unit || 'acres',
                soil_type,
                image || null,
                notes || null
            ]
        );

        res.status(201).json({ field: result.rows[0] });
    } catch (error) {
        console.error('Error creating field:', error);
        res.status(500).json({ error: 'Failed to create field' });
    }
};

// Update a field
export const updateField = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (req.file) {
            updates.image = `/ uploads / ${ req.file.filename } `;
        }

        // Build dynamic update query
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.keys(updates).forEach((key) => {
            if (updates[key] !== undefined) {
                fields.push(`${ key } = $${ paramCount } `);
                values.push(updates[key]);
                paramCount++;
            }
        });

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(req.user.id, id);

        const result = await query(
            `UPDATE fields 
            SET ${ fields.join(', ') }, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = $${ paramCount } AND id = $${ paramCount + 1 }
RETURNING * `,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Field not found' });
        }

        res.json({ field: result.rows[0] });
    } catch (error) {
        console.error('Error updating field:', error);
        res.status(500).json({ error: 'Failed to update field' });
    }
};

// Delete a field
export const deleteField = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if field has associated crops
        const cropsCheck = await query(
            'SELECT id FROM crops WHERE field_id = $1',
            [id]
        );

        if (cropsCheck.rows.length > 0) {
            return res.status(400).json({
                error: 'Cannot delete field because it has associated crops. Please delete or reassign the crops first.'
            });
        }

        const result = await query(
            'DELETE FROM fields WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Field not found' });
        }

        res.json({ message: 'Field deleted successfully' });
    } catch (error) {
        console.error('Error deleting field:', error);
        res.status(500).json({ error: 'Failed to delete field' });
    }
};
