import { getDatabase } from '../database/db.js';

/**
 * Device Model - Handles all device-related database operations
 */
class Device {
    /**
     * Create a new device
     */
    static async create(deviceData) {
        const prisma = getDatabase();
        const { id, plant_name, plant_species, location, plant_image } = deviceData;

        try {
            const device = await prisma.device.create({
                data: {
                    id,
                    plantName: plant_name,
                    plantSpecies: plant_species || null,
                    location: location || null,
                    plantImage: plant_image || null,
                    userId: deviceData.user_id || null
                }
            });
            return this._toSnakeCase(device);
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error(`Device with ID '${id}' already exists`);
            }
            throw error;
        }
    }

    /**
   * Find device by ID
   */
    static async findById(id) {
        const prisma = getDatabase();
        const device = await prisma.device.findUnique({
            where: { id },
            include: {
                sensorReadings: {
                    take: 1,
                    orderBy: { timestamp: 'desc' }
                }
            }
        });

        return device ? this._toSnakeCase(device) : null;
    }

    /**
   * Find all devices with latest reading
   */
    static async findAll(userId = null) {
        const prisma = getDatabase();

        const where = {};
        if (userId) {
            where.userId = userId;
        }

        const devices = await prisma.device.findMany({
            where,
            include: {
                sensorReadings: {
                    take: 1,
                    orderBy: { timestamp: 'desc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return devices.map(d => this._toSnakeCase(d));
    }

    /**
     * Update device information
     */
    static async update(id, updateData) {
        const prisma = getDatabase();
        const { plant_name, plant_species, location, plant_image } = updateData;

        // Check if exists first
        if (!await this.exists(id)) {
            throw new Error(`Device with ID '${id}' not found`);
        }

        const data = {};
        if (plant_name !== undefined) data.plantName = plant_name;
        if (plant_species !== undefined) data.plantSpecies = plant_species;
        if (location !== undefined) data.location = location;
        if (plant_image !== undefined) data.plantImage = plant_image;

        const device = await prisma.device.update({
            where: { id },
            data
        });

        return this._toSnakeCase(device);
    }

    /**
     * Delete a device
     */
    static async delete(id) {
        const prisma = getDatabase();

        try {
            await prisma.device.delete({
                where: { id }
            });
            return { success: true, message: 'Device deleted successfully' };
        } catch (error) {
            if (error.code === 'P2025') {
                throw new Error(`Device with ID '${id}' not found`);
            }
            throw error;
        }
    }

    /**
     * Check if device exists
     */
    static async exists(id) {
        const prisma = getDatabase();
        const count = await prisma.device.count({
            where: { id }
        });
        return count > 0;
    }

    /**
     * Update device last seen timestamp
     */
    static async updateLastSeen(id) {
        const prisma = getDatabase();

        try {
            await prisma.device.update({
                where: { id },
                data: { lastSeenAt: new Date() }
            });
            return true;
        } catch (error) {
            console.error(`Failed to update last seen for device ${id}:`, error);
            return false;
        }
    }

    /**
     * Update device pump status
     */
    static async updatePumpStatus(id, status) {
        const prisma = getDatabase();

        try {
            await prisma.device.update({
                where: { id },
                data: { pumpStatus: status }
            });
            return true;
        } catch (error) {
            console.error(`Failed to update pump status for device ${id}:`, error);
            return false;
        }
    }

    /**

    /**
     * Assign device to a user
     */
    static async assignToUser(deviceId, userId) {
        const prisma = getDatabase();

        try {
            const device = await prisma.device.update({
                where: { id: deviceId },
                data: { userId }
            });
            return this._toSnakeCase(device);
        } catch (error) {
            if (error.code === 'P2025') {
                throw new Error(`Device with ID '${deviceId}' not found`);
            }
            throw error;
        }
    }

    /**
     * Convert Prisma camelCase to snake_case
     */
    static _toSnakeCase(device) {
        if (!device) return null;

        const obj = {
            id: device.id,
            plant_name: device.plantName,
            location: device.location,
            plant_image: device.plantImage,
            last_seen_at: device.lastSeenAt,
            pump_status: device.pumpStatus,
            user_id: device.userId,
            created_at: device.createdAt,
            updated_at: device.updatedAt
        };

        // Map latest reading if available
        if (device.sensorReadings && device.sensorReadings.length > 0) {
            const reading = device.sensorReadings[0];
            obj.current_reading = {
                temperature: reading.temperature,
                air_humidity: reading.airHumidity,
                soil_moisture: reading.soilMoisture,
                light: reading.light,
                timestamp: reading.timestamp
            };
        } else {
            obj.current_reading = null;
        }

        return obj;
    }
}

export default Device;
