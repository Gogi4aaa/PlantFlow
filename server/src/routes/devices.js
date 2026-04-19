import express from 'express';
import Device from '../models/Device.js';
import { validate, schemas } from '../middleware/validation.js';
import { publish } from '../mqtt/client.js';

import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

/**
 * GET /api/devices
 * Get all devices
 */
router.get('/', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const devices = await Device.findAll(userId);
        res.json({
            success: true,
            data: devices,
            count: devices.length
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/devices/:id
 * Get device by ID
 */
router.get('/:id', async (req, res, next) => {
    try {
        const device = await Device.findById(req.params.id);

        // Check ownership
        if (device && device.user_id !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        if (!device) {
            return res.status(404).json({
                success: false,
                error: `Device with ID '${req.params.id}' not found`
            });
        }

        res.json({
            success: true,
            data: device
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/devices
 * Create a new device
 */
router.post('/', validate(schemas.createDevice, 'body'), async (req, res, next) => {
    try {
        const { id: deviceId } = req.body;
        const userId = req.user.id;

        // Check if device exists
        const existingDevice = await Device.findById(deviceId);

        if (existingDevice) {
            // Check if already claimed
            if (existingDevice.user_id) {
                // If claimed by same user, return it
                if (existingDevice.user_id === userId) {
                    return res.json({
                        success: true,
                        data: existingDevice,
                        message: 'Device already registered to you'
                    });
                }

                // If claimed by another user
                return res.status(409).json({
                    success: false,
                    error: 'Device is already claimed by another user'
                });
            } else {
                // Device exists but is UNCLAIMED -> Claim it!
                const updatedDevice = await Device.assignToUser(deviceId, userId);

                // If request body has updates (name, etc.), apply them
                // This is optional but good UX if user gave a name in the form
                const updates = {};
                if (req.body.plant_name) updates.plant_name = req.body.plant_name;
                if (req.body.plant_species) updates.plant_species = req.body.plant_species;

                if (Object.keys(updates).length > 0) {
                    await Device.update(deviceId, updates);
                }

                return res.json({
                    success: true,
                    data: updatedDevice,
                    message: 'Device claimed successfully'
                });
            }
        }

        // Create new device if not exists
        const deviceData = { ...req.body, user_id: userId };
        const device = await Device.create(deviceData);
        res.status(201).json({
            success: true,
            data: device,
            message: 'Device created successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/devices/claim
 * Claim a device by ID
 */
router.post('/claim', async (req, res, next) => {
    try {
        const { deviceId } = req.body;
        const userId = req.user.id;

        if (!deviceId) {
            return res.status(400).json({
                success: false,
                error: 'Device ID is required'
            });
        }

        // Check if device exists
        const device = await Device.findById(deviceId);
        if (!device) {
            return res.status(404).json({
                success: false,
                error: `Device '${deviceId}' not found`
            });
        }

        // Check if already claimed
        if (device.user_id) {
            return res.status(400).json({
                success: false,
                error: 'Device is already claimed by another user'
            });
        }

        // Assign to user
        const updatedDevice = await Device.assignToUser(deviceId, userId);

        res.json({
            success: true,
            data: updatedDevice,
            message: 'Device claimed successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/devices/:id
 * Update device
 */
router.put('/:id', validate(schemas.updateDevice, 'body'), async (req, res, next) => {
    try {
        const device = await Device.update(req.params.id, req.body);
        res.json({
            success: true,
            data: device,
            message: 'Device updated successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/devices/:id
 * Delete device
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const result = await Device.delete(req.params.id);
        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
});




/**
 * POST /api/devices/:id/pump
 * Control water pump
 */
router.post('/:id/pump', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { state } = req.body; // 'ON' or 'OFF'

        if (!['ON', 'OFF'].includes(state)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid state. Must be ON or OFF'
            });
        }

        const device = await Device.findById(id);
        if (!device) {
            return res.status(404).json({
                success: false,
                error: `Device with ID '${id}' not found`
            });
        }
        const topic = `plant/${id}/command/pump`;
        await publish(topic, state);
        await Device.updatePumpStatus(id, state);

        res.json({
            success: true,
            message: `Pump turned ${state}`,
            data: { state }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
