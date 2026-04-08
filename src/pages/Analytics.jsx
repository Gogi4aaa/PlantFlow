import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
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
  RefreshCw,
  Loader2,
  ArrowLeft,
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
import { useToast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to export data as CSV
const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header] ?? '').join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

// Format timestamp for display
const formatTimestamp = (timestamp, period) => {
  const date = new Date(timestamp);
  switch (period) {
    case 'day':
      return format(date, 'HH:mm');
    case 'week':
      return format(date, 'EEE HH:mm');
    case 'month':
      return format(date, 'MMM d');
    case 'year':
      return format(date, 'MMM yyyy');
    default:
      return format(date, 'MMM d HH:mm');
  }
};

export default function Analytics() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/analytics?period=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('plantpulse_user');
        window.location.href = '/signin';
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      setAnalyticsData(result.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
      toast({
        title: t('common.error'),
        description: t('analytics.fetchError'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const handleExport = () => {
    if (!analyticsData?.chartData) return;

    const exportData = analyticsData.chartData.map(item => ({
      timestamp: item.timestamp,
      temperature: item.temperature?.toFixed(2) || '',
      humidity: item.humidity?.toFixed(2) || '',
      moisture: item.moisture?.toFixed(2) || '',
      light: item.light?.toFixed(2) || ''
    }));

    const filename = `plantflow-analytics-${timeRange}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    exportToCSV(exportData, filename);

    toast({
      title: t('analytics.exportSuccess'),
      description: t('analytics.exportSuccessDesc')
    });
  };

  const stats = analyticsData?.stats ? [
    {
      label: t('analytics.avgMoisture'),
      value: `${analyticsData.stats.avgMoisture?.toFixed(1) || 0}%`,
      min: `${analyticsData.stats.minMoisture?.toFixed(1) || 0}%`,
      max: `${analyticsData.stats.maxMoisture?.toFixed(1) || 0}%`,
      icon: Droplets,
      color: 'blue'
    },
    {
      label: t('analytics.avgTemperature'),
      value: `${analyticsData.stats.avgTemperature?.toFixed(1) || 0}°C`,
      min: `${analyticsData.stats.minTemperature?.toFixed(1) || 0}°C`,
      max: `${analyticsData.stats.maxTemperature?.toFixed(1) || 0}°C`,
      icon: Thermometer,
      color: 'red'
    },
    {
      label: t('analytics.avgLight'),
      value: `${(analyticsData.stats.avgLight || 0).toFixed(0)} lux`,
      min: `${(analyticsData.stats.minLight || 0).toFixed(0)} lux`,
      max: `${(analyticsData.stats.maxLight || 0).toFixed(0)} lux`,
      icon: Sun,
      color: 'amber'
    },
    {
      label: t('analytics.avgHumidity'),
      value: `${analyticsData.stats.avgHumidity?.toFixed(1) || 0}%`,
      min: `${analyticsData.stats.minHumidity?.toFixed(1) || 0}%`,
      max: `${analyticsData.stats.maxHumidity?.toFixed(1) || 0}%`,
      icon: Wind,
      color: 'purple'
    }
  ] : [];

  const chartData = analyticsData?.chartData?.map(item => ({
    time: formatTimestamp(item.timestamp, timeRange),
    temperature: item.temperature,
    humidity: item.humidity,
    moisture: item.moisture,
    light: item.light
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{t('analytics.error')}</p>
          <Button onClick={fetchAnalytics}>{t('analytics.retry')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-600 transition-colors mb-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
            {t('analytics.title')}
          </h1>
          <p className="text-slate-500 mt-1">
            {t('analytics.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36 bg-white">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">{t('analytics.periods.today')}</SelectItem>
              <SelectItem value="week">{t('analytics.periods.thisWeek')}</SelectItem>
              <SelectItem value="month">{t('analytics.periods.thisMonth')}</SelectItem>
              <SelectItem value="year">{t('analytics.periods.thisYear')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" className="hidden sm:flex" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            {t('analytics.export')}
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
                <div className="text-xs text-slate-400">
                  {stat.min} - {stat.max}
                </div>
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
          <TabsTrigger value="environment" className="rounded-lg">{t('analytics.tabs.environment')}</TabsTrigger>
          <TabsTrigger value="moisture" className="rounded-lg">{t('analytics.tabs.moisture')}</TabsTrigger>
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
                  <CardTitle className="text-base">{t('analytics.charts.tempHumidity')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
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
                        <Line type="monotone" dataKey="temperature" stroke="#EF4444" strokeWidth={2} dot={false} name={t('common.metrics.temperature') + ' (°C)'} />
                        <Line type="monotone" dataKey="humidity" stroke="#8B5CF6" strokeWidth={2} dot={false} name={t('common.metrics.humidity') + ' (%)'} />
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
                  <CardTitle className="text-base">{t('analytics.charts.light')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="lightGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                          </linearGradient>
                        </defs>
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
                          formatter={(value) => [`${value?.toFixed(0) || 0} lux`, t('common.metrics.light')]}
                        />
                        <Area type="monotone" dataKey="light" stroke="#F59E0B" strokeWidth={2} fill="url(#lightGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

        </TabsContent>

        {/* Moisture Tab */}
        <TabsContent value="moisture" className="mt-6">
          <Card className="border-slate-100">
            <CardHeader>
              <CardTitle className="text-base">{t('analytics.charts.moisture')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="time" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value) => [`${value?.toFixed(1) || 0}%`, t('common.metrics.moisture')]}
                    />
                    <Area type="monotone" dataKey="moisture" stroke="#3B82F6" strokeWidth={2} fill="url(#moistureGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}