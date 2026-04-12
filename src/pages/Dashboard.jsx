import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Leaf, Plus, BarChart3, TrendingUp,
  Droplets, Thermometer, Wind, Sun,
  Radio, WifiOff, Sprout, AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import AddDeviceDialog from '@/components/devices/AddDeviceDialog';
import { api } from '@/api/api';
import { useSocket } from '@/hooks/useSocket';
import plantBg from '@/assets/plant_bg.png';

const SENSORS = [
  { key: 'soil_moisture', label: 'Moisture', icon: Droplets, color: 'blue',   unit: '%',  max: 100   },
  { key: 'temperature',   label: 'Temp',     icon: Thermometer, color: 'red',  unit: '°C', max: 50    },
  { key: 'air_humidity',  label: 'Humidity', icon: Wind,        color: 'purple', unit: '%', max: 100  },
  { key: 'light',         label: 'Light',    icon: Sun,         color: 'amber', unit: 'lx', max: 20000 },
];

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-500/10',     bar: 'bg-blue-400',   text: 'text-blue-600 dark:text-blue-400',   icon: 'text-blue-500 dark:text-blue-400' },
  red:    { bg: 'bg-red-50 dark:bg-red-500/10',       bar: 'bg-red-400',    text: 'text-red-600 dark:text-red-400',     icon: 'text-red-500 dark:text-red-400' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-500/10', bar: 'bg-purple-400', text: 'text-purple-600 dark:text-purple-400', icon: 'text-purple-500 dark:text-purple-400' },
  amber:  { bg: 'bg-amber-50 dark:bg-amber-500/10',   bar: 'bg-amber-400',  text: 'text-amber-600 dark:text-amber-400',  icon: 'text-amber-500 dark:text-amber-400' },
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

function SensorTile({ sensor, reading, hasData }) {
  const c = COLOR_MAP[sensor.color];
  const Icon = sensor.icon;
  const pct = getBarPct(sensor, reading);
  const value = formatValue(sensor, reading);

  return (
    <div className={`${c.bg} rounded-lg p-2.5 flex flex-col h-full border border-black/[0.04] dark:border-white/[0.04]`}>
      <div className="flex items-center justify-between mb-1.5">
        <Icon className={`w-3 h-3 ${c.icon} flex-shrink-0`} />
        <span className={`text-[10px] font-bold ${hasData ? c.text : 'text-slate-300 dark:text-slate-400'} truncate ml-1 text-right`}>
          {hasData ? `${value}${sensor.unit}` : '—'}
        </span>
      </div>
      <div className="h-0.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden mb-1.5">
        {hasData && (
          <div className={`h-full rounded-full ${c.bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
        )}
      </div>
      <p className="text-[9px] text-slate-400 dark:text-slate-400 leading-none mt-auto">{sensor.label}</p>
    </div>
  );
}

function PlantCard({ device, index, isLive }) {
  const { t } = useTranslation();
  const hasData = !!device.current_reading;

  return (
    <Link to={createPageUrl('plant-details') + `/${device.id}`} className="block h-full">
      <Card className={`flex flex-col bg-white dark:bg-[#1E293B]/60 border-slate-100 dark:border-white/[0.07] hover:border-emerald-200 dark:hover:border-white/[0.14] hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden ${isLive ? 'ring-2 ring-emerald-400/60 dark:ring-1 dark:ring-green-500/40' : ''}`}>

        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-[#0F172A]">
          <img
            src={device.plant_image || plantBg}
            alt={device.plant_name || 'plant'}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!device.plant_image ? 'brightness-[0.55] dark:brightness-[0.35] saturate-[0.8]' : ''}`}
          />

          {!device.plant_image && (
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-xs">#{index + 1}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />

          {isLive && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500 dark:bg-green-500/20 dark:border dark:border-green-500/30 text-white dark:text-green-400 text-xs font-semibold backdrop-blur-sm shadow-lg">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white dark:bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white dark:bg-green-400" />
              </span>
              {t('dashboard.plants.live')}
            </div>
          )}

          {!hasData && !isLive && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-700/70 backdrop-blur-sm text-slate-300 text-xs font-medium border border-white/10">
              <WifiOff className="w-3 h-3" />
              {t('dashboard.plants.offline')}
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-white text-base leading-tight drop-shadow-sm">
              {device.plant_name || t('dashboard.plants.unnamed', 'Unnamed Plant')}
            </h3>
            {device.location && (
              <p className="text-white/70 text-xs mt-0.5">{device.location}</p>
            )}
          </div>
        </div>

        {/* Sensor tiles */}
        <CardContent className="p-3 flex-1 flex flex-col bg-transparent">
          <div className="grid grid-cols-4 gap-1.5 flex-1">
            {SENSORS.map(s => (
              <SensorTile key={s.key} sensor={s} reading={device.current_reading} hasData={hasData} />
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const socketRef = useSocket();
  const [liveDeviceIds, setLiveDeviceIds] = useState(new Set());
  const liveTimersRef = React.useRef({});

  const markLive = React.useCallback((deviceId, timeoutMs = 300000) => {
    setLiveDeviceIds(prev => new Set([...prev, deviceId]));
    if (liveTimersRef.current[deviceId]) clearTimeout(liveTimersRef.current[deviceId]);
    liveTimersRef.current[deviceId] = setTimeout(() => {
      setLiveDeviceIds(prev => { const next = new Set(prev); next.delete(deviceId); return next; });
      delete liveTimersRef.current[deviceId];
    }, timeoutMs);
  }, []);

  useEffect(() => { return () => Object.values(liveTimersRef.current).forEach(clearTimeout); }, []);

  const { data: devicesResponse, isLoading } = useQuery({ queryKey: ['devices'], queryFn: api.devices.list });
  const devices = devicesResponse?.data || [];
  const liveCount = liveDeviceIds.size;

  useEffect(() => {
    if (!devices.length) return;
    const now = Date.now();
    devices.forEach(device => {
      if (device.current_reading?.timestamp) {
        const diff = now - new Date(device.current_reading.timestamp).getTime();
        if (diff < 300000) markLive(device.id, 300000 - diff);
      }
    });
  }, [devices, markLive]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handleSensorUpdate = (data) => {
      if (!data.deviceId || !data.reading) return;
      markLive(data.deviceId);
      queryClient.setQueryData(['devices'], (oldData) => {
        if (!oldData?.data) return oldData;
        return { ...oldData, data: oldData.data.map(d => d.id === data.deviceId ? { ...d, current_reading: { ...d.current_reading, ...data.reading } } : d) };
      });
    };
    const handleDeviceStatus = (data) => { if (data.deviceId && data.status === 'ONLINE') markLive(data.deviceId); };
    const handleAlert = (data) => { toast.warning(data.alert?.message || t('dashboard.newAlert'), { description: t('dashboard.deviceLabel', { id: data.deviceId }) }); };
    socket.on('sensor-update', handleSensorUpdate);
    socket.on('device-status', handleDeviceStatus);
    socket.on('alert', handleAlert);
    return () => { socket.off('sensor-update', handleSensorUpdate); socket.off('device-status', handleDeviceStatus); socket.off('alert', handleAlert); };
  }, [socketRef, queryClient, markLive]);

  const createDeviceMutation = useMutation({
    mutationFn: (data) => api.devices.create({ id: data.serial_number, plant_name: data.plant_name, plant_species: data.plant_species, location: data.location, plant_image: data.plant_image }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['devices'] }); setDialogOpen(false); toast.success(t('dashboard.addDevice.success')); },
    onError: (error) => { toast.error(t('dashboard.addDevice.error') + ': ' + error.message); }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{t('dashboard.header.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{t('dashboard.header.subtitle')}</p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-emerald-600 dark:bg-green-500 hover:bg-emerald-700 dark:hover:bg-green-400 text-white shadow-lg shadow-emerald-200 dark:shadow-green-500/20 gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t('dashboard.header.addPlant')}
        </Button>
      </motion.div>

      {/* Stats */}
      {devices.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="flex flex-wrap gap-3">
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-emerald-500 to-green-600 dark:bg-green-500/10 dark:border dark:border-green-500/20 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none">
            <div className="p-2 bg-white/20 dark:bg-green-500/10 rounded-lg">
              <Sprout className="w-4 h-4 text-white dark:text-green-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white dark:text-white leading-none">{devices.length}</p>
              <p className="text-xs text-emerald-100 dark:text-slate-400 mt-0.5">{t('dashboard.stats.totalPlants')}</p>
            </div>
          </div>

          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${liveCount > 0 ? 'bg-gradient-to-br from-blue-500 to-indigo-600 dark:bg-blue-500/10 border-transparent dark:border-blue-500/20 shadow-lg shadow-blue-200 dark:shadow-none' : 'bg-white dark:bg-white/[0.04] border-slate-100 dark:border-white/[0.07]'}`}>
            <div className={`p-2 rounded-lg ${liveCount > 0 ? 'bg-white/20 dark:bg-blue-500/10' : 'bg-slate-100 dark:bg-white/[0.05]'}`}>
              <Radio className={`w-4 h-4 ${liveCount > 0 ? 'text-white dark:text-blue-400' : 'text-slate-400 dark:text-slate-400'}`} />
            </div>
            <div>
              <p className={`text-xl font-bold leading-none ${liveCount > 0 ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`}>{liveCount}</p>
              <p className={`text-xs mt-0.5 ${liveCount > 0 ? 'text-blue-100 dark:text-slate-400' : 'text-slate-400 dark:text-slate-400'}`}>{t('dashboard.stats.liveNow')}</p>
            </div>
          </div>

          {(() => {
            const offlineCount = devices.filter(d => !d.current_reading).length;
            return offlineCount > 0 ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-amber-400 to-orange-500 dark:bg-amber-500/10 dark:border dark:border-amber-500/20 rounded-xl shadow-lg shadow-amber-200 dark:shadow-none">
                <div className="p-2 bg-white/20 dark:bg-amber-500/10 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-white dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white leading-none">{offlineCount}</p>
                  <p className="text-xs text-amber-100 dark:text-slate-400 mt-0.5">{t('dashboard.stats.noDataYet')}</p>
                </div>
              </div>
            ) : null;
          })()}
        </motion.div>
      )}

      {/* Plants grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t('dashboard.plants.title')}</h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white dark:bg-[#1E293B]/60 border-slate-100 dark:border-white/[0.07] overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-100 dark:bg-white/[0.04]" />
                <CardContent className="p-3">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1,2,3,4].map(j => <div key={j} className="h-14 bg-slate-100 dark:bg-white/[0.04] rounded-lg" />)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : devices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device, index) => (
              <motion.div key={device.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.06 }} className="h-full">
                <PlantCard device={device} index={index} isLive={liveDeviceIds.has(device.id)} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="relative rounded-2xl border-2 border-dashed border-emerald-200 dark:border-white/[0.1] bg-gradient-to-br from-emerald-50/40 to-green-50/40 dark:bg-white/[0.02] p-16 text-center overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-100/40 dark:bg-green-500/[0.04] blur-3xl" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-green-100/40 dark:bg-green-600/[0.04] blur-3xl" />
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 dark:bg-green-500/10 dark:border dark:border-green-500/20 flex items-center justify-center shadow-xl shadow-emerald-100 dark:shadow-none">
                  <Leaf className="w-10 h-10 text-emerald-500 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{t('dashboard.plants.emptyTitle')}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed text-sm">{t('dashboard.plants.emptyDescription')}</p>
                <Button onClick={() => setDialogOpen(true)} size="lg" className="bg-emerald-600 dark:bg-green-500 hover:bg-emerald-700 dark:hover:bg-green-400 text-white shadow-xl shadow-emerald-200 dark:shadow-green-500/20 gap-2 px-8 cursor-pointer">
                  <Plus className="w-5 h-5" />
                  {t('dashboard.plants.addFirst')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick Actions */}
      {devices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
            <Link to={createPageUrl('Analytics')}>
              <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:bg-[#1E293B]/60 border-emerald-100 dark:border-white/[0.07] hover:border-emerald-200 dark:hover:border-green-500/20 hover:shadow-lg transition-all cursor-pointer group overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-white/70 dark:bg-green-500/10 dark:border dark:border-green-500/20 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                          <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-800 dark:text-white">{t('dashboard.actions.analytics.title')}</h3>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{t('dashboard.actions.analytics.description')}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-emerald-300 dark:text-slate-700 group-hover:text-emerald-400 dark:group-hover:text-green-400/30 transition-colors" />
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
        onSubmit={(data) => createDeviceMutation.mutate(data)}
        isLoading={createDeviceMutation.isPending}
      />
    </div>
  );
}