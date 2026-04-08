import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Droplets,
  Sun,
  Thermometer,
  Wind,
  Heart,
  Calendar,
  Clock,
  Settings,
  Bell,
  AlertTriangle,
  Leaf,
  WifiOff,
  Activity,
  MapPin,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import AreaChartComponent from '@/components/charts/AreaChartComponent';
import PumpControl from '@/components/ui/PumpControl';
import { cn } from '@/lib/utils';
import { api } from '@/api/api';
import plantBg from '@/assets/plant_bg.png';

// ── Constants ─────────────────────────────────────────────────────────────────
const DEFAULT_RANGES = {
  soil_moisture: { min: 40, max: 80 },
  temperature: { min: 18, max: 30 },
  air_humidity: { min: 50, max: 80 },
  light: { min: 5000, max: 15000 }
};

const SENSORS = [
  { key: 'soil_moisture', label: 'Soil Moisture', icon: Droplets, color: '#3B82F6', bg: 'bg-blue-50', unit: '%', displayFn: v => `${Math.round(v)}%` },
  { key: 'temperature', label: 'Temperature', icon: Thermometer, color: '#EF4444', bg: 'bg-red-50', unit: '°C', displayFn: v => `${v.toFixed(1)}°` },
  { key: 'air_humidity', label: 'Air Humidity', icon: Wind, color: '#8B5CF6', bg: 'bg-purple-50', unit: '%', displayFn: v => `${Math.round(v)}%` },
  { key: 'light', label: 'Light', icon: Sun, color: '#F59E0B', bg: 'bg-amber-50', unit: 'lux', displayFn: v => `${Math.round(v)} lux` },
];

// ── SVG Ring Gauge ────────────────────────────────────────────────────────────
function RingGauge({ value, range, color, size = 120 }) {
  const r = (size / 2) - 10;
  const circumference = 2 * Math.PI * r;
  // Arc covers 270° (¾ of circle), starting from bottom-left
  const arcLength = circumference * 0.75;

  let pct = 0;
  let ringColor = color;

  if (value != null && range) {
    pct = Math.min(1, Math.max(0, (value - 0) / (range.max * 1.25)));
    const ratio = (value - range.min) / (range.max - range.min);
    if (value >= range.min && value <= range.max) ringColor = '#10B981'; // green
    else if (ratio < -0.2 || ratio > 1.2) ringColor = '#EF4444';         // red
    else ringColor = '#F59E0B';                                            // amber
  }

  const filled = arcLength * pct;
  const rotation = 135; // start angle

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth={8}
        strokeDasharray={`${arcLength} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
      />
      {/* Fill */}
      {value != null && (
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={8}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 0.8s ease, stroke 0.5s ease' }}
        />
      )}
    </svg>
  );
}

// ── Sensor Gauge Card ─────────────────────────────────────────────────────────
function SensorGaugeCard({ sensor, value, range, hasData }) {
  const Icon = sensor.icon;
  const displayValue = hasData && value != null ? sensor.displayFn(value) : '—';

  let statusLabel = 'No data';
  let statusColor = 'text-slate-400';
  if (hasData && value != null && range) {
    if (value >= range.min && value <= range.max) { statusLabel = 'Optimal'; statusColor = 'text-emerald-600'; }
    else if (value < range.min) { statusLabel = 'Too low'; statusColor = 'text-amber-600'; }
    else { statusLabel = 'Too high'; statusColor = 'text-red-600'; }
  }

  return (
    <Card className="border-slate-100 hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex flex-col items-center gap-3">
        {/* Ring */}
        <div className="relative">
          <RingGauge
            value={hasData ? value : null}
            range={range}
            color={sensor.color}
            size={110}
          />
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Icon className="w-4 h-4 mb-0.5" style={{ color: sensor.color }} />
            <span className={`text-lg font-bold ${hasData ? 'text-slate-800' : 'text-slate-300'}`}>
              {displayValue}
            </span>
          </div>
        </div>

        {/* Label + status */}
        <div className="text-center">
          <p className="font-semibold text-slate-700 text-sm">{sensor.label}</p>
          <p className={`text-xs mt-0.5 font-medium ${statusColor}`}>{statusLabel}</p>
          {range && (
            <p className="text-[10px] text-slate-400 mt-0.5">
              Optimal: {range.min}–{range.max}{sensor.unit}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── No-data empty state ───────────────────────────────────────────────────────
function NoDataState({ message = 'No sensor data yet', sub = 'Readings will appear here once your device connects.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
        <WifiOff className="w-8 h-8 text-slate-300" />
      </div>
      <div>
        <p className="font-semibold text-slate-600">{message}</p>
        <p className="text-sm text-slate-400 mt-1 max-w-xs">{sub}</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PlantDetails() {
  const [pumpOn, setPumpOn] = useState(false);
  const [deviceAlerts, setDeviceAlerts] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const socketRef = useSocket();
  const navigate = useNavigate();
  // 5-minute offline timer for this device
  const offlineTimerRef = React.useRef(null);

  // Reset the 5-min offline countdown whenever a reading arrives
  // timeoutMs defaults to 5 minutes (300000ms)
  const markOnline = React.useCallback((timeoutMs = 300000) => {
    setIsOnline(true);
    if (offlineTimerRef.current) clearTimeout(offlineTimerRef.current);
    offlineTimerRef.current = setTimeout(() => {
      setIsOnline(false);
    }, timeoutMs);
  }, []);



  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (offlineTimerRef.current) clearTimeout(offlineTimerRef.current); };
  }, []);

  const [settings, setSettings] = useState({
    lowMoisture: true,
    autoWatering: true,
    lightReminder: false
  });

  const { id: deviceId } = useParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!deviceId) navigate('/dashboard', { replace: true });
  }, [deviceId, navigate]);

  const { data: deviceResponse, isLoading: isDeviceLoading, isError, error } = useQuery({
    queryKey: ['device', deviceId],
    queryFn: () => api.devices.get(deviceId),
    enabled: !!deviceId
  });

  const { data: chartResponse } = useQuery({
    queryKey: ['device', deviceId, 'chart'],
    queryFn: () => api.sensors.getChartData(deviceId, 24, 60),
    enabled: !!deviceId
  });

  const { data: alertsResponse } = useQuery({
    queryKey: ['device', deviceId, 'alerts'],
    queryFn: () => api.alerts.getByDevice(deviceId),
    enabled: !!deviceId
  });

  // Initialize online status from fetched data
  useEffect(() => {
    if (deviceResponse?.data?.current_reading?.timestamp) {
      const readingTime = new Date(deviceResponse.data.current_reading.timestamp).getTime();
      const diff = Date.now() - readingTime;
      if (diff < 300000) {
        markOnline(300000 - diff);
      }
    }
  }, [deviceResponse, markOnline]);

  useEffect(() => {
    if (alertsResponse?.data) setDeviceAlerts(alertsResponse.data);
  }, [alertsResponse]);

  useEffect(() => {
    if (deviceResponse?.data) setPumpOn(deviceResponse.data.pump_status === 'ON');
  }, [deviceResponse]);

  useEffect(() => {
    if (!deviceId) return;
    const socket = socketRef.current;
    if (!socket) return;

    const handleSensorUpdate = (data) => {
      if (data.deviceId !== deviceId) return;
      markOnline(); // sensor data = device is alive, reset 5-min timer
      queryClient.setQueryData(['device', deviceId], (oldData) => {
        if (!oldData?.data) return oldData;
        return { ...oldData, data: { ...oldData.data, current_reading: { ...oldData.data.current_reading, ...data.reading } } };
      });
      if (data.pumpStatus) setPumpOn(data.pumpStatus === 'ON');
    };

    const handleAlert = (data) => {
      if (data.deviceId !== deviceId) return;
      toast.error(data.alert.message);
      setDeviceAlerts(prev => [data.alert, ...prev.filter(a => a.code !== data.alert.code)]);
    };

    const handleAlertResolved = (data) => {
      if (data.deviceId !== deviceId) return;
      setDeviceAlerts(prev => prev.filter(alert => alert.id !== data.alertId));
      toast.success(`Alert resolved: ${data.code}`);
    };

    const handleDeviceStatus = (data) => {
      if (data.deviceId !== deviceId) return;
      if (data.status === 'ONLINE') {
        markOnline();
      } else {
        setIsOnline(false);
      }
      if (data.pumpStatus) setPumpOn(data.pumpStatus === 'ON');
    };

    const handlePumpUpdate = (data) => {
      if (data.deviceId === deviceId && data.pumpStatus) setPumpOn(data.pumpStatus === 'ON');
    };

    socket.on('sensor-update', handleSensorUpdate);
    socket.on('alert', handleAlert);
    socket.on('alert-resolved', handleAlertResolved);
    socket.on('device-status', handleDeviceStatus);
    socket.on('pump-update', handlePumpUpdate);

    return () => {
      socket.off('sensor-update', handleSensorUpdate);
      socket.off('alert', handleAlert);
      socket.off('alert-resolved', handleAlertResolved);
      socket.off('device-status', handleDeviceStatus);
      socket.off('pump-update', handlePumpUpdate);
    };
  }, [deviceId, socketRef, queryClient, markOnline]);

  const handlePumpToggle = async (newState) => {
    try {
      setPumpOn(newState);
      await api.devices.togglePump(deviceId, newState ? 'ON' : 'OFF');
      toast.success(`Pump turned ${newState ? 'ON' : 'OFF'}`);
    } catch (err) {
      toast.error('Failed to toggle pump');
      setPumpOn(!newState);
    }
  };

  const device = deviceResponse?.data;
  const rawChartData = chartResponse?.data || [];
  const historyData = rawChartData.map(point => ({
    time: new Date(point.time_bucket).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    soil_moisture: point.soil_moisture,
    temperature: point.temperature,
    air_humidity: point.air_humidity,
    light: point.light
  }));

  const plant = device ? {
    id: device.id,
    name: device.plant_name || 'Unnamed Plant',
    species: device.plant_species || 'Unknown Species',
    image: device.plant_image,
    location: device.location || 'Not specified',
    addedDate: new Date(device.created_at).toLocaleDateString(),
    currentReadings: device.current_reading || null,
    optimalRanges: DEFAULT_RANGES,
  } : null;

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isDeviceLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-slate-200 rounded-lg" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Failed to load plant</h3>
          <p className="text-slate-500 mt-1">{error?.message || 'Connection error'}</p>
        </div>
        <Button onClick={() => navigate('/dashboard')} variant="outline">Back to Plants</Button>
      </div>
    );
  }

  if (!deviceId) return null;

  if (!isDeviceLoading && !plant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Plant not found</h3>
          <p className="text-slate-500 mt-1">This device may have been removed.</p>
        </div>
        <Button onClick={() => navigate('/dashboard')} variant="outline">Back to Plants</Button>
      </div>
    );
  }

  const hasData = !!plant.currentReadings;

  return (
    <div className="space-y-6 w-full mx-auto">

      {/* ── Back button ── */}
      <button
        onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/dashboard')}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-600 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back
      </button>

      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden h-64 lg:h-80 shadow-xl"
      >
        {/* Background image */}
        {plant.image ? (
          <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" />
        ) : (
          <img src={plantBg} alt="plant" className="w-full h-full object-cover brightness-75 blur-[1px]" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          {isOnline ? (
            <Badge className="bg-emerald-500 text-white border-0 shadow-lg gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
              Online
            </Badge>
          ) : (
            <Badge className="bg-slate-700/80 backdrop-blur-sm text-slate-300 border-0 gap-1.5">
              <WifiOff className="w-3 h-3" />
              Offline
            </Badge>
          )}
          <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 gap-1">
            <Heart className="w-3 h-3 fill-emerald-400 text-emerald-400" />
            Healthy
          </Badge>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight drop-shadow-lg">
            {plant.name}
          </h1>
          <p className="text-white/70 text-lg mt-1">{plant.species}</p>
          <div className="flex items-center gap-4 mt-3 text-white/60 text-sm">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> {plant.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Added {plant.addedDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> {plant.id}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="readings" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="readings" className="rounded-lg gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Live Readings
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg gap-1.5">
            <Clock className="w-3.5 h-3.5" /> History
          </TabsTrigger>
          <TabsTrigger value="care" className="rounded-lg gap-1.5">
            <Leaf className="w-3.5 h-3.5" /> Care
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg gap-1.5">
            <Settings className="w-3.5 h-3.5" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* ── Live Readings Tab ── */}
        <TabsContent value="readings" className="mt-6 space-y-5">

          {/* Gauge cards */}
          {hasData ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {SENSORS.map(sensor => (
                <motion.div
                  key={sensor.key}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: SENSORS.indexOf(sensor) * 0.07 }}
                >
                  <SensorGaugeCard
                    sensor={sensor}
                    value={plant.currentReadings?.[sensor.key]}
                    range={plant.optimalRanges[sensor.key]}
                    hasData={hasData}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border-slate-100">
              <CardContent className="p-0">
                <NoDataState
                  message="Waiting for sensor data"
                  sub="Your device hasn't sent any readings yet. Make sure it's powered on and connected."
                />
              </CardContent>
            </Card>
          )}

          {/* Last reading time */}
          {hasData && plant.currentReadings?.timestamp && (
            <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1.5">
              <Clock className="w-3 h-3" />
              Last reading: {new Date(plant.currentReadings.timestamp).toLocaleTimeString()}
            </p>
          )}

          {/* Active Alerts */}
          {deviceAlerts.length > 0 && (
            <Card className="border-red-100 bg-gradient-to-br from-red-50 to-rose-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-4 h-4" />
                  Active Alerts ({deviceAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {deviceAlerts.slice(0, 3).map((alert, idx) => (
                    <li key={idx} className="flex items-center justify-between p-3 bg-white/60 rounded-xl text-sm">
                      <span className="text-red-700 font-medium">{alert.message}</span>
                      <span className="text-xs text-red-400">{new Date(alert.created_at).toLocaleTimeString()}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Pump Control */}
          <PumpControl
            isOn={pumpOn}
            onToggle={() => handlePumpToggle(!pumpOn)}
            lastActivated="Unknown"
          />
        </TabsContent>

        {/* ── History Tab ── */}
        <TabsContent value="history" className="mt-6">
          {historyData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[
                { key: 'soil_moisture', label: 'Moisture History (24h)', icon: Droplets, color: '#3B82F6', gradId: 'moistureH', unit: '%' },
                { key: 'temperature', label: 'Temperature History (24h)', icon: Thermometer, color: '#EF4444', gradId: 'tempH', unit: '°C' },
                { key: 'air_humidity', label: 'Humidity History (24h)', icon: Wind, color: '#8B5CF6', gradId: 'humidH', unit: '%' },
                { key: 'light', label: 'Light History (24h)', icon: Sun, color: '#F59E0B', gradId: 'lightH', unit: ' lux' },
              ].map((chart, i) => {
                const Icon = chart.icon;
                return (
                  <motion.div key={chart.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Card className="border-slate-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                          <Icon className="w-4 h-4" style={{ color: chart.color }} />
                          {chart.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <AreaChartComponent
                          data={historyData}
                          dataKey={chart.key}
                          color={chart.color}
                          gradientId={chart.gradId}
                          title={chart.label}
                          unit={chart.unit}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card className="border-slate-100">
              <CardContent className="p-0">
                <NoDataState
                  message="No historical data yet"
                  sub="Readings will appear here once your sensor starts sending data. Charts update every hour."
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Care Tab ── */}
        <TabsContent value="care" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Droplets, color: 'blue', title: 'Watering', last: 'Not tracked', next: 'Not tracked', bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
              { icon: Leaf, color: 'green', title: 'Fertilizing', last: 'Not tracked', next: 'Not tracked', bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
              { icon: Sun, color: 'amber', title: 'Light Check', last: 'Not tracked', next: 'Not tracked', bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
              { icon: Wind, color: 'purple', title: 'Misting', last: 'Not tracked', next: 'Not tracked', bg: 'bg-purple-50', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className={`border-0 ${item.bg}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2.5 ${item.iconBg} rounded-xl`}>
                        <Icon className={`w-5 h-5 ${item.iconColor}`} />
                      </div>
                      <h3 className="font-semibold text-slate-700">{item.title}</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Last</span>
                        <span className="text-slate-400 italic">{item.last}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Next</span>
                        <span className="text-slate-400 italic">{item.next}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 text-center mt-4">
            Care schedule tracking will be connected to sensor data in a future update.
          </p>
        </TabsContent>

        {/* ── Settings Tab ── */}
        <TabsContent value="settings" className="mt-6">
          <Card className="border-slate-100">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-500" />
                Alert Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'lowMoisture', label: 'Low Moisture Alert', desc: 'Notify when soil moisture drops below optimal range' },
                { key: 'autoWatering', label: 'Auto Watering', desc: 'Automatically activate pump when moisture is low' },
                { key: 'lightReminder', label: 'Light Reminder', desc: 'Remind to move plant for better light exposure' },
              ].map(s => (
                <div key={s.key} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-medium text-slate-700 text-sm">{s.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                  </div>
                  <Switch
                    checked={settings[s.key]}
                    onCheckedChange={(checked) => setSettings({ ...settings, [s.key]: checked })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}