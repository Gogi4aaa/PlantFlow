import express from 'express';
import devicesRouter from './devices.js';
import sensorsRouter from './sensors.js';
import authRouter from './auth.js';
import alertsRouter from './alerts.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'PlantFlow API is running',
        timestamp: new Date().toISOString()
    });
});

// Mount route modules
router.use('/devices', devicesRouter);
router.use('/sensors', sensorsRouter);
router.use('/auth', authRouter);
router.use('/alerts', alertsRouter);

export default router;
