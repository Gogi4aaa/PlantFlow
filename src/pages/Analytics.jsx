import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Calendar,
  TrendingUp,
  Droplets,
  Thermometer,
  Sun,
  Wind,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data generators
const generateDailyData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  return hours.map(hour => ({
    time: hour,
    moisture: 30 + Math.random() * 50,
    temperature: 18 + Math.random() * 10,
    humidity: 40 + Math.random() * 40,
    light: Math.random() > 0.3 ? 3000 + Math.random() * 12000 : 0
  }));
};

const generateWeeklyData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    avgMoisture: 40 + Math.random() * 30,
    avgTemp: 20 + Math.random() * 6,
    avgLight: 5000 + Math.random() * 5000,
    wateringEvents: Math.floor(Math.random() * 3)
  }));
};

const generateMonthlyData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    moisture: 35 + Math.random() * 40,
    temperature: 19 + Math.random() * 8
  }));
};

const plantHealthData = [
  { name: 'Excellent', value: 2, color: '#10B981' },
  { name: 'Good', value: 2, color: '#34D399' },
  { name: 'Moderate', value: 1, color: '#F59E0B' },
  { name: 'Poor', value: 1, color: '#EF4444' }
];

const waterUsageData = [
  { month: 'Jan', usage: 120 },
  { month: 'Feb', usage: 98 },
  { month: 'Mar', usage: 145 },
  { month: 'Apr', usage: 167 },
  { month: 'May', usage: 189 },
  { month: 'Jun', usage: 210 }
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('week');
  const dailyData = generateDailyData();
  const weeklyData = generateWeeklyData();
  const monthlyData = generateMonthlyData();

  const stats = [
    { label: 'Avg. Moisture', value: '58%', change: '+5%', icon: Droplets, color: 'blue' },
    { label: 'Avg. Temperature', value: '23.5°C', change: '-0.5°C', icon: Thermometer, color: 'red' },
    { label: 'Avg. Light', value: '8.2k lux', change: '+12%', icon: Sun, color: 'amber' },
    { label: 'Avg. Humidity', value: '62%', change: '+3%', icon: Wind, color: 'purple' }
  ];

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
            Analytics
          </h1>
          <p className="text-slate-500 mt-1">
            Insights and trends from your plant data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36 bg-white">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="hidden sm:flex">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <Card key={stat.label} className="border-slate-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                <Badge 
                  variant="outline" 
                  className={stat.change.startsWith('+') ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-red-600 border-red-200 bg-red-50'}
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-3">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Charts */}
      <Tabs defaultValue="environment" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="environment" className="rounded-lg">Environment</TabsTrigger>
          <TabsTrigger value="watering" className="rounded-lg">Watering</TabsTrigger>
          <TabsTrigger value="health" className="rounded-lg">Plant Health</TabsTrigger>
        </TabsList>

        {/* Environment Tab */}
        <TabsContent value="environment" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Temperature & Humidity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-slate-100">
                <CardHeader>
                  <CardTitle className="text-base">Temperature & Humidity Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyData.filter((_, i) => i % 2 === 0)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                        <XAxis dataKey="time" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="temperature" stroke="#EF4444" strokeWidth={2} dot={false} name="Temperature (°C)" />
                        <Line type="monotone" dataKey="humidity" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Humidity (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Light Intensity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-slate-100">
                <CardHeader>
                  <CardTitle className="text-base">Light Intensity (24h)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyData.filter((_, i) => i % 2 === 0)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                        <XAxis dataKey="time" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                          }}
                          formatter={(value) => [`${value.toFixed(0)} lux`, 'Light']}
                        />
                        <Bar dataKey="light" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Soil Moisture Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-slate-100">
              <CardHeader>
                <CardTitle className="text-base">Soil Moisture (30 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <defs>
                        <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value) => [`${value.toFixed(1)}%`, 'Moisture']}
                      />
                      <Line type="monotone" dataKey="moisture" stroke="#3B82F6" strokeWidth={2} dot={false} fill="url(#moistureGradient)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Watering Tab */}
        <TabsContent value="watering" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-slate-100">
              <CardHeader>
                <CardTitle className="text-base">Weekly Watering Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="wateringEvents" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Watering Events" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-100">
              <CardHeader>
                <CardTitle className="text-base">Monthly Water Usage (ml)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={waterUsageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="usage" fill="#06B6D4" radius={[4, 4, 0, 0]} name="Water (ml)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-slate-100">
              <CardHeader>
                <CardTitle className="text-base">Plant Health Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={plantHealthData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {plantHealthData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-100">
              <CardHeader>
                <CardTitle className="text-base">Health Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="font-medium text-emerald-700">Top Performer</span>
                  </div>
                  <p className="text-sm text-slate-600">Monstera has maintained excellent health for 30+ days</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="font-medium text-amber-700">Needs Attention</span>
                  </div>
                  <p className="text-sm text-slate-600">Peace Lily soil moisture has been below optimal for 2 days</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="font-medium text-blue-700">Recommendation</span>
                  </div>
                  <p className="text-sm text-slate-600">Consider moving Snake Plant closer to window for better growth</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}