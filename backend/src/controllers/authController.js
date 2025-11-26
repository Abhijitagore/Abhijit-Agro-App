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
            result = await query(
                `INSERT INTO users (google_id, email, name, picture) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
                [googleUser.googleId, googleUser.email, googleUser.name, googleUser.picture]
            );
            user = result.rows[0];
            console.log('✅ New user created:', user.email);
        } else {
            user = result.rows[0];
            // Update user info (in case name or picture changed)
            await query(
                'UPDATE users SET name = $1, picture = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
                [googleUser.name, googleUser.picture, user.id]
            );
            console.log('✅ User logged in:', user.email);
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
