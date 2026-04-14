import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

/**
 * Validate password strength.
 * Returns an error string, or null if valid.
 */
function validatePassword(password) {
    if (!password || password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character';
    return null;
}

/**
 * Register a new user
 * POST /api/auth/register
 */
router.post('/register', async (req, res, next) => {
    try {
        const { email, password, full_name, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({ success: false, error: passwordError });
        }

        // Check if user exists
        const existingUser = await User.findByEmailWithPassword(email);
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Email already registered' });
        }

        // Create user
        const user = await User.create({ email, password, full_name, role });

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.fullName,
                    role: user.role,
                    avatar_color: '#10B981' // Mock color
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Login user
 * POST /api/auth/login
 */
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findByEmailWithPassword(email);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Verify password
        const isValid = await User.verifyPassword(password, user.password);
        if (!isValid) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.fullName,
                role: user.role,
                avatar_color: '#10B981'
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Get current user
 * GET /api/auth/me
 */
router.get('/me', verifyToken, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Update current user
 * PUT /api/auth/me
 */
router.put('/me', verifyToken, async (req, res, next) => {
    try {
        const { email, password, full_name, profile_picture } = req.body;

        // Basic validation
        if (email === '') {
            return res.status(400).json({ success: false, error: 'Email cannot be empty' });
        }

        if (password) {
            const passwordError = validatePassword(password);
            if (passwordError) {
                return res.status(400).json({ success: false, error: passwordError });
            }
        }

        // Check if email is taken by another user
        if (email) {
            const existingUser = await User.findByEmailWithPassword(email);
            if (existingUser && existingUser.id !== req.user.id) {
                return res.status(400).json({ success: false, error: 'Email already in use' });
            }
        }

        const updatedUser = await User.update(req.user.id, {
            email,
            password,
            full_name,
            profile_picture
        });

        res.json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
});

export default router;
