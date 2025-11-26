import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            console.log('[Auth] No token provided');
            return res.status(401).json({ error: 'Access token required' });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('[Auth] Token verified for user:', decoded.email);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.error('[Auth] Token expired:', error.message);
            return res.status(403).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
        } else if (error.name === 'JsonWebTokenError') {
            console.error('[Auth] Invalid token:', error.message);
            return res.status(403).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
        } else {
            console.error('[Auth] Token verification error:', error);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
    }
};

// Verify Google OAuth token and create/return user
export const verifyGoogleToken = async (credential) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        return {
            googleId: payload['sub'],
            email: payload['email'],
            name: payload['name'],
            picture: payload['picture'],
        };
    } catch (error) {
        console.error('Google token verification error:', error);
        throw new Error('Invalid Google token');
    }
};

// Generate JWT token
export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name,
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Token expires in 7 days
    );
};
