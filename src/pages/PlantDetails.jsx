import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
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
  AlertTriangle,
  WifiOff,
  Activity,
  MapPin,
  Cpu,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AreaChartComponent from '@/components/charts/AreaChartComponent';
import PumpControl from '@/components/ui/PumpControl';
import { api } from '@/api/api';
import plantBg from '@/assets/plant_bg.png';

// ── Constants ─────────────────────────────────────────────────────────────────
const DEFAULT_RANGES = {
  soil_moisture: { min: 40, max: 80 },
  temperature: { min: 18, max: 30 },
  air_humidity: { min: 50, max: 80 },
  light: { min: 5000, max: 15000 }
};

const SENSOR_DEFS = [
  { key: 'soil_moisture', labelKey: 'plantDetails.sensors.soilMoisture', icon: Droplets, color: '#3B82F6', bg: 'bg-blue-50', unit: '%', displayFn: v => `${Math.round(v)}%` },
  { key: 'temperature',   labelKey: 'plantDetails.sensors.temperature',  icon: Thermometer, color: '#EF4444', bg: 'bg-red-50', unit: '°C', displayFn: v => `${v.toFixed(1)}°` },
  { key: 'air_humidity',  labelKey: 'plantDetails.sensors.airHumidity',  icon: Wind, color: '#8B5CF6', bg: 'bg-purple-50', unit: '%', displayFn: v => `${Math.round(v)}%` },
  { key: 'light',         labelKey: 'plantDetails.sensors.light',        icon: Sun, color: '#F59E0B', bg: 'bg-amber-50', unit: 'lux', displayFn: v => `${Math.round(v)} lux` },
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
function SensorGaugeCard({ sensor, value, range, hasData, t }) {
  const Icon = sensor.icon;
  const displayValue = hasData && value != null ? sensor.displayFn(value) : '—';

  let statusLabel = t('plantDetails.gauge.noData');
  let statusColor = 'text-slate-400 dark:text-slate-400';
  if (hasData && value != null && range) {
    if (value >= range.min && value <= range.max) { statusLabel = t('plantDetails.gauge.optimal'); statusColor = 'text-emerald-600 dark:text-green-400'; }
    else if (value < range.min) { statusLabel = t('plantDetails.gauge.tooLow'); statusColor = 'text-amber-600 dark:text-amber-400'; }
    else { statusLabel = t('plantDetails.gauge.tooHigh'); statusColor = 'text-red-600 dark:text-red-400'; }
  }

  return (
    <Card className="bg-white dark:bg-[#1E293B]/60 border-slate-100 dark:border-white/[0.07] hover:shadow-md dark:hover:shadow-none transition-shadow">
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
            <span className={`text-lg font-bold ${hasData ? 'text-slate-800 dark:text-white' : 'text-slate-300 dark:text-slate-400'}`}>
              {displayValue}
            </span>
          </div>
        </div>

        {/* Label + status */}
        <div className="text-center">
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{sensor.label}</p>
          <p className={`text-xs mt-0.5 font-medium ${statusColor}`}>{statusLabel}</p>
          {range && (
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">
              {t('plantDetails.gauge.optimalRange', { min: range.min, max: range.max, unit: sensor.unit })}
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
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center">
        <WifiOff className="w-8 h-8 text-slate-300 dark:text-slate-400" />
      </div>
      <div>
        <p className="font-semibold text-slate-600 dark:text-slate-400">{message}</p>
        <p className="text-sm text-slate-400 dark:text-slate-400 mt-1 max-w-xs">{sub}</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PlantDetails() {
  const { t } = useTranslation();
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
      toast.success(t('plantDetails.alertResolved', { code: data.code }));
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
      toast.success(newState ? t('plantDetails.pump.on') : t('plantDetails.pump.off'));
    } catch (err) {
      toast.error(t('plantDetails.pump.error'));
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
    name: device.plant_name || t('plantDetails.unnamedPlant'),
    species: device.plant_species || t('plantDetails.unknownSpecies'),
    image: device.plant_image,
    location: device.location || t('plantDetails.locationNotSpecified'),
    addedDate: new Date(device.created_at).toLocaleDateString(),
    currentReadings: device.current_reading || null,
    optimalRanges: DEFAULT_RANGES,
  } : null;

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isDeviceLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-slate-200 dark:bg-white/[0.06] rounded-lg" />
        <div className="h-64 bg-slate-200 dark:bg-white/[0.06] rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-100 dark:bg-white/[0.04] rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('plantDetails.failedToLoad')}</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{error?.message || t('plantDetails.connectionError')}</p>
        </div>
        <Button onClick={() => navigate('/dashboard')} variant="outline"
          className="border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05]">{t('plantDetails.backToPlants')}</Button>
      </div>
    );
  }

  if (!deviceId) return null;

  if (!isDeviceLoading && !plant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('plantDetails.notFound')}</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('plantDetails.notFoundSub')}</p>
        </div>
        <Button onClick={() => navigate('/dashboard')} variant="outline"
          className="border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05]">{t('plantDetails.backToPlants')}</Button>
      </div>
    );
  }

  const hasData = !!plant.currentReadings;

  const SENSORS = SENSOR_DEFS.map(s => ({ ...s, label: t(s.labelKey) }));

  return (
    <div className="space-y-6 w-full mx-auto">

      {/* ── Back button ── */}
      <button
        onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/dashboard')}
        className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-green-400 transition-colors group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        {t('plantDetails.back')}
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
              {t('plantDetails.status.online')}
            </Badge>
          ) : (
            <Badge className="bg-slate-700/80 backdrop-blur-sm text-slate-300 border-0 gap-1.5">
              <WifiOff className="w-3 h-3" />
              {t('plantDetails.status.offline')}
            </Badge>
          )}
          <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 gap-1">
            <Heart className="w-3 h-3 fill-emerald-400 text-emerald-400" />
            {t('plantDetails.status.healthy')}
          </Badge>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight drop-shadow-lg">
            {plant.name}
          </h1>
          <p className="text-white/70 text-lg mt-1">{plant.species}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-white/60 text-sm">
            <span className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate max-w-[120px]">{plant.location}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" /> {t('plantDetails.addedDate', { date: plant.addedDate })}
            </span>
            <span className="hidden sm:flex items-center gap-1.5 min-w-0">
              <Cpu className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate max-w-[140px] font-mono text-xs">{plant.id}</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="readings" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-white/[0.05] p-1 rounded-xl border-0">
          <TabsTrigger value="readings" className="rounded-lg gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-white/[0.08] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-slate-600 dark:text-slate-400">
            <Activity className="w-3.5 h-3.5" /> {t('plantDetails.tabs.readings')}
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-white/[0.08] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-slate-600 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" /> {t('plantDetails.tabs.history')}
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
                    t={t}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="bg-white dark:bg-[#1E293B]/60 border-slate-100 dark:border-white/[0.07]">
              <CardContent className="p-0">
                <NoDataState
                  message={t('plantDetails.noData.waiting')}
                  sub={t('plantDetails.noData.waitingSub')}
                />
              </CardContent>
            </Card>
          )}

          {/* Last reading time */}
          {hasData && plant.currentReadings?.timestamp && (
            <p className="text-xs text-slate-400 dark:text-slate-400 text-center flex items-center justify-center gap-1.5">
              <Clock className="w-3 h-3" />
              {t('plantDetails.lastReading', { time: new Date(plant.currentReadings.timestamp).toLocaleTimeString() })}
            </p>
          )}

          {/* Active Alerts */}
          {deviceAlerts.length > 0 && (
            <Card className="border-red-100 dark:border-red-500/20 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-500/[0.08] dark:to-red-600/[0.05]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  {t('plantDetails.activeAlerts', { count: deviceAlerts.length })}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {deviceAlerts.slice(0, 3).map((alert, idx) => (
                    <li key={idx} className="flex items-center justify-between p-3 bg-white/60 dark:bg-white/[0.05] rounded-xl text-sm">
                      <span className="text-red-700 dark:text-red-400 font-medium">{alert.message}</span>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-xs text-red-400">{new Date(alert.created_at).toLocaleTimeString()}</span>
                        <button
                          onClick={() => setDeviceAlerts(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-300 hover:text-red-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
            lastActivated={t('common.unknown')}
          />
        </TabsContent>

        {/* ── History Tab ── */}
        <TabsContent value="history" className="mt-6">
          {historyData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {[
                { key: 'soil_moisture', label: t('plantDetails.history.moisture'), icon: Droplets, color: '#3B82F6', gradId: 'moistureH', unit: '%' },
                { key: 'temperature', label: t('plantDetails.history.temperature'), icon: Thermometer, color: '#EF4444', gradId: 'tempH', unit: '°C' },
                { key: 'air_humidity', label: t('plantDetails.history.humidity'), icon: Wind, color: '#8B5CF6', gradId: 'humidH', unit: '%' },
                { key: 'light', label: t('plantDetails.history.light'), icon: Sun, color: '#F59E0B', gradId: 'lightH', unit: ' lux' },
              ].map((chart, i) => {
                const Icon = chart.icon;
                return (
                  <motion.div key={chart.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Card className="bg-white dark:bg-[#1E293B]/60 border-slate-100 dark:border-white/[0.07]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-slate-700 dark:text-slate-300">
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
            <Card className="bg-white dark:bg-[#1E293B]/60 border-slate-100 dark:border-white/[0.07]">
              <CardContent className="p-0">
                <NoDataState
                  message={t('plantDetails.noData.noHistory')}
                  sub={t('plantDetails.noData.noHistorySub')}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}