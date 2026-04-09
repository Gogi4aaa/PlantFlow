import { getDatabase } from '../database/db.js';

/**
 * SensorReading Model - Handles all sensor reading database operations
 */
class SensorReading {
  /**
   * Create a new sensor reading
   */
  static async create(readingData) {
    const prisma = getDatabase();
    const { device_id, temperature, air_humidity, soil_moisture, light, timestamp } = readingData;

    // Create reading
    const reading = await prisma.sensorReading.create({
      data: {
        deviceId: device_id,
        temperature,
        airHumidity: air_humidity,
        soilMoisture: soil_moisture,
        light,
        timestamp: timestamp ? new Date(timestamp) : undefined
      }
    });

    return this._toSnakeCase(reading);
  }

  /**
   * Find reading by ID
   */
  static async findById(id) {
    const prisma = getDatabase();
    const reading = await prisma.sensorReading.findUnique({
      where: { id: parseInt(id) }
    });

    return reading ? this._toSnakeCase(reading) : null;
  }

  /**
   * Find latest reading for a device
   */
  static async findLatest(deviceId) {
    const prisma = getDatabase();
    const reading = await prisma.sensorReading.findFirst({
      where: { deviceId },
      orderBy: { timestamp: 'desc' }
    });

    return reading ? this._toSnakeCase(reading) : null;
  }

  /**
   * Find readings for a device with pagination
   */
  static async findByDevice(deviceId, options = {}) {
    const prisma = getDatabase();
    const { limit = 100, offset = 0 } = options;

    const readings = await prisma.sensorReading.findMany({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    return readings.map(r => this._toSnakeCase(r));
  }

  /**
   * Find readings within a time range
   */
  static async findByTimeRange(deviceId, startTime, endTime) {
    const prisma = getDatabase();
    const readings = await prisma.sensorReading.findMany({
      where: {
        deviceId,
        timestamp: {
          gte: new Date(startTime),
          lte: new Date(endTime)
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    return readings.map(r => this._toSnakeCase(r));
  }

  /**
   * Get statistics for a device
   */
  static async getStats(deviceId, hours = 24) {
    const prisma = getDatabase();
    const dateFrom = new Date(Date.now() - hours * 60 * 60 * 1000);

    const aggregations = await prisma.sensorReading.aggregate({
      _count: { _all: true },
      _avg: {
        temperature: true,
        airHumidity: true,
        soilMoisture: true,
        light: true
      },
      _min: {
        temperature: true,
        airHumidity: true,
        soilMoisture: true,
        light: true
      },
      _max: {
        temperature: true,
        airHumidity: true,
        soilMoisture: true,
        light: true
      },
      where: {
        deviceId,
        timestamp: { gte: dateFrom }
      }
    });

    if (aggregations._count._all === 0) return null;

    return {
      count: aggregations._count._all,
      avg_temperature: aggregations._avg.temperature,
      min_temperature: aggregations._min.temperature,
      max_temperature: aggregations._max.temperature,
      avg_air_humidity: aggregations._avg.airHumidity,
      min_air_humidity: aggregations._min.airHumidity,
      max_air_humidity: aggregations._max.airHumidity,
      avg_soil_moisture: aggregations._avg.soilMoisture,
      min_soil_moisture: aggregations._min.soilMoisture,
      max_soil_moisture: aggregations._max.soilMoisture,
      avg_light: aggregations._avg.light,
      min_light: aggregations._min.light,
      max_light: aggregations._max.light
    };
  }

  /**
   * Get chart data aggregated by time intervals
   */
  static async getChartData(deviceId, hours = 24, intervalMinutes = 60) {
    const prisma = getDatabase();

    // For complex time grouping, raw SQL is often best in MySQL
    // We strictly use parameterized queries to prevent injection
    const hoursNum = parseInt(hours);
    const intervalNum = parseInt(intervalMinutes);

    try {
      // Calculate date threshold in Node
      const dateThreshold = new Date(Date.now() - hoursNum * 60 * 60 * 1000);

      // Raw query for time bucket grouping in PostgreSQL
      const result = await prisma.$queryRaw`
          SELECT
            to_timestamp(floor(extract(epoch from timestamp) / (${intervalNum} * 60)) * (${intervalNum} * 60)) as time_bucket,
            AVG(temperature) as temperature,
            AVG(air_humidity) as air_humidity,
            AVG(soil_moisture) as soil_moisture,
            AVG(light) as light,
            COUNT(*) as reading_count
          FROM sensor_readings
          WHERE device_id = ${deviceId}
            AND timestamp >= ${dateThreshold}
          GROUP BY time_bucket
          ORDER BY time_bucket ASC
        `;

      // Convert BigInts if any (reading_count might be BigInt in some drivers)
      // And format
      return result.map(row => ({
        time_bucket: row.time_bucket, // Date object or string
        temperature: row.temperature,
        air_humidity: row.air_humidity,
        soil_moisture: row.soil_moisture,
        light: row.light,
        reading_count: Number(row.reading_count)
      }));

    } catch (error) {
      console.error("Chart data error:", error);
      return [];
    }
  }

  /**
   * Delete old readings (cleanup)
   */
  static async deleteOlderThan(days = 30) {
    const prisma = getDatabase();
    const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await prisma.sensorReading.deleteMany({
      where: {
        timestamp: { lt: dateThreshold }
      }
    });

    return { deleted: result.count };
  }

  /**
   * Get total count of readings for a device
   */
  static async count(deviceId) {
    const prisma = getDatabase();
    return await prisma.sensorReading.count({
      where: { deviceId }
    });
  }

  /**
   * Convert Prisma camelCase to snake_case
   */
  static _toSnakeCase(reading) {
    if (!reading) return null;
    return {
      id: reading.id,
      device_id: reading.deviceId,
      temperature: reading.temperature,
      air_humidity: reading.airHumidity,
      soil_moisture: reading.soilMoisture,
      light: reading.light,
      timestamp: reading.timestamp
    };
  }
}

export default SensorReading;
