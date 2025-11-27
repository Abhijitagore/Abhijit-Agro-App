import { query } from '../config/database.js';

// Get all revenue
export const getAllRevenue = async (req, res) => {
    try {
        // Admin sees all revenue with user info, normal users only see their own
        const isAdmin = req.user.is_admin || false;

        let queryText, queryParams;

        if (isAdmin) {
            queryText = `
                SELECT r.*, c.name as crop_name, u.name as user_name, u.email as user_email
                FROM revenue r 
                LEFT JOIN crops c ON r.crop_id = c.id 
                LEFT JOIN users u ON r.user_id = u.id
                ORDER BY r.date DESC
    `;
            queryParams = [];
        } else {
            queryText = `
                SELECT r.*, c.name as crop_name 
                FROM revenue r 
                LEFT JOIN crops c ON r.crop_id = c.id 
                WHERE r.user_id = $1 
                ORDER BY r.date DESC
            `;
            queryParams = [req.user.id];
        }

        const result = await query(queryText, queryParams);

        res.json({ revenue: result.rows });
    } catch (error) {
        console.error('Error fetching revenue:', error);
        res.status(500).json({ error: 'Failed to fetch revenue' });
    }
};

// Get single revenue
export const getRevenueById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            `SELECT r.*, c.name as crop_name 
       FROM revenue r 
       LEFT JOIN crops c ON r.crop_id = c.id 
       WHERE r.id = $1 AND r.user_id = $2`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Revenue not found' });
        }

        res.json({ revenue: result.rows[0] });
    } catch (error) {
        console.error('Error fetching revenue:', error);
        res.status(500).json({ error: 'Failed to fetch revenue' });
    }
};

// Create revenue
export const createRevenue = async (req, res) => {
    try {
        const { source, product, quantity, amount, date, crop_id, payment_received } = req.body;

        const result = await query(
            `INSERT INTO revenue(user_id, source, product, quantity, amount, date, crop_id, payment_received)
VALUES($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING * `,
            [req.user.id, source, product, quantity, amount, date, crop_id || null, payment_received || false]
        );

        res.status(201).json({ revenue: result.rows[0] });
    } catch (error) {
        console.error('Error creating revenue:', error);
        res.status(500).json({ error: 'Failed to create revenue' });
    }
};

// Update revenue
export const updateRevenue = async (req, res) => {
    try {
        const { id } = req.params;
        const { source, product, quantity, amount, date, crop_id, payment_received } = req.body;

        const result = await query(
            `UPDATE revenue 
       SET source = $1, product = $2, quantity = $3, amount = $4, date = $5,
    crop_id = $6, payment_received = $7, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $8 AND user_id = $9
RETURNING * `,
            [source, product, quantity, amount, date, crop_id || null, payment_received, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Revenue not found' });
        }

        res.json({ revenue: result.rows[0] });
    } catch (error) {
        console.error('Error updating revenue:', error);
        res.status(500).json({ error: 'Failed to update revenue' });
    }
};

// Delete revenue
export const deleteRevenue = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            'DELETE FROM revenue WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Revenue not found' });
        }

        res.json({ message: 'Revenue deleted successfully' });
    } catch (error) {
        console.error('Error deleting revenue:', error);
        res.status(500).json({ error: 'Failed to delete revenue' });
    }
};

// Get revenue statistics
export const getRevenueStats = async (req, res) => {
    try {
        const result = await query(
            `SELECT
COUNT(*) as total_count,
    SUM(amount) as total_amount,
    AVG(amount) as average_amount,
    source,
    COUNT(*) as count_by_source
       FROM revenue 
       WHERE user_id = $1 
       GROUP BY source`,
            [req.user.id]
        );

        const totalResult = await query(
            'SELECT SUM(amount) as total FROM revenue WHERE user_id = $1',
            [req.user.id]
        );

        res.json({
            stats: result.rows,
            total: totalResult.rows[0].total || 0,
        });
    } catch (error) {
        console.error('Error fetching revenue stats:', error);
        res.status(500).json({ error: 'Failed to fetch revenue statistics' });
    }
};
