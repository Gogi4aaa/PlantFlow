import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initDatabase, closeDatabase } from './database/db.js';
import { initMqttClient, closeMqttClient } from './mqtt/client.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Socket.IO Setup
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});

// Routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize and start server
async function startServer() {
    // Initialize database
    try {
        await initDatabase(process.env.DATABASE_PATH);
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }

    // Initialize MQTT client
    try {
        initMqttClient({
            brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
            username: process.env.MQTT_USERNAME,
            password: process.env.MQTT_PASSWORD,
            topicPrefix: process.env.MQTT_TOPIC_PREFIX || 'plantflow/devices',
            io: io // Pass Socket.IO instance
        });
    } catch (error) {
        console.error('Failed to initialize MQTT client:', error);
        console.warn('⚠️  Server will continue without MQTT connection');
    }

    // Start server
    const server = httpServer.listen(PORT, () => {
        console.log('');
        console.log('🌱 ================================ 🌱');
        console.log('   PlantFlow API Server Started');
        console.log('🌱 ================================ 🌱');
        console.log('');
        console.log(`📡 Server running on: http://localhost:${PORT}`);
        console.log(`🔌 MQTT Broker: ${process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883'}`);
        console.log(`💾 Database: ${process.env.DATABASE_PATH || './plantflow.db'}`);
        console.log('');
        console.log('Available endpoints:');
        console.log(`  GET    http://localhost:${PORT}/api/health`);
        console.log(`  GET    http://localhost:${PORT}/api/devices`);
        console.log(`  POST   http://localhost:${PORT}/api/devices`);
        console.log(`  GET    http://localhost:${PORT}/api/sensors/:deviceId/latest`);
        console.log(`  GET    http://localhost:${PORT}/api/sensors/:deviceId/readings`);
        console.log(`  GET    http://localhost:${PORT}/api/sensors/:deviceId/chart`);
        console.log('');
    });

    // Graceful shutdown
    const shutdown = async () => {
        console.log('\n🛑 Shutting down gracefully...');

        // Close server
        server.close(() => {
            console.log('✅ HTTP server closed');
        });

        // Close MQTT connection
        closeMqttClient();

        // Close database
        closeDatabase();

        console.log('👋 Goodbye!');
        process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}

// Start the server
startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

export default app;

