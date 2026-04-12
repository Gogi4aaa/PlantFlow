import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
    Calendar, Download, RefreshCw, Loader2,
    Thermometer, Droplets, Sun, Wind,
    Leaf, User, Wifi, WifiOff, BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { adminApi } from '@/api/admin';
import { useTranslation } from 'react-i18next';

const PERIOD_VALUES = ['day', 'week', 'month', 'year'];

function StatCell({ value, unit, noData = '—' }) {
    if (value == null) return <span className="text-slate-400 dark:text-slate-500 text-xs">{noData}</span>;
    return (
        <div>
            <span className="font-semibold text-slate-800 dark:text-white">
                {typeof value === 'number' ? value.toFixed(1) : value}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-0.5">{unit}</span>
            </span>
        </div>
    );
}

function exportReport(data, periodLabel) {
    if (!data?.deviceAnalytics?.length) return;
    const exportDate = format(new Date(), 'MMMM d, yyyy – HH:mm');

    const rows = data.deviceAnalytics.map(item => {
        const s = item.stats;
        return `
        <tr>
            <td>${item.device.plantName || '—'}</td>
            <td style="color:#64748b;font-size:12px">${item.device.plantSpecies || '—'}</td>
            <td>${item.user.fullName || item.user.email}</td>
            <td style="color:#64748b;font-size:12px">${item.user.email}</td>
            <td style="text-align:center">${item.device.location || '—'}</td>
            <td style="text-align:center">${s ? s.avgTemperature?.toFixed(1) + ' °C' : '—'}</td>
            <td style="text-align:center">${s ? s.avgHumidity?.toFixed(1) + ' %' : '—'}</td>
            <td style="text-align:center">${s ? s.avgMoisture?.toFixed(1) + ' %' : '—'}</td>
            <td style="text-align:center">${s ? Math.round(s.avgLight || 0) + ' lux' : '—'}</td>
            <td style="text-align:center">
                <span style="padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;
                    background:${item.device.isOnline ? '#d1fae5' : '#fee2e2'};
                    color:${item.device.isOnline ? '#065f46' : '#991b1b'}">
                    ${item.device.isOnline ? 'Online' : 'Offline'}
                </span>
            </td>
            <td style="text-align:center">${s?.count ?? 0}</td>
        </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>PlantFlow Admin Report – ${periodLabel}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; padding: 40px; }
    .header { display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 20px; border-bottom: 2px solid #10b981; margin-bottom: 28px; }
    .brand-name { font-size: 22px; font-weight: 800; color: #059669; }
    .badge { display:inline-block; padding:3px 10px; background:#d1fae5; color:#065f46; border-radius:20px; font-size:11px; font-weight:700; text-transform:uppercase; margin-left:8px; }
    .meta { text-align: right; font-size: 12px; color: #64748b; line-height: 1.8; }
    .meta strong { font-size: 14px; color: #1e293b; }
    .summary { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
    .summary-card { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:14px 16px; }
    .summary-card .val { font-size:22px; font-weight:800; color:#065f46; }
    .summary-card .lbl { font-size:12px; color:#059669; margin-top:2px; }
    h2 { font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 12px; padding-left: 10px; border-left: 3px solid #10b981; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #f0fdf4; color: #065f46; font-weight: 700; padding: 9px 12px; text-align: left; border-bottom: 2px solid #d1fae5; }
    td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    tr:nth-child(even) td { background: #fafafa; }
    .footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-name">PlantFlow <span class="badge">Admin Report</span></div>
      <div style="font-size:12px;color:#64748b;margin-top:4px">All Plants Analytics · ${periodLabel}</div>
    </div>
    <div class="meta">
      <strong>Exported: ${exportDate}</strong><br>
      Total Plants: ${data.totalDevices}<br>
      With Data: ${data.deviceAnalytics.filter(d => d.stats).length}
    </div>
  </div>

  <div class="summary">
    <div class="summary-card">
      <div class="val">${data.totalDevices}</div>
      <div class="lbl">Total Plants</div>
    </div>
    <div class="summary-card">
      <div class="val">${data.deviceAnalytics.filter(d => d.device.isOnline).length}</div>
      <div class="lbl">Online Now</div>
    </div>
    <div class="summary-card">
      <div class="val">${new Set(data.deviceAnalytics.map(d => d.user.id)).size}</div>
      <div class="lbl">Active Users</div>
    </div>
    <div class="summary-card">
      <div class="val">${data.deviceAnalytics.filter(d => d.stats?.count > 0).length}</div>
      <div class="lbl">Reporting Plants</div>
    </div>
  </div>

  <h2>Plant-by-Plant Analytics</h2>
  <table>
    <thead>
      <tr>
        <th>Plant Name</th><th>Species</th><th>Owner</th><th>Email</th>
        <th style="text-align:center">Location</th>
        <th style="text-align:center">Avg Temp</th>
        <th style="text-align:center">Avg Humidity</th>
        <th style="text-align:center">Avg Moisture</th>
        <th style="text-align:center">Avg Light</th>
        <th style="text-align:center">Status</th>
        <th style="text-align:center">Readings</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="footer">PlantFlow Admin Report · Generated ${exportDate} · plantflow.brandmotiondigital.com</div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
}

export default function AdminAnalytics() {
    const { t } = useTranslation();
    const [period, setPeriod] = useState('week');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const PERIODS = PERIOD_VALUES.map(v => ({ value: v, label: t(`admin.analytics.periods.${v}`) }));

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getAdminAnalytics(period);
            if (res.success) setData(res.data);
        } catch (err) {
            toast.error(t('analytics.fetchError') + ': ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [period]);

    const onlineCount = data?.deviceAnalytics?.filter(d => d.device.isOnline).length ?? 0;
    const uniqueUsers = data ? new Set(data.deviceAnalytics.map(d => d.user.id)).size : 0;
    const withData = data?.deviceAnalytics?.filter(d => d.stats?.count > 0).length ?? 0;

    const currentPeriodLabel = PERIODS.find(p => p.value === period)?.label || period;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-emerald-500 dark:text-green-400" />
                        {t('admin.analytics.title')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                        {t('admin.analytics.subtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-36 bg-white dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-200">
                            <Calendar className="w-4 h-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#1E293B] border-slate-100 dark:border-white/[0.08]">
                            {PERIODS.map(p => (
                                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}
                        className="border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05]">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button variant="outline" onClick={() => { exportReport(data, currentPeriodLabel); toast.success(t('admin.analytics.exportSuccess')); }}
                        disabled={!data}
                        className="border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05]">
                        <Download className="w-4 h-4 mr-2" />
                        {t('admin.analytics.exportPDF')}
                    </Button>
                </div>
            </div>

            {/* Summary cards */}
            {data && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: t('admin.analytics.summary.totalPlants'),    value: data.totalDevices, icon: Leaf,     color: 'emerald' },
                        { label: t('admin.analytics.summary.onlineNow'),      value: onlineCount,       icon: Wifi,     color: 'green' },
                        { label: t('admin.analytics.summary.activeUsers'),    value: uniqueUsers,       icon: User,     color: 'blue' },
                        { label: t('admin.analytics.summary.reportingPlants'),value: withData,          icon: BarChart3, color: 'purple' },
                    ].map(card => (
                        <Card key={card.label} className="bg-white dark:bg-[#1E293B]/60 border-slate-100 dark:border-white/[0.07]">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl bg-${card.color}-100 dark:bg-${card.color}-500/10 flex items-center justify-center flex-shrink-0`}>
                                    <card.icon className={`w-5 h-5 text-${card.color}-600 dark:text-${card.color}-400`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{card.value}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{card.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </motion.div>
            )}

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 dark:text-green-400" />
                </div>
            ) : !data?.deviceAnalytics?.length ? (
                <Card className="bg-white dark:bg-[#1E293B]/60 border-slate-100 dark:border-white/[0.07]">
                    <CardContent className="p-12 text-center text-slate-400 dark:text-slate-500">
                        {t('admin.analytics.noData')}
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-white dark:bg-[#1E293B]/60 border-slate-100 dark:border-white/[0.07] overflow-hidden">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-sm text-slate-800 dark:text-white">
                            {t('admin.analytics.table.title', { period: currentPeriodLabel })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-white/[0.06]">
                                        {[
                                            t('admin.analytics.table.plant'),
                                            t('admin.analytics.table.owner'),
                                            t('admin.analytics.table.location'),
                                            t('admin.analytics.table.avgTemp'),
                                            t('admin.analytics.table.avgHumidity'),
                                            t('admin.analytics.table.avgMoisture'),
                                            t('admin.analytics.table.avgLight'),
                                            t('admin.analytics.table.status'),
                                            t('admin.analytics.table.readings'),
                                        ].map(h => (
                                            <th key={h} className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-3 first:pl-6 last:pr-6">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.deviceAnalytics.map((item, i) => (
                                        <motion.tr
                                            key={item.device.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="border-b border-slate-50 dark:border-white/[0.04] hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                                        >
                                            {/* Plant */}
                                            <td className="px-4 py-3 pl-6">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                                        <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-green-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800 dark:text-slate-200 text-sm leading-tight">
                                                            {item.device.plantName || 'Unnamed Plant'}
                                                        </p>
                                                        {item.device.plantSpecies && (
                                                            <p className="text-xs text-slate-400 dark:text-slate-500 italic">{item.device.plantSpecies}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Owner */}
                                            <td className="px-4 py-3">
                                                <p className="text-slate-700 dark:text-slate-300 font-medium text-sm">{item.user.fullName || '—'}</p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500">{item.user.email}</p>
                                            </td>
                                            {/* Location */}
                                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-sm">
                                                {item.device.location || '—'}
                                            </td>
                                            {/* Stats */}
                                            <td className="px-4 py-3">
                                                <StatCell value={item.stats?.avgTemperature} unit="°C" />
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatCell value={item.stats?.avgHumidity} unit="%" />
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatCell value={item.stats?.avgMoisture} unit="%" />
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatCell value={item.stats?.avgLight != null ? Math.round(item.stats.avgLight) : null} unit=" lux" />
                                            </td>
                                            {/* Status */}
                                            <td className="px-4 py-3">
                                                <Badge className={item.device.isOnline
                                                    ? 'bg-emerald-100 dark:bg-green-500/10 text-emerald-700 dark:text-green-400 border-emerald-200 dark:border-green-500/20'
                                                    : 'bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/[0.08]'
                                                }>
                                                    {item.device.isOnline
                                                        ? <><Wifi className="w-3 h-3 mr-1" />{t('admin.analytics.status.online')}</>
                                                        : <><WifiOff className="w-3 h-3 mr-1" />{t('admin.analytics.status.offline')}</>
                                                    }
                                                </Badge>
                                            </td>
                                            {/* Readings */}
                                            <td className="px-4 py-3 pr-6 text-slate-500 dark:text-slate-400 text-sm">
                                                {item.stats?.count ?? 0}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
