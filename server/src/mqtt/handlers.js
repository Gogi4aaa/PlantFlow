import SensorReading from '../models/SensorReading.js';
import Device from '../models/Device.js';
import Alert from '../models/Alert.js';

/**
 * Handle incoming sensor data from MQTT
 */
export async function handleSensorData(topic, message, topicPrefix, io) {
    try {
        // Parse message payload first to check for deviceId in data
        let data;
        try {
            // Fix invalid JSON (e.g. "nan")
            const rawMessage = message.toString();
            const sanitizedMessage = rawMessage.replace(/:\s*nan/gi, ':null');

            data = JSON.parse(sanitizedMessage);
            // console.log('📥 Sensor data received:', data);
        } catch (parseError) {
            console.error('❌ Failed to parse MQTT message:', parseError);
            console.error('   Message:', message.toString());
            return;
        }

        let deviceId = data.deviceId || data.device_id;

        // If not in payload, try to extract from topic
        if (!deviceId) {
            // Topic format: plantflow/devices/{deviceId}/sensors
            const topicParts = topic.split('/');
            const deviceIdIndex = topicParts.indexOf('devices') + 1;

            if (deviceIdIndex > 0 && deviceIdIndex < topicParts.length) {
                deviceId = topicParts[deviceIdIndex];
            }
        }

        if (!deviceId) {
            console.error('❌ Could not determine device ID from topic or payload. Topic:', topic, 'Data:', data);
            return;
        }



        // Validate data structure
        if (!isValidSensorData(data)) {
            console.error('❌ Invalid sensor data format:', data);
            return;
        }

        // Check if device exists, if not log a warning
        if (!await Device.exists(deviceId)) {
            console.warn(`⚠️  Device '${deviceId}' not registered. Creating auto-registered device.`);

            // Auto-register the device
            try {
                await Device.create({
                    id: deviceId,
                    plant_name: `Auto-registered ${deviceId}`,
                    plant_species: 'Unknown',
                    location: 'Unknown'
                });
                console.log(`✅ Auto-registered device: ${deviceId}`);
            } catch (error) {
                console.error('❌ Failed to auto-register device:', error);
                return;
            }
        }

        // Update Device Last Seen
        await Device.updateLastSeen(deviceId);

        // Store sensor reading
        const reading = {
            device_id: deviceId,
            temperature: data.temperature,
            air_humidity: data.air_humidity || data.humidity,
            soil_moisture: data.soil_moisture || data.moisture || data.soilMoisture, // Added soilMoisture support
            light: data.light,
            timestamp: data.timestamp || null
        };

        const savedReading = await SensorReading.create(reading);

        // Check for Alerts
        await checkAndCreateAlerts(deviceId, reading, io);

        // Emit real-time update via Socket.IO
        if (io) {
            io.emit('sensor-update', {
                deviceId,
                reading: savedReading
            });
            io.emit('device-status', {
                deviceId,
                status: 'ONLINE',
                lastSeen: new Date()
            });
        }

        console.log(`📊 Sensor data stored for device '${deviceId}':`, {
            temperature: reading.temperature,
            air_humidity: reading.air_humidity,
            soil_moisture: reading.soil_moisture,
            light: reading.light,
            pump: data.pump
        });

    } catch (error) {
        console.error('❌ Error handling sensor data:', error);
    }
}

/**
 * Check sensor data for alerts and create them if necessary
 */
async function checkAndCreateAlerts(deviceId, reading, io) {
    // Define Alert Rules
    const rules = [
        {
            code: 'LOW_MOISTURE',
            condition: (r) => r.soil_moisture !== undefined && r.soil_moisture < 20,
            type: 'CRITICAL',
            message: (r) => `Low soil moisture detected: ${r.soil_moisture}%`
        },
        {
            code: 'HIGH_TEMP',
            condition: (r) => r.temperature !== undefined && r.temperature > 35,
            type: 'WARNING',
            message: (r) => `High temperature detected: ${r.temperature}°C`
        },
        {
            code: 'LOW_TEMP',
            condition: (r) => r.temperature !== undefined && r.temperature < 5,
            type: 'WARNING',
            message: (r) => `Low temperature detected: ${r.temperature}°C`
        }
    ];

    for (const rule of rules) {
        try {
            // Check if there is an active alert for this rule
            const activeAlert = await Alert.findActive(deviceId, rule.code);
            const conditionMet = rule.condition(reading);

            if (conditionMet) {
                // Condition is BAD
                if (!activeAlert) {
                    // Create NEW alert
                    const message = rule.message(reading);
                    const newAlert = await Alert.create({
                        device_id: deviceId,
                        type: rule.type,
                        message: message,
                        code: rule.code
                    });

                    if (io) {
                        io.emit('alert', {
                            deviceId,
                            alert: newAlert
                        });
                    }
                    console.log(`🚨 Alert created for device ${deviceId}: ${message}`);
                }
                // If activeAlert exists, we do nothing (suppress duplicate)
            } else {
                // Condition is GOOD (or undefined)
                if (activeAlert) {
                    // Resolve EXISTING alert
                    await Alert.resolve(activeAlert.id);

                    if (io) {
                        io.emit('alert-resolved', {
                            deviceId,
                            alertId: activeAlert.id,
                            code: rule.code
                        });
                    }
                    console.log(`✅ Alert resolved for device ${deviceId}: ${rule.code}`);
                }
            }
        } catch (err) {
            console.error('Failed to process alert rule:', err);
        }
    }
}

/**
 * Validate sensor data structure
 */
function isValidSensorData(data) {
    if (typeof data !== 'object' || data === null) {
        return false;
    }

    // At least one sensor value should be present
    const hasTemperature = typeof data.temperature === 'number';
    const hasHumidity = typeof data.air_humidity === 'number' || typeof data.humidity === 'number';
    const hasMoisture = typeof data.soil_moisture === 'number' || typeof data.moisture === 'number';
    const hasLight = typeof data.light === 'number';

    return hasTemperature || hasHumidity || hasMoisture || hasLight;
}

/**
 * Handle device status updates (optional)
 */
/**
 * Handle device status updates
 * Payload: { "deviceId":"...", "pump":"ON", "mode":"MANUAL" }
 */
export async function handleDeviceStatus(_topic, message, io) {
    try {
        const data = JSON.parse(message.toString());
        console.log('📱 Device status update:', data);

        const { deviceId, pump, mode } = data;

        if (deviceId) {
            await Device.updateLastSeen(deviceId);

            const normalizedPump = normalizePumpStatus(pump);
            if (normalizedPump) await Device.updatePumpStatus(deviceId, normalizedPump);

            if (io) {
                io.emit('device-status', {
                    deviceId,
                    status: 'ONLINE',
                    pumpStatus: normalizedPump,
                    mode,
                    lastSeen: new Date()
                });

                if (normalizedPump) {
                    io.emit('pump-update', {
                        deviceId,
                        pumpStatus: normalizedPump,
                        mode
                    });
                }
            }

            console.log(`🔧 Pump state for '${deviceId}': ${normalizedPump} (${mode})`);
        }
    } catch (error) {
        console.error('❌ Error handling device status:', error);
    }
}

export default {
    handleSensorData,
    handleDeviceStatus
};

/**
 * Helper to normalize pump status to "ON" or "OFF"
 */
function normalizePumpStatus(val) {
    if (val === undefined || val === null) return null;

    // Check for ON values
    if (val === true || val === 1 || val === '1' || String(val).toUpperCase() === 'ON') {
        return 'ON';
    }

    // Check for OFF values
    if (val === false || val === 0 || val === '0' || String(val).toUpperCase() === 'OFF') {
        return 'OFF';
    }

    return String(val); // Return as string if it's something else
}
