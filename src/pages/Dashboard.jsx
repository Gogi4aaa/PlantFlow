import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
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
  Sun
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import AddDeviceDialog from '@/components/devices/AddDeviceDialog';
import { api } from '@/api/api';

export default function Dashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch devices
  const { data: devicesResponse, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: api.devices.list
  });

  const devices = devicesResponse?.data || [];
  const stats = { totalPlants: devices.length };

  // Create device mutation
  const createDeviceMutation = useMutation({
    mutationFn: (data) => {
      // Map form data to API payload
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
      setDialogOpen(false);
      toast.success('Устройство добавено успешно! 🌱');
    },
    onError: (error) => {
      toast.error('Неуспешно добавяне на устройство: ' + error.message);
    }
  });

  const handleSubmitDevice = (deviceData) => {
    createDeviceMutation.mutate(deviceData);
  };

  // Helper to get reading status color
  const getStatusColor = (value, type) => {
    // Simple thresholds for demo
    if (!value) return 'text-slate-400';
    return 'text-emerald-600';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
            Моята градина
          </h1>
          <p className="text-slate-500 mt-1">
            Преглед на вашите свързани растения
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добави растение
        </Button>
      </motion.div>

      {/* Quick Stats */}
      {devices.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-emerald-100 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl">
                  <Leaf className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-800">{stats.totalPlants}</p>
                  <p className="text-slate-600">Растения във вашата градина</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* My Plants Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Моите растения</h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-emerald-100 animate-pulse">
                <CardContent className="p-5">
                  <div className="h-40 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg" />
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
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Link to={createPageUrl('plant-details') + `/${device.id}`}>
                  <Card className="border-emerald-100 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 cursor-pointer group overflow-hidden h-full">
                    <div className="relative h-48 overflow-hidden">
                      <div
                        className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                        style={{
                          backgroundImage: device.plant_image
                            ? `url(${device.plant_image})`
                            : 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
                        }}
                      >
                        {!device.plant_image && (
                          <div className="w-full h-full flex items-center justify-center">
                            <Leaf className="w-20 h-20 text-emerald-500 opacity-40" />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Status Overlay */}
                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <h3 className="font-bold text-xl mb-1 shadow-sm">
                          {device.plant_name || 'Неименувано растение'}
                        </h3>
                        <p className="text-sm opacity-90 shadow-sm flex items-center gap-1">
                          {device.location && <span>📍 {device.location}</span>}
                        </p>
                      </div>
                    </div>

                    <CardContent className="p-5">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Статус на живо</h4>

                      {device.current_reading ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-blue-500" />
                            <span className="text-slate-700 font-medium">{device.current_reading.soil_moisture}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Thermometer className="w-4 h-4 text-red-500" />
                            <span className="text-slate-700 font-medium">{device.current_reading.temperature}°C</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Wind className="w-4 h-4 text-purple-500" />
                            <span className="text-slate-700 font-medium">{device.current_reading.air_humidity}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Sun className="w-4 h-4 text-amber-500" />
                            <span className="text-slate-700 font-medium">{(device.current_reading.light / 1000).toFixed(1)}k</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2 text-slate-400 text-sm bg-slate-50 rounded-lg">
                          Няма данни от сензора...
                        </div>
                      )}

                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                        <span>ID: {device.id}</span>
                        <span>{device.plant_species}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/30 to-green-50/30">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center shadow-lg">
                <Leaf className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Започнете вашето пътешествие</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Добавете първото си устройство, за да започнете да наблюдавате влажността на почвата, температурата, влажността и светлината в реално време
              </p>
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добави първото си растение
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Link to={createPageUrl('Analytics')}>
            <Card className="border-emerald-100 hover:shadow-lg transition-all cursor-pointer group bg-gradient-to-br from-emerald-50 to-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl group-hover:scale-110 transition-transform">
                        <BarChart3 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">Виж анализи</h3>
                    </div>
                    <p className="text-sm text-slate-600">Проследявайте тенденциите на растеж</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-emerald-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
          <Link to={createPageUrl('Settings')}>
            <Card className="border-slate-100 hover:shadow-lg transition-all cursor-pointer group bg-gradient-to-br from-slate-50 to-slate-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 bg-slate-200 rounded-xl group-hover:scale-110 transition-transform">
                        <SettingsIcon className="w-6 h-6 text-slate-700" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">Настройки</h3>
                    </div>
                    <p className="text-sm text-slate-600">Управление на устройства и предпочитания</p>
                  </div>
                  <SettingsIcon className="w-8 h-8 text-slate-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* Add Plant Dialog */}
      <AddDeviceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmitDevice}
        isLoading={createDeviceMutation.isPending}
      />
    </div>
  );
}