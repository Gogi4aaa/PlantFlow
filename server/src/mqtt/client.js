import mqtt from 'mqtt';
import { handleSensorData, handleDeviceStatus } from './handlers.js';

let client = null;

/**
 * Initialize MQTT client and connect to broker
 */
export function initMqttClient(config) {
    const { brokerUrl, username, password, topicPrefix, io } = config;

    const options = {
        clientId: `plantflow-server-${Math.random().toString(16).slice(2, 8)}`,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 30000,
        keepalive: 60,
        resubscribe: true,
        rejectUnauthorized: false,  // Allow self-signed certificates
    };

    if (username) {
        options.username = username;
        options.password = password;
    }

    console.log(`🔌 Connecting to MQTT broker: ${brokerUrl}`);
    client = mqtt.connect(brokerUrl, options);

    client.on('connect', () => {
        console.log('✅ Connected to MQTT broker');

        // Subscribe to all device sensor topics
        // Standard legacy topic: plantflow/devices/+/sensors
        // Readme topic: plant/sensors/data
        // Standard legacy topic: plantflow/devices/+/sensors
        // Readme topic: plant/sensors/data
        // Device status topic: plant/{deviceId}/state
        const topics = [`${topicPrefix}/+/sensors`, 'plant/sensors/data', 'plant/+/state'];

        client.subscribe(topics, (err) => {
            if (err) {
                console.error('❌ Failed to subscribe to topics:', err);
            } else {
                console.log(`📡 Subscribed to topics: ${topics.join(', ')}`);
            }
        });
    });

    client.on('error', (error) => {
        console.error('❌ MQTT connection error:', error);
    });

    client.on('reconnect', () => {
        console.log('🔄 Reconnecting to MQTT broker...');
    });

    client.on('close', () => {
        console.log('🔌 MQTT connection closed');
    });

    client.on('message', (topic, message) => {
        try {
            if (topic.endsWith('/state')) {
                handleDeviceStatus(topic, message, io);
            } else {
                handleSensorData(topic, message, topicPrefix, io);
            }
        } catch (error) {
            console.error('❌ Error handling MQTT message:', error);
        }
    });

    return client;
}

/**
 * Get the MQTT client instance
 */
export function getMqttClient() {
    if (!client) {
        throw new Error('MQTT client not initialized. Call initMqttClient() first.');
    }
    return client;
}

/**
 * Publish a message to a topic
 */
export function publish(topic, message, options = {}) {
    if (!client || !client.connected) {
        throw new Error('MQTT client not connected');
    }

    const payload = typeof message === 'string' ? message : JSON.stringify(message);

    return new Promise((resolve, reject) => {
        client.publish(topic, payload, options, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Close MQTT connection
 */
export function closeMqttClient() {
    if (client) {
        client.end();
        client = null;
        console.log('MQTT client closed');
    }
}

export default {
    initMqttClient,
    getMqttClient,
    publish,
    closeMqttClient
};
