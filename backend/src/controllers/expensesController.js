import { query } from '../config/database.js';

// Get all expenses
export const getAllExpenses = async (req, res) => {
    try {
        // Admin sees all expenses with user info, normal users only see their own
        const isAdmin = req.user.is_admin || false;

        let queryText, queryParams;

        if (isAdmin) {
            queryText = `
                SELECT e.*, c.name as crop_name, u.name as user_name, u.email as user_email
                FROM expenses e 
                LEFT JOIN crops c ON e.crop_id = c.id 
                LEFT JOIN users u ON e.user_id = u.id
                ORDER BY e.date DESC
    `;
            queryParams = [];
        } else {
            queryText = `
                SELECT e.*, c.name as crop_name 
                FROM expenses e 
                LEFT JOIN crops c ON e.crop_id = c.id 
                WHERE e.user_id = $1 
                ORDER BY e.date DESC
            `;
            queryParams = [req.user.id];
        }

        const result = await query(queryText, queryParams);

        res.json({ expenses: result.rows });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
};

// Get single expense
export const getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            `SELECT e.*, c.name as crop_name 
       FROM expenses e 
       LEFT JOIN crops c ON e.crop_id = c.id 
       WHERE e.id = $1 AND e.user_id = $2`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        res.json({ expense: result.rows[0] });
    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({ error: 'Failed to fetch expense' });
    }
};

// Create expense
export const createExpense = async (req, res) => {
    try {
        const { category, description, amount, date, crop_id, payment_method } = req.body;

        // Resolve crop name to id if a string is provided
        let resolvedCropId = null;
        if (crop_id && typeof crop_id === 'string') {
            const cropResult = await query(
                `SELECT id FROM crops WHERE name = $1 AND user_id = $2`,
                [crop_id, req.user.id]
            );
            if (cropResult.rows.length > 0) {
                resolvedCropId = cropResult.rows[0].id;
            }
            // If lookup fails (cropResult.rows.length === 0), resolvedCropId remains null,
            // which correctly falls back to null for the database insertion.
        } else {
            // If crop_id is already an ID (number) or explicitly null/undefined, use it directly.
            resolvedCropId = crop_id;
        }

        const result = await query(
            `INSERT INTO expenses(user_id, category, description, amount, date, crop_id, payment_method)
VALUES($1, $2, $3, $4, $5, $6, $7)
RETURNING * `,
            [req.user.id, category, description, amount, date, resolvedCropId || null, payment_method || null]
        );

        res.status(201).json({ expense: result.rows[0] });
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
};

// Update expense
export const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, description, amount, date, crop_id, payment_method } = req.body;

        const result = await query(
            `UPDATE expenses 
       SET category = $1, description = $2, amount = $3, date = $4,
    crop_id = $5, payment_method = $6, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $7 AND user_id = $8
RETURNING * `,
            [category, description, amount, date, crop_id || null, payment_method || null, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        res.json({ expense: result.rows[0] });
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Failed to update expense' });
    }
};

// Delete expense
export const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
};

// Get expense statistics
export const getExpenseStats = async (req, res) => {
    try {
        const result = await query(
            `SELECT
COUNT(*) as total_count,
    SUM(amount) as total_amount,
    AVG(amount) as average_amount,
    category,
    COUNT(*) as count_by_category
       FROM expenses 
       WHERE user_id = $1 
       GROUP BY category`,
            [req.user.id]
        );

        const totalResult = await query(
            'SELECT SUM(amount) as total FROM expenses WHERE user_id = $1',
            [req.user.id]
        );

        res.json({
            stats: result.rows,
            total: totalResult.rows[0].total || 0,
        });
    } catch (error) {
        console.error('Error fetching expense stats:', error);
        res.status(500).json({ error: 'Failed to fetch expense statistics' });
    }
};
