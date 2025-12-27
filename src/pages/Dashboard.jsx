import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Leaf,
  Plus,
  BarChart3,
  Settings as SettingsIcon,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import AddDeviceDialog from '@/components/devices/AddDeviceDialog';

// Mock sensor data
const mockSensorData = {
  temperature: { value: 24.5, unit: '°C', status: 'normal', trend: 2.3 },
  airHumidity: { value: 65, unit: '%', status: 'normal', trend: -1.5 },
  soilMoisture: { value: 42, unit: '%', status: 'warning', trend: -5.2 },
  light: { value: 12500, unit: 'lux', status: 'normal', trend: 8.1 }
};

// Mock chart data
const generateChartData = () => {
  const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
  return hours.map(time => ({
    time,
    temperature: 20 + Math.random() * 8,
    humidity: 50 + Math.random() * 30,
    moisture: 30 + Math.random() * 40,
    light: 5000 + Math.random() * 15000
  }));
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingDevice, setIsAddingDevice] = useState(false);

  useEffect(() => {
    // const userStr = localStorage.getItem('plantpulse_user');
    // if (userStr) {
    //   setUser(JSON.parse(userStr));
    // }
  }, []);

  // Fetch user's devices
  useEffect(() => {
    const fetchDevices = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const allDevices = await base44.entities.Device.list();
        const userDevices = allDevices.filter(device => device.created_by === user.email);
        setDevices(userDevices);
      } catch (error) {
        console.error('Failed to fetch devices:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDevices();
  }, [user?.id, user?.email]);

  const handleSubmitDevice = async (deviceData) => {
    setIsAddingDevice(true);
    try {
      const newDevice = await base44.entities.Device.create({
        ...deviceData,
        last_reading: new Date().toISOString()
      });
      setDevices(prev => [...prev, newDevice]);
      setDialogOpen(false);
      toast.success('Plant device added successfully! 🌱');
    } catch (error) {
      toast.error('Failed to add device: ' + error.message);
    } finally {
      setIsAddingDevice(false);
    }
  };

  // Calculate stats
  const stats = {
    totalPlants: devices.length
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
            Welcome back, {user?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-slate-500 mt-1">
            Here's what's happening with your plants today
          </p>
        </div>
        <Button 
          onClick={() => setDialogOpen(true)}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Plant Device
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
                  <p className="text-slate-600">Plants in Your Garden</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* My Plants Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">My Plants</h2>
          <Button 
            onClick={() => setDialogOpen(true)}
            variant="ghost" 
            size="sm"
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Plant
          </Button>
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
            {devices.slice(0, 6).map((device, index) => (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Link to={createPageUrl('PlantDetails') + `?id=${device.id}`}>
                  <Card className="border-emerald-100 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 cursor-pointer group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-green-50/0 group-hover:from-emerald-50/40 group-hover:to-green-50/20 transition-all duration-300" />
                    
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </div>
                    
                    <CardContent className="p-5 relative">
                      <h3 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors text-xl mb-1">
                        {device.plant_name || 'Unnamed Plant'}
                      </h3>
                      <p className="text-sm text-slate-500 mb-3">
                        {device.plant_species || 'Unknown Species'}
                      </p>
                      {device.location && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <span className="text-base">📍</span>
                          <span className="text-sm">{device.location}</span>
                        </div>
                      )}
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
              <h3 className="text-xl font-bold text-slate-800 mb-2">Start Your Plant Journey</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Add your first plant device to begin monitoring soil moisture, temperature, humidity, and light in real-time
              </p>
              <Button 
                onClick={() => setDialogOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Plant
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
                      <h3 className="text-lg font-semibold text-slate-800">View Analytics</h3>
                    </div>
                    <p className="text-sm text-slate-600">Track growth trends and patterns</p>
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
                      <h3 className="text-lg font-semibold text-slate-800">Settings</h3>
                    </div>
                    <p className="text-sm text-slate-600">Manage devices and preferences</p>
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
        isLoading={isAddingDevice}
      />
    </div>
  );
}