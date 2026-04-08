import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Leaf,
  Plus,
  BarChart3,
  Settings as SettingsIcon,
  TrendingUp,
  Droplets,
  Thermometer,
  Wind,
  Sun,
  Radio,
  WifiOff,
  ChevronRight,
  Sprout,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import AddDeviceDialog from '@/components/devices/AddDeviceDialog';
import { api } from '@/api/api';
import { useSocket } from '@/hooks/useSocket';
import plantBg from '@/assets/plant_bg.png';

// ── Sensor config ────────────────────────────────────────────────────────────
const SENSORS = [
  { key: 'soil_moisture', label: 'Moisture', icon: Droplets, color: 'blue', unit: '%', max: 100 },
  { key: 'temperature', label: 'Temperature', icon: Thermometer, color: 'red', unit: '°C', max: 50 },
  { key: 'air_humidity', label: 'Humidity', icon: Wind, color: 'purple', unit: '%', max: 100 },
  { key: 'light', label: 'Light', icon: Sun, color: 'amber', unit: ' lux', max: 20000 },
];

const COLOR_MAP = {
  blue: { bg: 'bg-blue-50', bar: 'bg-blue-400', text: 'text-blue-600', icon: 'text-blue-500' },
  red: { bg: 'bg-red-50', bar: 'bg-red-400', text: 'text-red-600', icon: 'text-red-500' },
  purple: { bg: 'bg-purple-50', bar: 'bg-purple-400', text: 'text-purple-600', icon: 'text-purple-500' },
  amber: { bg: 'bg-amber-50', bar: 'bg-amber-400', text: 'text-amber-600', icon: 'text-amber-500' },
};

function formatValue(sensor, reading) {
  const raw = reading?.[sensor.key];
  if (raw == null) return '—';
  if (sensor.key === 'light') return Math.round(raw);
  if (sensor.key === 'temperature') return raw.toFixed(1);
  return Math.round(raw);
}

function getBarPct(sensor, reading) {
  const raw = reading?.[sensor.key];
  if (raw == null) return 0;
  return Math.min(100, Math.max(0, (raw / sensor.max) * 100));
}

// ── Mini sensor tile ─────────────────────────────────────────────────────────
function SensorTile({ sensor, reading, hasData }) {
  const c = COLOR_MAP[sensor.color];
  const Icon = sensor.icon;
  const pct = getBarPct(sensor, reading);
  const value = formatValue(sensor, reading);

  return (
    <div className={`${c.bg} rounded-xl p-3 flex flex-col h-full`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-3.5 h-3.5 ${c.icon}`} />
        <span className={`text-[11px] font-bold ${hasData ? c.text : 'text-slate-300'} truncate ml-1 text-right`}>
          {hasData ? `${value}${sensor.unit}` : '—'}
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-1 rounded-full bg-white/60 overflow-hidden mb-2">
        {hasData && (
          <div
            className={`h-full rounded-full ${c.bar} transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
      <div className="mt-auto">
        <p className="text-[10px] text-slate-400 leading-none">{sensor.label}</p>
      </div>
    </div>
  );
}

// ── Plant Card ───────────────────────────────────────────────────────────────
function PlantCard({ device, index, isLive }) {
  const { t } = useTranslation();
  const hasData = !!device.current_reading;

  return (
    <Link to={createPageUrl('plant-details') + `/${device.id}`} className="block h-full">
      <Card className={`flex flex-col border-slate-100 hover:shadow-2xl hover:border-emerald-200 transition-all duration-300 cursor-pointer group overflow-hidden ${isLive ? 'ring-2 ring-emerald-400/60 shadow-emerald-100' : ''}`}>

        {/* ── Image area ── */}
        <div className="relative h-52 overflow-hidden">
          {device.plant_image ? (
            <div
              className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
              style={{ backgroundImage: `url(${device.plant_image})` }}
            />
          ) : (
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={plantBg}
                alt="plant"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 blur-[1px] brightness-75"
              />
              {/* Number badge */}
              <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <span className="text-white font-bold text-xs">#{index + 1}</span>
              </div>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Live badge */}
          {isLive && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold shadow-lg">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
              Live
            </div>
          )}

          {/* No-data badge */}
          {!hasData && !isLive && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-700/70 backdrop-blur-sm text-slate-300 text-xs font-medium">
              <WifiOff className="w-3 h-3" />
              Offline
            </div>
          )}

          {/* Plant name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-white text-lg leading-tight drop-shadow-sm">
              {device.plant_name || t('dashboard.plants.unnamed', 'Unnamed Plant')}
            </h3>
            {device.location && (
              <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1">
                <span>📍</span> {device.location}
              </p>
            )}
          </div>
        </div>

        {/* ── Sensor tiles ── */}
        <CardContent className="p-4 flex-1 flex flex-col">
          {hasData ? (
            <div className="grid grid-cols-4 gap-2 flex-1">
              {SENSORS.map(s => (
                <SensorTile key={s.key} sensor={s} reading={device.current_reading} hasData={true} />
              ))}
            </div>
          ) : (
            /* No-data state — full-width faded tiles + pulsing dot */
            <div className="space-y-2 flex-1 flex flex-col">
              <div className="grid grid-cols-4 gap-2 flex-1">
                {SENSORS.map(s => (
                  <SensorTile key={s.key} sensor={s} reading={null} hasData={false} />
                ))}
              </div>
              {/* <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 mt-auto pt-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-slate-300" />
                </span>
                Waiting for first reading…
              </p> */}
            </div>
          )}

          {/* Footer
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs text-slate-400 italic truncate max-w-[60%]">
              {device.plant_species && device.plant_species.toLowerCase() !== 'unknown species' && device.plant_species.toLowerCase() !== 'unknown'
                ? device.plant_species
                : ''}
            </span>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
              View <ChevronRight className="w-3 h-3" />
            </span>
          </div> */}
        </CardContent>
      </Card>
    </Link>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const socketRef = useSocket();
  const [liveDeviceIds, setLiveDeviceIds] = useState(new Set());
  // Per-device timer map — cleared & reset on every sensor update
  const liveTimersRef = React.useRef({});

  // Helper: mark a device live and (re)start its 5-min offline timer
  // Helper: mark a device live and (re)start its offline timer (default 5 mins)
  const markLive = React.useCallback((deviceId, timeoutMs = 300000) => {
    setLiveDeviceIds(prev => new Set([...prev, deviceId]));
    // Clear any existing timer for this device
    if (liveTimersRef.current[deviceId]) {
      clearTimeout(liveTimersRef.current[deviceId]);
    }
    // Start countdown
    liveTimersRef.current[deviceId] = setTimeout(() => {
      setLiveDeviceIds(prev => {
        const next = new Set(prev);
        next.delete(deviceId);
        return next;
      });
      delete liveTimersRef.current[deviceId];
    }, timeoutMs);
  }, []);



  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      Object.values(liveTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  // Fetch devices
  const { data: devicesResponse, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: api.devices.list
  });

  const devices = devicesResponse?.data || [];
  const liveCount = liveDeviceIds.size;

  // Initialize live status from fetched data (persists "Live" on refresh)
  useEffect(() => {
    if (!devices.length) return;
    const now = Date.now();
    devices.forEach(device => {
      if (device.current_reading?.timestamp) {
        const readingTime = new Date(device.current_reading.timestamp).getTime();
        const diff = now - readingTime;
        if (diff < 300000) { // less than 5 mins old
          const remaining = 300000 - diff;
          markLive(device.id, remaining);
        }
      }
    });
  }, [devices, markLive]);

  // Real-time sensor updates via socket
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleSensorUpdate = (data) => {
      if (!data.deviceId || !data.reading) return;
      markLive(data.deviceId);
      queryClient.setQueryData(['devices'], (oldData) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map(device => {
            if (device.id === data.deviceId) {
              return {
                ...device,
                current_reading: { ...device.current_reading, ...data.reading }
              };
            }
            return device;
          })
        };
      });
    };

    // device-status is also emitted by the server on every sensor reading
    const handleDeviceStatus = (data) => {
      if (data.deviceId && data.status === 'ONLINE') {
        markLive(data.deviceId);
      }
    };

    const handleAlert = (data) => {
      toast.warning(data.alert?.message || 'New alert received', {
        description: `Device: ${data.deviceId}`
      });
    };

    socket.on('sensor-update', handleSensorUpdate);
    socket.on('device-status', handleDeviceStatus);
    socket.on('alert', handleAlert);

    return () => {
      socket.off('sensor-update', handleSensorUpdate);
      socket.off('device-status', handleDeviceStatus);
      socket.off('alert', handleAlert);
    };
  }, [socketRef, queryClient, markLive]);

  // Create device mutation
  const createDeviceMutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        id: data.serial_number,
        plant_name: data.plant_name,
        plant_species: data.plant_species,
        location: data.location,
        plant_image: data.plant_image
      };
      return api.devices.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      setDialogOpen(false);
      toast.success(t('dashboard.addDevice.success'));
    },
    onError: (error) => {
      toast.error(t('dashboard.addDevice.error') + ': ' + error.message);
    }
  });

  const handleSubmitDevice = (deviceData) => {
    createDeviceMutation.mutate(deviceData);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
            {t('dashboard.header.title')}
          </h1>
          <p className="text-slate-500 mt-1">{t('dashboard.header.subtitle')}</p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-200 gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('dashboard.header.addPlant')}
        </Button>
      </motion.div>

      {/* ── Stats pills ── */}
      {devices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="flex flex-wrap gap-3"
        >
          {/* Total plants */}
          <div className="flex items-center gap-4 px-5 py-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg shadow-emerald-200">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white leading-none">{devices.length}</p>
              <p className="text-xs text-emerald-100 mt-0.5">{t('dashboard.stats.totalPlants')}</p>
            </div>
          </div>

          {/* Active devices (have data) */}
          {(() => {
            const activeCount = devices.filter(d => !!d.current_reading).length;
            return (
              <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl shadow-sm ${liveCount > 0
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200'
                : 'bg-white border border-slate-100'
                }`}>
                <div className={`p-2.5 rounded-xl ${liveCount > 0 ? 'bg-white/20' : 'bg-slate-100'}`}>
                  <Radio className={`w-5 h-5 ${liveCount > 0 ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold leading-none ${liveCount > 0 ? 'text-white' : 'text-slate-400'}`}>{liveCount}</p>
                  <p className={`text-xs mt-0.5 ${liveCount > 0 ? 'text-blue-100' : 'text-slate-400'}`}>Live now</p>
                </div>
              </div>
            );
          })()}

          {/* No data */}
          {(() => {
            const offlineCount = devices.filter(d => !d.current_reading).length;
            return offlineCount > 0 ? (
              <div className="flex items-center gap-4 px-5 py-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-200">
                <div className="p-2.5 bg-white/20 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white leading-none">{offlineCount}</p>
                  <p className="text-xs text-amber-100 mt-0.5">No data yet</p>
                </div>
              </div>
            ) : null;
          })()}
        </motion.div>
      )}

      {/* ── Plants grid ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">{t('dashboard.plants.title')}</h2>
        </div>

        {isLoading ? (
          /* Loading skeleton */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-slate-100 overflow-hidden animate-pulse">
                <div className="h-52 bg-gradient-to-br from-slate-100 to-slate-200" />
                <CardContent className="p-4">
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(j => (
                      <div key={j} className="h-14 bg-slate-100 rounded-xl" />
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 h-4 bg-slate-100 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : devices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device, index) => (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.06 }}
                className="h-full"
              >
                <PlantCard
                  device={device}
                  index={index}
                  isLive={liveDeviceIds.has(device.id)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="relative rounded-3xl border-2 border-dashed border-emerald-200 bg-gradient-to-br from-emerald-50/40 to-green-50/40 p-16 text-center overflow-hidden">
              {/* Decorative blobs */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-100/40 blur-3xl" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-green-100/40 blur-3xl" />

              <div className="relative">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center shadow-xl shadow-emerald-100">
                  <Leaf className="w-12 h-12 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">{t('dashboard.plants.emptyTitle')}</h3>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
                  {t('dashboard.plants.emptyDescription')}
                </p>
                <Button
                  onClick={() => setDialogOpen(true)}
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-xl shadow-emerald-200 gap-2 px-8"
                >
                  <Plus className="w-5 h-5" />
                  {t('dashboard.plants.addFirst')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Quick Actions ── */}
      {devices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
            <Link to={createPageUrl('Analytics')}>
              <Card className="border-emerald-100 hover:shadow-lg transition-all cursor-pointer group bg-gradient-to-br from-emerald-50 to-green-50 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-white/70 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                          <BarChart3 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">{t('dashboard.actions.analytics.title')}</h3>
                      </div>
                      <p className="text-sm text-slate-600">{t('dashboard.actions.analytics.description')}</p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-emerald-300 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Link to={createPageUrl('Settings')}>
              <Card className="border-slate-100 hover:shadow-lg transition-all cursor-pointer group bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-white/70 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                          <SettingsIcon className="w-6 h-6 text-slate-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">{t('dashboard.actions.settings.title')}</h3>
                      </div>
                      <p className="text-sm text-slate-600">{t('dashboard.actions.settings.description')}</p>
                    </div>
                    <SettingsIcon className="w-10 h-10 text-slate-300 group-hover:text-slate-400 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>
      )}

      <AddDeviceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmitDevice}
        isLoading={createDeviceMutation.isPending}
      />
    </div>
  );
}