import { getDatabase } from '../database/db.js';

/**
 * Alert Model - Handles all alert-related database operations
 */
class Alert {
    /**
     * Create a new alert
     */
    static async create(alertData) {
        const prisma = getDatabase();
        const { device_id, type, message, code } = alertData;

        // Create alert
        const alert = await prisma.alert.create({
            data: {
                deviceId: device_id,
                type,
                message,
                code: code || 'GENERAL',
                isActive: true
            }
        });

        return this._toSnakeCase(alert);
    }

    /**
     * Find latest alerts for a device
     */
    static async findByDevice(deviceId, limit = 10) {
        const prisma = getDatabase();

        const alerts = await prisma.alert.findMany({
            where: {
                deviceId,
                isActive: true // Default to active only
            },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit)
        });

        return alerts.map(a => this._toSnakeCase(a));
    }

    /**
     * Find active alert by code
     */
    static async findActive(deviceId, code) {
        const prisma = getDatabase();
        const alert = await prisma.alert.findFirst({
            where: {
                deviceId,
                code,
                isActive: true
            }
        });
        return this._toSnakeCase(alert);
    }

    /**
     * Resolve an alert
     */
    static async resolve(id) {
        const prisma = getDatabase();
        try {
            const alert = await prisma.alert.update({
                where: { id },
                data: { isActive: false }
            });
            return this._toSnakeCase(alert);
        } catch (error) {
            console.error(`Failed to resolve alert ${id}:`, error);
            return null;
        }
    }

    /**
     * Convert Prisma camelCase to snake_case
     */
    static _toSnakeCase(alert) {
        if (!alert) return null;
        return {
            id: alert.id,
            device_id: alert.deviceId,
            type: alert.type,
            message: alert.message,
            created_at: alert.createdAt
        };
    }
}

export default Alert;
