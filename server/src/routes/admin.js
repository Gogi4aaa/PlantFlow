import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import Device from '../models/Device.js';
import Alert from '../models/Alert.js';
import { getDatabase } from '../database/db.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyToken, isAdmin);

/**
 * Get system statistics
 * GET /api/admin/stats
 */
router.get('/stats', async (req, res, next) => {
    try {
        const prisma = getDatabase();

        // Get counts
        const [totalUsers, totalDevices, activeAlerts, recentUsers, recentDevices] = await Promise.all([
            User.count(),
            prisma.device.count(),
            prisma.alert.count({ where: { isActive: true } }),
            User.getRecentUsers(7),
            prisma.device.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            })
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalDevices,
                activeAlerts,
                recentActivity: {
                    newUsers: recentUsers,
                    newDevices: recentDevices
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * List all users
 * GET /api/admin/users
 */
router.get('/users', async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = '', role = null } = req.query;

        const result = await User.list({
            page: parseInt(page),
            limit: parseInt(limit),
            search,
            role: role || null
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Update user
 * PUT /api/admin/users/:id
 */
router.put('/users/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { email, full_name, role } = req.body;

        // Prevent admin from demoting themselves
        if (id === req.user.id && role && role !== 'ADMIN') {
            return res.status(400).json({
                success: false,
                error: 'You cannot change your own role'
            });
        }

        const updatedUser = await User.update(id, {
            email,
            full_name,
            role
        });

        res.json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Delete user
 * DELETE /api/admin/users/:id
 */
router.delete('/users/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (id === req.user.id) {
            return res.status(400).json({
                success: false,
                error: 'You cannot delete your own account'
            });
        }

        await User.delete(id);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Change user role
 * PUT /api/admin/users/:id/role
 */
router.put('/users/:id/role', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role || !['USER', 'ADMIN'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role. Must be USER or ADMIN'
            });
        }

        // Prevent admin from changing their own role
        if (id === req.user.id) {
            return res.status(400).json({
                success: false,
                error: 'You cannot change your own role'
            });
        }

        const updatedUser = await User.update(id, { role });

        res.json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
});

/**
 * List all devices across all users
 * GET /api/admin/devices
 */
router.get('/devices', async (req, res, next) => {
    try {
        const prisma = getDatabase();
        const { page = 1, limit = 20, search = '' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = search ? {
            OR: [
                { id: { contains: search } },
                { plantName: { contains: search } },
                { location: { contains: search } }
            ]
        } : {};

        const [devices, total] = await Promise.all([
            prisma.device.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            fullName: true
                        }
                    }
                }
            }),
            prisma.device.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                devices,
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Delete device
 * DELETE /api/admin/devices/:id
 */
router.delete('/devices/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const prisma = getDatabase();

        await prisma.device.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Device deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * List all alerts across all devices
 * GET /api/admin/alerts
 */
router.get('/alerts', async (req, res, next) => {
    try {
        const prisma = getDatabase();
        const { page = 1, limit = 20, isActive = null } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (isActive !== null) {
            where.isActive = isActive === 'true';
        }

        const [alerts, total] = await Promise.all([
            prisma.alert.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    device: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    email: true,
                                    fullName: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.alert.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                alerts,
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Resolve alert
 * PUT /api/admin/alerts/:id/resolve
 */
router.put('/alerts/:id/resolve', async (req, res, next) => {
    try {
        const { id } = req.params;
        const prisma = getDatabase();

        const alert = await prisma.alert.update({
            where: { id: parseInt(id) },
            data: { isActive: false }
        });

        res.json({
            success: true,
            data: alert
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Delete alert
 * DELETE /api/admin/alerts/:id
 */
router.delete('/alerts/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const prisma = getDatabase();

        await prisma.alert.delete({
            where: { id: parseInt(id) }
        });

        res.json({
            success: true,
            message: 'Alert deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

export default router;
