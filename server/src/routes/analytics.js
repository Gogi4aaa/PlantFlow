import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import SensorReading from '../models/SensorReading.js';
import Device from '../models/Device.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

/**
 * GET /api/analytics
 * Get aggregated analytics data across all user's devices
 * Query params:
 * - period: 'day' | 'week' | 'month' (default: 'week')
 * - deviceId: optional - filter to specific device
 */
router.get('/', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { period = 'week', deviceId } = req.query;

        // Get user's devices
        let devices = await Device.findAll(userId);

        if (deviceId) {
            // Filter to specific device if provided
            devices = devices.filter(d => d.id === deviceId);
            if (devices.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Device not found or access denied'
                });
            }
        }

        if (devices.length === 0) {
            return res.json({
                success: true,
                data: {
                    stats: null,
                    chartData: [],
                    devices: []
                }
            });
        }

        // Calculate time range based on period
        const now = new Date();
        let hours;
        let interval; // in minutes

        switch (period) {
            case 'day':
                hours = 24;
                interval = 60; // 1 hour intervals
                break;
            case 'week':
                hours = 24 * 7; // 7 days
                interval = 240; // 4 hour intervals
                break;
            case 'month':
                hours = 24 * 30; // 30 days
                interval = 1440; // 1 day intervals
                break;
            case 'year':
                hours = 24 * 365;
                interval = 10080; // 7 day intervals
                break;
            default:
                hours = 24 * 7;
                interval = 240;
        }

        const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);

        // Aggregate stats across all devices
        const allStats = await Promise.all(
            devices.map(device => SensorReading.getStats(device.id, hours))
        );

        // Calculate overall stats
        const validStats = allStats.filter(s => s);
        const overallStats = validStats.length > 0 ? {
            avgTemperature: validStats.reduce((sum, s) => sum + (s.avg_temperature || 0), 0) / validStats.length,
            avgHumidity: validStats.reduce((sum, s) => sum + (s.avg_air_humidity || 0), 0) / validStats.length,
            avgMoisture: validStats.reduce((sum, s) => sum + (s.avg_soil_moisture || 0), 0) / validStats.length,
            avgLight: validStats.reduce((sum, s) => sum + (s.avg_light || 0), 0) / validStats.length,
            minTemperature: Math.min(...validStats.map(s => s.min_temperature || Infinity)),
            maxTemperature: Math.max(...validStats.map(s => s.max_temperature || -Infinity)),
            minHumidity: Math.min(...validStats.map(s => s.min_air_humidity || Infinity)),
            maxHumidity: Math.max(...validStats.map(s => s.max_air_humidity || -Infinity)),
            minMoisture: Math.min(...validStats.map(s => s.min_soil_moisture || Infinity)),
            maxMoisture: Math.max(...validStats.map(s => s.max_soil_moisture || -Infinity)),
            minLight: Math.min(...validStats.map(s => s.min_light || Infinity)),
            maxLight: Math.max(...validStats.map(s => s.max_light || -Infinity)),
        } : null;

        // Get chart data for all devices
        const allChartData = await Promise.all(
            devices.map(device => SensorReading.getChartData(device.id, hours, interval))
        );

        // Merge chart data by timestamp
        const chartDataMap = new Map();

        allChartData.forEach((deviceData, deviceIndex) => {
            const device = devices[deviceIndex];
            deviceData.forEach(point => {
                // SensorReading.getChartData returns time_bucket, temperature, etc.
                const key = point.time_bucket ? new Date(point.time_bucket).toISOString() : null;

                if (!key) return;

                if (!chartDataMap.has(key)) {
                    chartDataMap.set(key, {
                        timestamp: key,
                        temperature: [],
                        humidity: [],
                        moisture: [],
                        light: []
                    });
                }

                const entry = chartDataMap.get(key);
                // The model returns averages as 'temperature', 'air_humidity', etc.
                if (point.temperature != null) entry.temperature.push(Number(point.temperature));
                if (point.air_humidity != null) entry.humidity.push(Number(point.air_humidity));
                if (point.soil_moisture != null) entry.moisture.push(Number(point.soil_moisture));
                if (point.light != null) entry.light.push(Number(point.light));
            });
        });

        // Average the values for each timestamp
        const chartData = Array.from(chartDataMap.values())
            .map(entry => ({
                timestamp: entry.timestamp,
                temperature: entry.temperature.length > 0
                    ? entry.temperature.reduce((a, b) => a + b, 0) / entry.temperature.length
                    : null,
                humidity: entry.humidity.length > 0
                    ? entry.humidity.reduce((a, b) => a + b, 0) / entry.humidity.length
                    : null,
                moisture: entry.moisture.length > 0
                    ? entry.moisture.reduce((a, b) => a + b, 0) / entry.moisture.length
                    : null,
                light: entry.light.length > 0
                    ? entry.light.reduce((a, b) => a + b, 0) / entry.light.length
                    : null,
            }))
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        res.json({
            success: true,
            data: {
                stats: overallStats,
                chartData,
                devices: devices.map(d => ({
                    id: d.id,
                    name: d.plant_name,
                    species: d.plant_species
                })),
                period,
                timeRange: {
                    start: startTime.toISOString(),
                    end: now.toISOString()
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
