import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Cpu,
  Wifi,
  Battery,
  HardDrive,
  Thermometer,
  RefreshCw,
  Download,
  Upload,
  Bell,
  Moon,
  Sun,
  Smartphone,
  Globe,
  Shield,
  Trash2,
  ChevronRight,
  Check,
  Info,
  AlertTriangle,
  Plus,
  Droplets,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import DeviceCard from '@/components/devices/DeviceCard';
import AddDeviceDialog from '@/components/devices/AddDeviceDialog';

// Mock device information
const deviceInfo = {
  name: 'PlantPulse Hub v2',
  serialNumber: 'PP-2024-A7B3C9D2',
  firmwareVersion: '2.4.1',
  lastUpdate: '2024-01-20',
  uptime: '15 days, 7 hours',
  ipAddress: '192.168.1.105',
  macAddress: 'A4:CF:12:E5:8B:3C'
};

const sensorStatus = [
  { name: 'Temperature Sensor', status: 'online', lastReading: '2s ago', battery: 92 },
  { name: 'Humidity Sensor', status: 'online', lastReading: '2s ago', battery: 88 },
  { name: 'Soil Moisture Sensor', status: 'online', lastReading: '5s ago', battery: 76 },
  { name: 'Light Sensor', status: 'online', lastReading: '2s ago', battery: 95 },
  { name: 'Water Pump', status: 'standby', lastReading: '1h ago', battery: null }
];

export default function Settings() {
  const [user, setUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDevice, setEditDevice] = useState(null);
  const queryClient = useQueryClient();

  const [notifications, setNotifications] = useState({
    lowMoisture: true,
    highTemperature: true,
    pumpActivation: true,
    dailyReport: false,
    systemAlerts: true
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    autoWatering: true,
    temperatureUnit: 'celsius',
    language: 'english'
  });

  // Fetch current user
  useEffect(() => {
    const userStr = localStorage.getItem('plantpulse_user');
    if (userStr) {
      const currentUser = JSON.parse(userStr);
      setUser(currentUser);
    }
  }, []);

  // Fetch user's devices
  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ['devices', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const allDevices = await base44.entities.Device.list();
      // Filter devices by created_by to show only current user's devices
      return allDevices.filter(device => device.created_by === user.email);
    },
    enabled: !!user?.id
  });

  // Add/Update device mutation
  const saveDeviceMutation = useMutation({
    mutationFn: async (deviceData) => {
      const dataToSave = {
        ...deviceData,
        last_seen: new Date().toISOString(),
        ip_address: '192.168.1.' + Math.floor(Math.random() * 255),
        mac_address: 'A4:CF:12:' + Array(3).fill(0).map(() => 
          Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
        ).join(':')
      };

      if (editDevice) {
        return await base44.entities.Device.update(editDevice.id, dataToSave);
      } else {
        return await base44.entities.Device.create(dataToSave);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      setDialogOpen(false);
      setEditDevice(null);
      toast.success(editDevice ? 'Device updated successfully' : 'Device added successfully');
    },
    onError: (error) => {
      toast.error('Failed to save device: ' + error.message);
    }
  });

  // Delete device mutation
  const deleteDeviceMutation = useMutation({
    mutationFn: async (deviceId) => {
      await base44.entities.Device.delete(deviceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Device deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete device: ' + error.message);
    }
  });

  const handleAddDevice = () => {
    setEditDevice(null);
    setDialogOpen(true);
  };

  const handleEditDevice = (device) => {
    setEditDevice(device);
    setDialogOpen(true);
  };

  const handleDeleteDevice = (device) => {
    if (confirm(`Are you sure you want to delete ${device.name}?`)) {
      deleteDeviceMutation.mutate(device.id);
    }
  };

  const handleSubmitDevice = (deviceData) => {
    saveDeviceMutation.mutate(deviceData);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
          Settings
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your devices and system preferences
        </p>
      </motion.div>

      <Tabs defaultValue="devices" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <TabsTrigger value="devices" className="rounded-lg">My Devices</TabsTrigger>
          <TabsTrigger value="account" className="rounded-lg">Account</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg">Notifications</TabsTrigger>
          <TabsTrigger value="preferences" className="rounded-lg">Preferences</TabsTrigger>
        </TabsList>

        {/* My Devices Tab */}
        <TabsContent value="devices" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">My Plant Devices</h2>
              <p className="text-sm text-slate-500 mt-1">
                Each device monitors one plant with integrated sensors and pump control
              </p>
            </div>
            <Button 
              onClick={handleAddDevice}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Plant Device
            </Button>
          </div>

          {devicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-slate-100 animate-pulse">
                  <CardContent className="p-5">
                    <div className="h-32 bg-slate-100 rounded-lg" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : devices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map((device, index) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  index={index}
                  onEdit={handleEditDevice}
                  onDelete={handleDeleteDevice}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-slate-200">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <Cpu className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No Devices Connected</h3>
                <p className="text-slate-500 mb-4">
                  Start by adding your first IoT device to monitor your plants
                </p>
                <Button onClick={handleAddDevice} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Device
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="mt-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-slate-100">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                    style={{ 
                      background: user?.avatar_color 
                        ? `linear-gradient(135deg, ${user.avatar_color}, ${user.avatar_color}dd)` 
                        : 'linear-gradient(135deg, #10B981, #059669)'
                    }}
                  >
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800">{user?.full_name || 'User'}</h3>
                    <p className="text-slate-500">{user?.email || ''}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={user?.full_name || ''} disabled className="bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input value={user?.email || ''} disabled className="bg-slate-50" />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div>
                      <p className="font-medium text-slate-700">Account Status</p>
                      <p className="text-sm text-emerald-600">Active</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-0">
                      Verified
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>



        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <Card className="border-slate-100">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose what alerts you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'lowMoisture', label: 'Low Moisture Alerts', desc: 'When soil moisture drops below threshold', icon: AlertTriangle, color: 'amber' },
                { key: 'highTemperature', label: 'Temperature Alerts', desc: 'When temperature exceeds safe range', icon: Thermometer, color: 'red' },
                { key: 'pumpActivation', label: 'Pump Notifications', desc: 'When auto-watering is triggered', icon: Droplets, color: 'blue' },
                { key: 'dailyReport', label: 'Daily Summary', desc: 'Receive daily plant health report', icon: HardDrive, color: 'purple' },
                { key: 'systemAlerts', label: 'System Alerts', desc: 'Device connectivity and updates', icon: Shield, color: 'slate' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 bg-${item.color}-100 rounded-lg`}>
                      <item.icon className={`w-4 h-4 text-${item.color}-600`} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications[item.key]}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="mt-6 space-y-6">
          <Card className="border-slate-100">
            <CardHeader>
              <CardTitle className="text-base">Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Moon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">Dark Mode</p>
                    <p className="text-sm text-slate-500">Use dark theme</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, darkMode: checked })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Temperature Unit</Label>
                  <Select 
                    value={preferences.temperatureUnit}
                    onValueChange={(value) => setPreferences({ ...preferences, temperatureUnit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="celsius">Celsius (°C)</SelectItem>
                      <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select 
                    value={preferences.language}
                    onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Español</SelectItem>
                      <SelectItem value="french">Français</SelectItem>
                      <SelectItem value="german">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100">
            <CardHeader>
              <CardTitle className="text-base">Automation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Droplets className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">Auto Watering</p>
                    <p className="text-sm text-slate-500">Automatically water plants when moisture is low</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.autoWatering}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, autoWatering: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-100 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-base text-red-700">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700">Reset All Data</p>
                  <p className="text-sm text-slate-500">Clear all plant data and settings</p>
                </div>
                <Button variant="destructive" size="sm" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Device Dialog */}
      <AddDeviceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmitDevice}
        isLoading={saveDeviceMutation.isPending}
        editDevice={editDevice}
      />
    </div>
  );
}