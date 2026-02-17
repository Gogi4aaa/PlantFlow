import functions from '@google-cloud/functions-framework';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './src/database/db.js';
import { initMqttClient } from './src/mqtt/client.js';
import routes from './src/routes/index.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';


dotenv.config();

const app = express();


app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'plantflow-api',
        version: '1.0.0'
    });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

let initialized = false;

async function initialize() {
    if (initialized) return;

    try {
        await initDatabase();
        console.log('Database initialized');

        if (process.env.MQTT_BROKER_URL) {
            try {
                initMqttClient({
                    brokerUrl: process.env.MQTT_BROKER_URL,
                    username: process.env.MQTT_USERNAME,
                    password: process.env.MQTT_PASSWORD,
                    topicPrefix: process.env.MQTT_TOPIC_PREFIX || 'plantflow/devices'
                });
                console.log('MQTT client initialized');
            } catch (mqttError) {
                console.warn('MQTT initialization failed:', mqttError.message);
                console.warn('Continuing without MQTT support');
            }
        } else {
            console.warn('No MQTT broker configured');
        }

        initialized = true;
        console.log('PlantFlow API initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
        console.error('Function will continue but some features may not work');
    }
}

functions.http('plantflow', async (req, res) => {
    try {
        await initialize();
        app(req, res);
    } catch (error) {
        console.error('Function execution error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

export default app;