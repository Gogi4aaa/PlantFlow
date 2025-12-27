import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Droplets,
  Sun,
  Thermometer,
  Wind,
  Heart,
  Calendar,
  Clock,
  TrendingUp,
  Settings,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { createPageUrl } from '@/utils';
import AreaChartComponent from '@/components/charts/AreaChartComponent';
import PumpControl from '@/components/ui/PumpControl';
import { cn } from '@/lib/utils';

// Mock plant data
const mockPlantDetails = {
  id: 1,
  name: 'Monstera Deliciosa',
  species: 'Swiss Cheese Plant',
  image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&h=600&fit=crop',
  health: 'excellent',
  description: 'A tropical plant known for its unique leaf holes and easy care requirements. Thrives in indirect light with regular watering.',
  location: 'Living Room - Window Side',
  addedDate: '2024-01-15',
  currentReadings: {
    moisture: 72,
    temperature: 24.5,
    humidity: 65,
    light: 8500
  },
  optimalRanges: {
    moisture: { min: 40, max: 80 },
    temperature: { min: 18, max: 30 },
    humidity: { min: 50, max: 80 },
    light: { min: 5000, max: 15000 }
  },
  careSchedule: {
    lastWatered: '2 hours ago',
    nextWatering: 'In 22 hours',
    lastFertilized: '2 weeks ago',
    nextFertilizing: 'In 2 weeks'
  },
  alerts: {
    lowMoisture: true,
    autoWatering: true,
    lightReminder: false
  }
};

// Generate mock history data
const generateHistoryData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    time: day,
    moisture: 40 + Math.random() * 40,
    temperature: 20 + Math.random() * 8,
    humidity: 50 + Math.random() * 30,
    light: 5000 + Math.random() * 10000
  }));
};

export default function PlantDetails() {
  const [pumpOn, setPumpOn] = useState(false);
  const [alerts, setAlerts] = useState(mockPlantDetails.alerts);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const deviceId = queryParams.get('id');

  // Fetch device data
  const { data: device, isLoading } = useQuery({
    queryKey: ['device', deviceId],
    queryFn: async () => {
      if (!deviceId) return null;
      const devices = await base44.entities.Device.list();
      return devices.find(d => d.id === deviceId);
    },
    enabled: !!deviceId
  });

  // Use device data if available, otherwise fallback to mock
  const plant = device ? {
    id: device.id,
    name: device.plant_name || 'Unnamed Plant',
    species: device.plant_species || 'Unknown Species',
    image: device.plant_image || mockPlantDetails.image,
    health: device.health_status || 'good',
    description: mockPlantDetails.description,
    location: device.location || 'Not specified',
    addedDate: new Date(device.created_date).toLocaleDateString(),
    currentReadings: {
      moisture: device.soil_moisture || 0,
      temperature: device.air_temperature || 0,
      humidity: device.air_humidity || 0,
      light: device.light_intensity || 0
    },
    optimalRanges: mockPlantDetails.optimalRanges,
    careSchedule: {
      lastWatered: device.last_watered ? new Date(device.last_watered).toLocaleString() : 'Never',
      nextWatering: 'In 22 hours',
      lastFertilized: '2 weeks ago',
      nextFertilizing: 'In 2 weeks'
    },
    alerts: mockPlantDetails.alerts
  } : mockPlantDetails;

  useEffect(() => {
    if (device) {
      setPumpOn(device.pump_status === 'on');
    }
  }, [device]);

  const historyData = generateHistoryData();

  const getStatusColor = (value, range) => {
    if (value >= range.min && value <= range.max) return 'text-emerald-600';
    if (value < range.min * 0.8 || value > range.max * 1.2) return 'text-red-600';
    return 'text-amber-600';
  };

  const getProgressColor = (value, range) => {
    if (value >= range.min && value <= range.max) return 'bg-emerald-500';
    if (value < range.min * 0.8 || value > range.max * 1.2) return 'bg-red-500';
    return 'bg-amber-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-emerald-100 flex items-center justify-center animate-pulse">
            <Droplets className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-slate-600">Loading plant details...</p>
        </div>
      </div>
    );
  }

  if (!device && deviceId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Plant device not found</p>
          <Link to={createPageUrl('Plants')}>
            <Button>Back to Plants</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <Link to={createPageUrl('Plants')}>
        <Button variant="ghost" className="gap-2 text-slate-600 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4" />
          Back to Plants
        </Button>
      </Link>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Plant Image */}
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-square">
          <img
            src={plant.image}
            alt={plant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <Badge className="absolute top-4 right-4 bg-emerald-500 text-white border-0">
            <Heart className="w-3 h-3 mr-1" />
            {plant.health}
          </Badge>
        </div>

        {/* Plant Info */}
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight">
              {plant.name}
            </h1>
            <p className="text-lg text-slate-500 mt-1">{plant.species}</p>
          </div>

          <p className="text-slate-600 leading-relaxed">
            {plant.description}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Added</p>
                <p className="text-sm font-medium text-slate-700">{plant.addedDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Last Watered</p>
                <p className="text-sm font-medium text-slate-700">{plant.careSchedule.lastWatered}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <Droplets className="w-5 h-5 mx-auto text-blue-600 mb-1" />
              <p className={cn('text-lg font-bold', getStatusColor(plant.currentReadings.moisture, plant.optimalRanges.moisture))}>
                {plant.currentReadings.moisture}%
              </p>
              <p className="text-xs text-slate-500">Moisture</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-xl">
              <Thermometer className="w-5 h-5 mx-auto text-red-500 mb-1" />
              <p className={cn('text-lg font-bold', getStatusColor(plant.currentReadings.temperature, plant.optimalRanges.temperature))}>
                {plant.currentReadings.temperature}°
              </p>
              <p className="text-xs text-slate-500">Temp</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <Wind className="w-5 h-5 mx-auto text-purple-500 mb-1" />
              <p className={cn('text-lg font-bold', getStatusColor(plant.currentReadings.humidity, plant.optimalRanges.humidity))}>
                {plant.currentReadings.humidity}%
              </p>
              <p className="text-xs text-slate-500">Humidity</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-xl">
              <Sun className="w-5 h-5 mx-auto text-amber-500 mb-1" />
              <p className={cn('text-lg font-bold', getStatusColor(plant.currentReadings.light, plant.optimalRanges.light))}>
                {(plant.currentReadings.light / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-slate-500">Light</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs Section */}
      <Tabs defaultValue="readings" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="readings" className="rounded-lg">Live Readings</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg">History</TabsTrigger>
          <TabsTrigger value="care" className="rounded-lg">Care Schedule</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg">Settings</TabsTrigger>
        </TabsList>

        {/* Live Readings Tab */}
        <TabsContent value="readings" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'moisture', label: 'Soil Moisture', icon: Droplets, color: 'blue', unit: '%' },
              { key: 'temperature', label: 'Temperature', icon: Thermometer, color: 'red', unit: '°C' },
              { key: 'humidity', label: 'Air Humidity', icon: Wind, color: 'purple', unit: '%' },
              { key: 'light', label: 'Light Intensity', icon: Sun, color: 'amber', unit: ' lux' }
            ].map((sensor) => (
              <Card key={sensor.key} className="border-slate-100">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-${sensor.color}-100 rounded-lg`}>
                        <sensor.icon className={`w-5 h-5 text-${sensor.color}-600`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700">{sensor.label}</p>
                        <p className="text-xs text-slate-400">
                          Optimal: {plant.optimalRanges[sensor.key].min}-{plant.optimalRanges[sensor.key].max}{sensor.unit}
                        </p>
                      </div>
                    </div>
                    <p className={cn(
                      'text-2xl font-bold',
                      getStatusColor(plant.currentReadings[sensor.key], plant.optimalRanges[sensor.key])
                    )}>
                      {plant.currentReadings[sensor.key]}{sensor.unit}
                    </p>
                  </div>
                  <Progress
                    value={(plant.currentReadings[sensor.key] / plant.optimalRanges[sensor.key].max) * 100}
                    className="h-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pump Control */}
          <PumpControl
            isOn={pumpOn}
            onToggle={() => setPumpOn(!pumpOn)}
            lastActivated={plant.careSchedule.lastWatered}
          />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-slate-100">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  Moisture History (7 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AreaChartComponent
                  data={historyData}
                  dataKey="moisture"
                  color="#3B82F6"
                  gradientId="moistureHistory"
                  title="Moisture"
                  unit="%"
                />
              </CardContent>
            </Card>
            <Card className="border-slate-100">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  Temperature History (7 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AreaChartComponent
                  data={historyData}
                  dataKey="temperature"
                  color="#EF4444"
                  gradientId="tempHistory"
                  title="Temperature"
                  unit="°C"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Care Schedule Tab */}
        <TabsContent value="care" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-100">
              <CardHeader>
                <CardTitle className="text-base">Watering Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-700">Last Watered</p>
                      <p className="text-sm text-slate-500">{plant.careSchedule.lastWatered}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-medium text-slate-700">Next Watering</p>
                      <p className="text-sm text-slate-500">{plant.careSchedule.nextWatering}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-100">
              <CardHeader>
                <CardTitle className="text-base">Fertilizing Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-slate-700">Last Fertilized</p>
                      <p className="text-sm text-slate-500">{plant.careSchedule.lastFertilized}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-slate-700">Next Fertilizing</p>
                      <p className="text-sm text-slate-500">{plant.careSchedule.nextFertilizing}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Card className="border-slate-100">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Alert Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'lowMoisture', label: 'Low Moisture Alert', desc: 'Get notified when soil moisture drops below optimal range' },
                { key: 'autoWatering', label: 'Auto Watering', desc: 'Automatically activate pump when moisture is low' },
                { key: 'lightReminder', label: 'Light Reminder', desc: 'Remind to move plant for better light exposure' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-700">{setting.label}</p>
                    <p className="text-sm text-slate-500">{setting.desc}</p>
                  </div>
                  <Switch
                    checked={alerts[setting.key]}
                    onCheckedChange={(checked) => setAlerts({ ...alerts, [setting.key]: checked })}
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