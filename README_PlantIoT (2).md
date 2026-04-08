# PlantIoT – Smart Plant Monitoring & Control System

## 1. Project Overview
PlantIoT is an IoT-based system for monitoring and automated management of plant health. Each plant is associated with a single physical device (station) built around an ESP32 microcontroller.  
A device combines multiple sensors (soil moisture, air temperature & humidity, light intensity) and an actuator (water pump via relay).  
The system collects real-time data, visualizes it in a web dashboard, stores historical measurements, and supports both automatic and manual irrigation control.

---

## 2. Core Concepts
- **Device (Station):** One ESP32 + all sensors + one pump. One device controls exactly one plant.
- **Plant:** Logical entity in the system, represented by a Device.
- **Real-time:** Data is streamed via MQTT and pushed to the frontend using Socket.IO.
- **Automation:** Pump is controlled automatically based on soil moisture thresholds, with manual override support.

---

## 3. System Architecture

### Hardware Layer
- ESP32 Dev Board
- Sensors:
  - DHT22 – air temperature & humidity
  - Soil moisture sensor (analog)
  - BH1750 – light intensity (lux)
- Relay module + water pump
- Power via USB or battery (future extension)

### Communication
- **WiFi**
- **MQTT over TLS (HiveMQ Cloud)**
  - Topic (publish): `plant/sensors/data`
  - Topic (subscribe): `plant/commands/pump`

### Backend
- Node.js
- MQTT client (subscriber)
- Socket.IO server
- Prisma ORM
- MySQL database

### Frontend
- React + TypeScript
- Real-time updates via Socket.IO
- Dashboard, analytics, alerts

---

## 4. Data Flow (End-to-End)

1. ESP32 reads sensor values every 30 seconds
2. ESP32 publishes JSON payload via MQTT
3. Backend MQTT consumer:
   - parses payload
   - updates device lastSeenAt
   - stores sensor readings
   - evaluates alerts
   - emits real-time updates via Socket.IO
4. Frontend dashboard updates instantly
5. User can manually control pump → backend → MQTT command → ESP32

---

## 5. MQTT Payload Format

### Sensor Data (ESP32 → Backend)
```json
{
  "deviceId": "plant-esp32-01",
  "temperature": 24.5,
  "humidity": 55.2,
  "soilMoisture": 42,
  "light": 320.5,
  "pump": "ON"
}
```

### Pump Command (Backend → ESP32)
- Topic: `plant/commands/pump`
- Payload: `ON` or `OFF`

---

## 6. Database Schema (Prisma)

### Device
Represents one plant + one physical station.

- id (String, PK) – must match deviceId from ESP32
- plantName (String)
- plantSpecies (String, optional)
- location (String, optional)
- plantImage (String, optional)
- lastSeenAt (DateTime, nullable)
- createdAt / updatedAt

### SensorReading
Time-series sensor data.

- id (Int, PK)
- deviceId (FK → Device)
- temperature (Float)
- airHumidity (Float)
- soilMoisture (Float)
- light (Float)
- timestamp (DateTime)

### Alert
System-generated warnings.

- id (Int, PK)
- deviceId (FK → Device)
- type (String)
- message (String)
- createdAt (DateTime)

### User
Application users.

- id (UUID)
- email
- password
- role (USER / ADMIN)

---

## 7. Device Online / Offline Logic
- Each MQTT message updates `Device.lastSeenAt`
- Device is ONLINE if lastSeenAt < 2 minutes ago
- Otherwise marked OFFLINE in UI

---

## 8. Real-Time Communication (Socket.IO)

### Events Emitted by Backend
- `sensor-update`
- `device-status`
- `alert`

### Frontend Responsibilities
- Update dashboard cards live
- Display pump state
- Show alerts as toasts / badges

---

## 9. Automation Logic

### On ESP32
- Automatic watering when soil moisture < threshold
- Manual override via MQTT command
- Manual override resets when soil drops again below threshold

### On Backend
- Optional future extension:
  - dynamic thresholds per plant
  - schedules
  - AI-based recommendations

---

## 10. Analytics & Historical Data
All sensor readings are stored in MySQL and can be used to:
- generate charts (daily / weekly / monthly)
- analyze plant health trends
- calculate device uptime
- detect recurring issues

---

## 11. Step-by-Step Implementation Plan

### Phase 1 – Infrastructure
- Setup MySQL + Prisma
- Implement MQTT consumer
- Store sensor readings
- Register devices

### Phase 2 – Real-Time
- Integrate Socket.IO
- Live dashboard updates
- Device online/offline status

### Phase 3 – Alerts & Automation
- Alert generation
- UI notifications
- Pump state visualization

### Phase 4 – Analytics
- Historical charts
- Aggregated statistics
- Device reliability metrics
