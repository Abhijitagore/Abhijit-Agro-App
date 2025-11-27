import { query } from '../config/database.js';
import { verifyGoogleToken, generateToken } from '../middleware/auth.js';

// Google OAuth Login
export const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ error: 'Google credential required' });
        }

        // Verify Google token
        const googleUser = await verifyGoogleToken(credential);

        // Check if user exists
        let result = await query(
            'SELECT * FROM users WHERE google_id = $1',
            [googleUser.googleId]
        );

        let user;
        if (result.rows.length === 0) {
            // Create new user
            const isAdmin = googleUser.email === 'abhijitagore2000@gmail.com';
            result = await query(
                `INSERT INTO users (google_id, email, name, picture, is_admin) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
                [googleUser.googleId, googleUser.email, googleUser.name, googleUser.picture, isAdmin]
            );
            user = result.rows[0];
            console.log('✅ New user created:', user.email, isAdmin ? '(ADMIN)' : '');
        } else {
            user = result.rows[0];
            // Update user info (in case name or picture changed)
            // Also ensure admin status is set if email matches
            const isAdmin = user.email === 'abhijitagore2000@gmail.com';
            await query(
                'UPDATE users SET name = $1, picture = $2, is_admin = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
                [googleUser.name, googleUser.picture, isAdmin, user.id]
            );
            user.is_admin = isAdmin;
            console.log('✅ User logged in:', user.email, isAdmin ? '(ADMIN)' : '');
        }

        // Generate JWT token
        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture,
                is_admin: user.is_admin || false,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Authentication failed', details: error.message });
    }
};

// Get current user profile
export const getProfile = async (req, res) => {
    try {
        const result = await query(
            'SELECT id, email, name, picture, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};
