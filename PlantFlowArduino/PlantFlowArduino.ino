#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <Wire.h>
#include <BH1750.h>
#include <WiFiManager.h>
#include <WiFiClientSecure.h>

/* ================= DEVICE CONFIG ================= */
String deviceId = "plant-esp32-01";

/* ================= MQTT CONFIG ================= */
const char* mqtt_server   = "51a9817f28a14ffeac3a813af62bd55e.s1.eu.hivemq.cloud";
const int   mqtt_port     = 8883;
const char* mqtt_username = "sensor_user";
const char* mqtt_password = "Test_1234";

/* ================= PINS ================= */
#define DHTPIN 4
#define DHTTYPE DHT22
#define SOIL_PIN 36
#define RELAY_PIN 26
#define I2C_SDA 21
#define I2C_SCL 22

/* ================= SOIL CALIBRATION ================= */
#define SOIL_DRY 3000
#define SOIL_WET 1400

/* ================= AUTOMATION ================= */
int soilThreshold     = 40;  // % → start watering
int soilStopThreshold = 70;  // % → stop watering

// Интервал за телеметрия:
// - когато помпата работи → 1 сек (следим в реално време)
// - когато помпата е спряна → 30 сек (нормален режим)
const unsigned long TELEMETRY_PUMP_ON_MS  = 1000UL;   // 1 секунда
const unsigned long TELEMETRY_PUMP_OFF_MS = 30000UL;  // 30 секунди

// Optional: manual mode timeout (ms). Set to 0 to disable.
const unsigned long manualModeTimeoutMs = 0;

/* ================= OBJECTS ================= */
WiFiClientSecure espClient;
PubSubClient client(espClient);
DHT dht(DHTPIN, DHTTYPE);
BH1750 lightMeter;

/* ================= STATE ================= */
bool pumpState    = false;  // ON / OFF
bool manualMode   = false;  // MANUAL / AUTO
unsigned long lastTelemetry  = 0;
unsigned long manualModeSince = 0;

/* ================= HELPERS ================= */
int readSoil() {
  long sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(SOIL_PIN);
    delay(5);
  }
  return int(sum / 10);
}

// Връща активния интервал за телеметрия спрямо текущото
// състояние на помпата.
unsigned long activeTelemetryInterval() {
  return pumpState ? TELEMETRY_PUMP_ON_MS : TELEMETRY_PUMP_OFF_MS;
}

/* Проверка на стойностите,
   според които контролираме помпата.
   Accepts:
   - "ON"
   - "OFF"
   - '{"action":"ON"}'
   - '{"action":"OFF"}'
*/
String extractAction(const String &payload) {
  String s = payload;
  s.trim();
  if (s.equalsIgnoreCase("ON") || s.indexOf("\"ON\"") >= 0 || (s.indexOf("ON") >= 0 && s.indexOf("OFF") == -1)) return "ON";
  if (s.equalsIgnoreCase("OFF") || s.indexOf("\"OFF\"") >= 0 || (s.indexOf("OFF") >= 0 && s.indexOf("ON") == -1)) return "OFF";
  int idx = s.indexOf("\"action\"");
  if (idx >= 0) {
    int colon = s.indexOf(':', idx);
    if (colon > 0) {
      int quote1 = s.indexOf('"', colon);
      if (quote1 >= 0) {
        int quote2 = s.indexOf('"', quote1 + 1);
        if (quote2 > quote1) {
          String val = s.substring(quote1 + 1, quote2);
          val.trim();
          if (val.equalsIgnoreCase("ON"))  return "ON";
          if (val.equalsIgnoreCase("OFF")) return "OFF";
        }
      }
    }
  }
  return String("");
}

/* ================= MQTT CALLBACK ================= */
void mqttCallback(char* topic, byte* message, unsigned int length) {
  String payload;
  for (unsigned int i = 0; i < length; i++) payload += (char)message[i];
  payload.trim();

  Serial.print("[MQTT] RECEIVED topic=");
  Serial.print(topic);
  Serial.print(" payload=");
  Serial.println(payload);

  String commandTopic = "plant/" + deviceId + "/command/pump";

  if (String(topic) == commandTopic) {
    String action = extractAction(payload);
    if (action == "ON") {
      manualMode  = true;
      pumpState   = true;
      digitalWrite(RELAY_PIN, LOW); // active LOW relay
      manualModeSince = millis();
      // Нулираме таймера на телеметрията → изпращаме веднага
      lastTelemetry = millis() - TELEMETRY_PUMP_ON_MS;
      Serial.println("[CMD] Pump ON (manual) → telemetry @ 1s");
    } else if (action == "OFF") {
      manualMode  = true;
      pumpState   = false;
      digitalWrite(RELAY_PIN, HIGH);
      manualModeSince = millis();
      // Нулираме таймера → следващото изпращане след 30s
      lastTelemetry = millis();
      Serial.println("[CMD] Pump OFF (manual) → telemetry @ 30s");
    } else if (payload.equalsIgnoreCase("AUTO")) {
      manualMode = false;
      Serial.println("[CMD] Switched to AUTO mode");
    } else {
      Serial.println("[CMD] Unknown payload for pump command");
    }
    publishPumpState();
  }
}

/* ================= MQTT CONNECT ================= */
void reconnectMQTT() {
  String clientId = "esp32-" + deviceId;
  while (!client.connected()) {
    Serial.print("[MQTT] Connecting as ");
    Serial.print(clientId);
    Serial.print(" ... ");
    if (client.connect(clientId.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("connected");
      String commandTopic = "plant/" + deviceId + "/command/pump";
      client.subscribe(commandTopic.c_str());
      Serial.print("[MQTT] Subscribed to: ");
      Serial.println(commandTopic);
    } else {
      Serial.print("failed rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 3s");
      delay(3000);
    }
  }
}

/* ================= PUBLISH PUMP STATE ================= */
void publishPumpState() {
  char buf[160];
  snprintf(buf, sizeof(buf),
    "{ \"deviceId\":\"%s\", \"pump\":\"%s\", \"mode\":\"%s\" }",
    deviceId.c_str(),
    pumpState ? "ON" : "OFF",
    manualMode ? "MANUAL" : "AUTO"
  );
  String topic = "plant/" + deviceId + "/state";
  bool ok = client.publish(topic.c_str(), buf);
  Serial.print("[MQTT] Published pump state -> ");
  Serial.print(ok ? "OK" : "FAIL");
  Serial.print(" topic=");
  Serial.println(topic);
}

/* ================= AUTO WATERING ================= */
void handleAutoWatering(int soilPercent) {

  // Ако почвата е критично суха, форсираме AUTO режим
  if (manualMode && soilPercent <= soilThreshold) {
    manualMode = false;
    Serial.println("[AUTO] Soil too dry → forcing AUTO mode");
  }

  if (manualMode && pumpState && soilPercent >= soilStopThreshold) {
    pumpState  = false;
    manualMode = false;
    digitalWrite(RELAY_PIN, HIGH);
    lastTelemetry = millis();
    publishPumpState();
    return;
}

  // Включваме помпата → нулираме таймера за бърз интервал
  if (soilPercent < soilThreshold && !pumpState) {
    pumpState = true;
    digitalWrite(RELAY_PIN, LOW);
    lastTelemetry = millis() - TELEMETRY_PUMP_ON_MS; // изпращаме веднага
    Serial.println("[AUTO] Pump ON → telemetry @ 1s");
    publishPumpState();
  }

  // Спираме помпата → превключваме към бавен интервал
  if (soilPercent >= soilStopThreshold && pumpState) {
    pumpState = false;
    digitalWrite(RELAY_PIN, HIGH);
    lastTelemetry = millis(); // следващото изпращане след 30s
    Serial.println("[AUTO] Pump OFF → telemetry @ 30s");
    publishPumpState();
  }
}

/* ================= SETUP ================= */
void setup() {
  Serial.begin(115200);
  espClient.setInsecure(); // само за тестове с HiveMQ cloud; замени в продукция

  WiFiManager wifiManager;
  if (!wifiManager.autoConnect("ESP32_Setup", "12345678")) {
    Serial.println("WiFiManager failed - restarting");
    delay(2000);
    ESP.restart();
  }

  Serial.print("[WIFI] Connected, IP=");
  Serial.println(WiFi.localIP());

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // OFF (active LOW)

  analogReadResolution(12);
  analogSetPinAttenuation(SOIL_PIN, ADC_11db);

  dht.begin();
  Wire.begin(I2C_SDA, I2C_SCL);
  lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE);

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);

  lastTelemetry = millis() - TELEMETRY_PUMP_OFF_MS; // изпращаме веднага при старт
}

/* ================= LOOP ================= */
void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop(); // ЗАДЪЛЖИТЕЛНО се вика често за получаване на съобщения

  unsigned long now = millis();

  // Динамичен интервал: 1s когато помпата работи, 30s когато е спряна
  if (now - lastTelemetry >= activeTelemetryInterval()) {
    lastTelemetry = now;

    float temp = dht.readTemperature();
    float hum  = dht.readHumidity();
    float lux  = lightMeter.readLightLevel();
    int soilRaw     = readSoil();
    int soilPercent = map(soilRaw, SOIL_DRY, SOIL_WET, 0, 100);
    soilPercent     = constrain(soilPercent, 0, 100);

    // Авто логика → може да смени pumpState и да нулира lastTelemetry
    handleAutoWatering(soilPercent);

    // Публикуваме телеметрия
    char payload[320];
    snprintf(payload, sizeof(payload),
      "{"
        "\"deviceId\":\"%s\","
        "\"temperature\":%.2f,"
        "\"humidity\":%.2f,"
        "\"soilMoisture\":%d,"
        "\"light\":%.2f,"
        "\"pump\":\"%s\""
      "}",
      deviceId.c_str(),
      temp, hum, soilPercent, lux,
      pumpState ? "ON" : "OFF"
    );

    bool ok = client.publish("plant/sensors/data", payload);
    Serial.print("[MQTT] Telemetry (interval=");
    Serial.print(pumpState ? "1s" : "30s");
    Serial.print(") publish ");
    Serial.print(ok ? "OK: " : "FAIL: ");
    Serial.println(payload);
  }

  delay(20);
}