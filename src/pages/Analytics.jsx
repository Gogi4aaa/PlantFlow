import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
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
import { toast } from 'sonner';

const API_URL = (import.meta.env.VITE_API_BASE_URL || 'https://plantflow-backend-1026018297722.europe-west3.run.app') + '/api';

// Helper to export analytics as a print-ready HTML document
const exportToPrint = (analyticsData, stats, chartData, timeRange, t) => {
  if (!analyticsData) return;

  const periodLabels = { day: 'Today', week: 'This Week', month: 'This Month', year: 'This Year' };
  const period = periodLabels[timeRange] || timeRange;
  const exportDate = format(new Date(), 'MMMM d, yyyy – HH:mm');

  const statRows = stats.map(s => `
    <tr>
      <td>${s.label}</td>
      <td style="text-align:center;font-weight:600">${s.value}</td>
      <td style="text-align:center">${s.min}</td>
      <td style="text-align:center">${s.max}</td>
    </tr>`).join('');

  const dataRows = chartData.slice(0, 500).map(row => `
    <tr>
      <td>${row.time}</td>
      <td style="text-align:center">${row.temperature?.toFixed(1) ?? '—'} °C</td>
      <td style="text-align:center">${row.humidity?.toFixed(1) ?? '—'} %</td>
      <td style="text-align:center">${row.moisture?.toFixed(1) ?? '—'} %</td>
      <td style="text-align:center">${row.light?.toFixed(0) ?? '—'} lux</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>PlantFlow Analytics – ${period}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; padding: 40px; }
    .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 20px; border-bottom: 2px solid #10b981; margin-bottom: 28px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .logo { width: 40px; height: 40px; background: linear-gradient(135deg,#10b981,#059669); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .logo svg { width: 22px; height: 22px; fill: none; stroke: white; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .brand-name { font-size: 22px; font-weight: 800; color: #059669; }
    .meta { text-align: right; font-size: 12px; color: #64748b; line-height: 1.6; }
    .meta strong { font-size: 14px; color: #1e293b; }
    h2 { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 12px; padding-left: 10px; border-left: 3px solid #10b981; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 32px; }
    th { background: #f0fdf4; color: #065f46; font-weight: 700; padding: 10px 14px; text-align: left; border-bottom: 2px solid #d1fae5; }
    td { padding: 9px 14px; border-bottom: 1px solid #f1f5f9; }
    tr:hover td { background: #f8fafc; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="logo">
        <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"/><path d="M12 6v6l4 2"/></svg>
      </div>
      <div>
        <div class="brand-name">PlantFlow</div>
        <div style="font-size:11px;color:#64748b">Sensor Analytics Report</div>
      </div>
    </div>
    <div class="meta">
      <strong>${period}</strong><br>
      Exported: ${exportDate}<br>
      Records: ${chartData.length}
    </div>
  </div>

  <h2>Summary Statistics</h2>
  <table>
    <thead><tr><th>Metric</th><th style="text-align:center">Average</th><th style="text-align:center">Min</th><th style="text-align:center">Max</th></tr></thead>
    <tbody>${statRows}</tbody>
  </table>

  <h2>Measurement Data</h2>
  <table>
    <thead><tr><th>Time</th><th style="text-align:center">Temperature</th><th style="text-align:center">Humidity</th><th style="text-align:center">Moisture</th><th style="text-align:center">Light</th></tr></thead>
    <tbody>${dataRows}</tbody>
  </table>

  <div class="footer">Generated by PlantFlow · plantflow.brandmotiondigital.com · ${exportDate}</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
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
  usePageTitle('pageTitles.analytics');
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
      toast.error(t('analytics.fetchError') || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const handleExport = () => {
    if (!analyticsData) return;
    exportToPrint(analyticsData, stats, chartData, timeRange, t);
    toast.success(t('analytics.exportSuccess') || 'Report opened for printing');
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
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-green-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{t('analytics.error')}</p>
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
            className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-green-400 transition-colors mb-2 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
            {t('analytics.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t('analytics.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36 bg-white dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-200">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#1E293B] border-slate-100 dark:border-white/[0.08] text-slate-800 dark:text-slate-200">
              <SelectItem value="day">{t('analytics.periods.today')}</SelectItem>
              <SelectItem value="week">{t('analytics.periods.thisWeek')}</SelectItem>
              <SelectItem value="month">{t('analytics.periods.thisMonth')}</SelectItem>
              <SelectItem value="year">{t('analytics.periods.thisYear')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchAnalytics} disabled={loading}
            className="border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05]">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" className="hidden sm:flex border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05]" onClick={handleExport}>
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
          <Card key={stat.label} className="bg-white dark:bg-[#1E293B]/60 border-slate-100 dark:border-white/[0.07]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <stat.icon className={`w-5 h-5 text-${stat.color}-500 dark:text-${stat.color}-400`} />
                <div className="text-xs text-slate-400 dark:text-slate-400">
                  {stat.min} - {stat.max}
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-3">{stat.value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Charts */}
      <Tabs defaultValue="environment" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-white/[0.05] p-1 rounded-xl border-0">
          <TabsTrigger value="environment" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-white/[0.08] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-slate-600 dark:text-slate-400">
            {t('analytics.tabs.environment')}
          </TabsTrigger>
          <TabsTrigger value="moisture" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-white/[0.08] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-slate-600 dark:text-slate-400">
            {t('analytics.tabs.moisture')}
          </TabsTrigger>
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
              <Card className="bg-white dark:bg-[#1E293B]/60 border-slate-100 dark:border-white/[0.07]">
                <CardHeader>
                  <CardTitle className="text-base text-slate-800 dark:text-white">{t('analytics.charts.tempHumidity')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                        <XAxis dataKey="time" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--tooltip-bg, #1E293B)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                            color: '#E2E8F0',
                          }}
                        />
                        <Legend wrapperStyle={{ color: '#94A3B8' }} />
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
              <Card className="bg-white dark:bg-[#1E293B]/60 border-slate-100 dark:border-white/[0.07]">
                <CardHeader>
                  <CardTitle className="text-base text-slate-800 dark:text-white">{t('analytics.charts.light')}</CardTitle>
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
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                        <XAxis dataKey="time" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--tooltip-bg, #1E293B)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                            color: '#E2E8F0',
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
          <Card className="bg-white dark:bg-[#1E293B]/60 border-slate-100 dark:border-white/[0.07]">
            <CardHeader>
              <CardTitle className="text-base text-slate-800 dark:text-white">{t('analytics.charts.moisture')}</CardTitle>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                    <XAxis dataKey="time" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg, #1E293B)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                        color: '#E2E8F0',
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
