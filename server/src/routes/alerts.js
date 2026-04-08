import express from 'express';
import Alert from '../models/Alert.js';

const router = express.Router();

/**
 * GET /api/alerts/:deviceId
 * Get alerts for a device
 */
router.get('/:deviceId', async (req, res, next) => {
    try {
        const { deviceId } = req.params;
        const { limit } = req.query;

        const alerts = await Alert.findByDevice(deviceId, limit);
        res.json({
            success: true,
            data: alerts
        });
    } catch (error) {
        next(error);
    }
});

export default router;
