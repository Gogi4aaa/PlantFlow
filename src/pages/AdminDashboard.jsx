import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Leaf, AlertTriangle, Activity, ArrowRight, Shield, Zap, CheckCircle2, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { adminApi } from '@/api/admin';
import { useSocket } from '@/hooks/useSocket';

function StatCard({ title, value, icon: Icon, color, subtitle, isLoading, delay = 0 }) {
    const colors = {
        blue:    { border: 'border-blue-100 dark:border-blue-500/20',    iconBg: 'bg-blue-100 dark:bg-blue-500/10',    icon: 'text-blue-500 dark:text-blue-400',    text: 'text-blue-600 dark:text-blue-400' },
        emerald: { border: 'border-emerald-100 dark:border-green-500/20', iconBg: 'bg-emerald-100 dark:bg-green-500/10', icon: 'text-emerald-600 dark:text-green-400', text: 'text-emerald-600 dark:text-green-400' },
        amber:   { border: 'border-amber-100 dark:border-amber-500/20',   iconBg: 'bg-amber-100 dark:bg-amber-500/10',  icon: 'text-amber-600 dark:text-amber-400',  text: 'text-amber-600 dark:text-amber-400' },
        green:   { border: 'border-green-100 dark:border-green-500/20',   iconBg: 'bg-green-100 dark:bg-green-500/10',  icon: 'text-green-600 dark:text-green-400',  text: 'text-green-600 dark:text-green-400' },
        red:     { border: 'border-red-100 dark:border-red-500/20',       iconBg: 'bg-red-100 dark:bg-red-500/10',      icon: 'text-red-500 dark:text-red-400',      text: 'text-red-600 dark:text-red-400' },
    };
    const c = colors[color] || colors.emerald;

    if (isLoading) {
        return (
            <div className={`rounded-2xl border ${c.border} bg-white dark:bg-[#1E293B]/60 p-6 animate-pulse`}>
                <div className="h-4 bg-slate-200 dark:bg-white/[0.06] rounded w-24 mb-4" />
                <div className="h-8 bg-slate-200 dark:bg-white/[0.06] rounded w-16" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className={`rounded-2xl border ${c.border} bg-white dark:bg-[#1E293B]/60 p-6 shadow-sm hover:shadow-md dark:hover:bg-[#1E293B]/80 transition-all duration-200`}
        >
            <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <div className={`p-2 rounded-xl ${c.iconBg} border ${c.border}`}>
                    <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{value}</p>
            {subtitle && <p className={`text-xs font-medium ${c.text}`}>{subtitle}</p>}
        </motion.div>
    );
}

export default function AdminDashboard() {
    const { t } = useTranslation();
    usePageTitle('pageTitles.admin');
    const queryClient = useQueryClient();
    const socketRef = useSocket();
    const [liveAlertCount, setLiveAlertCount] = useState(null);

    const { data: statsData, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: adminApi.getStats,
        refetchInterval: 30000,
    });

    const stats = statsData?.data || {};

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;
        const handleAlert = () => { setLiveAlertCount(prev => (prev ?? (stats.activeAlerts || 0)) + 1); queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); };
        const handleResolved = () => { setLiveAlertCount(prev => Math.max(0, (prev ?? (stats.activeAlerts || 0)) - 1)); queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); };
        socket.on('alert', handleAlert);
        socket.on('alert-resolved', handleResolved);
        return () => { socket.off('alert', handleAlert); socket.off('alert-resolved', handleResolved); };
    }, [socketRef, stats.activeAlerts, queryClient]);

    const activeAlerts = liveAlertCount ?? stats.activeAlerts ?? 0;

    const quickLinks = [
        { titleKey: 'admin.dashboard.links.users.title',     descKey: 'admin.dashboard.links.users.desc',     path: '/admin/users',     icon: Users,         border: 'border-blue-100 dark:border-blue-500/20',      hover: 'hover:bg-blue-50 dark:hover:bg-blue-500/5',      iconBg: 'bg-blue-100 dark:bg-blue-500/10',      iconColor: 'text-blue-500 dark:text-blue-400' },
        { titleKey: 'admin.dashboard.links.devices.title',   descKey: 'admin.dashboard.links.devices.desc',   path: '/admin/devices',   icon: Leaf,          border: 'border-emerald-100 dark:border-green-500/20',   hover: 'hover:bg-emerald-50 dark:hover:bg-green-500/5',   iconBg: 'bg-emerald-100 dark:bg-green-500/10',   iconColor: 'text-emerald-600 dark:text-green-400' },
        { titleKey: 'admin.dashboard.links.alerts.title',    descKey: 'admin.dashboard.links.alerts.desc',    path: '/admin/alerts',    icon: AlertTriangle, border: 'border-amber-100 dark:border-amber-500/20',     hover: 'hover:bg-amber-50 dark:hover:bg-amber-500/5',     iconBg: 'bg-amber-100 dark:bg-amber-500/10',     iconColor: 'text-amber-600 dark:text-amber-400' },
        { titleKey: 'admin.dashboard.links.analytics.title', descKey: 'admin.dashboard.links.analytics.desc', path: '/admin/analytics', icon: BarChart3,     border: 'border-purple-100 dark:border-purple-500/20',   hover: 'hover:bg-purple-50 dark:hover:bg-purple-500/5',   iconBg: 'bg-purple-100 dark:bg-purple-500/10',   iconColor: 'text-purple-600 dark:text-purple-400' },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-green-600 dark:bg-none dark:bg-green-500/10 dark:border dark:border-green-500/20 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none">
                        <Shield className="w-6 h-6 text-white dark:text-green-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{t('admin.dashboard.overview')}</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{t('admin.dashboard.realtimeSubtitle')}</p>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title={t('admin.dashboard.stats.totalUsers')}   value={stats.totalUsers ?? 0}   icon={Users}         color="blue"   subtitle={t('admin.dashboard.stats.thisWeekSuffix', { count: stats.recentActivity?.newUsers ?? 0 })}   isLoading={isLoading} delay={0} />
                <StatCard title={t('admin.dashboard.stats.totalDevices')} value={stats.totalDevices ?? 0} icon={Leaf}          color="emerald" subtitle={t('admin.dashboard.stats.thisWeekSuffix', { count: stats.recentActivity?.newDevices ?? 0 })} isLoading={isLoading} delay={0.05} />
                <StatCard title={t('admin.dashboard.stats.activeAlerts')} value={activeAlerts}            icon={AlertTriangle} color={activeAlerts > 0 ? 'amber' : 'emerald'} subtitle={activeAlerts > 0 ? t('admin.dashboard.stats.requiresAttention') : t('admin.dashboard.stats.allClear')} isLoading={isLoading} delay={0.1} />
                <StatCard title={t('admin.dashboard.stats.systemHealth')} value={activeAlerts === 0 ? t('admin.dashboard.stats.healthy') : t('admin.dashboard.stats.warning')} icon={activeAlerts === 0 ? CheckCircle2 : Activity} color={activeAlerts === 0 ? 'green' : 'amber'} subtitle={activeAlerts === 0 ? t('admin.dashboard.stats.noIssues') : t('admin.dashboard.stats.alertsActive', { count: activeAlerts })} isLoading={isLoading} delay={0.15} />
            </div>

            {/* Quick Actions + This Week */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-widest">{t('admin.dashboard.quickActions.title')}</h2>
                    <div className="space-y-3">
                        {quickLinks.map((link, i) => (
                            <motion.div key={link.path} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                                <Link to={link.path} className={`flex items-center justify-between p-5 rounded-2xl border ${link.border} bg-white dark:bg-[#1E293B]/60 ${link.hover} transition-all duration-200 group cursor-pointer shadow-sm hover:shadow-md dark:hover:shadow-none`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-xl ${link.iconBg} border ${link.border}`}>
                                            <link.icon className={`w-5 h-5 ${link.iconColor}`} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{t(link.titleKey)}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{t(link.descKey)}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
                    <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-widest">{t('admin.dashboard.thisWeek')}</h2>
                    <div className="rounded-2xl border border-slate-100 dark:border-white/[0.07] bg-white dark:bg-[#1E293B]/60 shadow-sm p-5 space-y-3">
                        {[
                            { labelKey: 'admin.dashboard.recentActivity.newUsers',   subKey: 'admin.dashboard.recentActivity.lastWeek', value: stats.recentActivity?.newUsers ?? 0,   icon: Users, bg: 'bg-blue-50 dark:bg-blue-500/[0.08]',    border: 'border-blue-100 dark:border-blue-500/20',    ibg: 'bg-blue-100 dark:bg-blue-500/10',    icon2: 'text-blue-500 dark:text-blue-400',    vcolor: 'text-blue-600 dark:text-blue-400' },
                            { labelKey: 'admin.dashboard.recentActivity.newDevices', subKey: 'admin.dashboard.recentActivity.lastWeek', value: stats.recentActivity?.newDevices ?? 0, icon: Leaf,  bg: 'bg-emerald-50 dark:bg-green-500/[0.08]', border: 'border-emerald-100 dark:border-green-500/20', ibg: 'bg-emerald-100 dark:bg-green-500/10', icon2: 'text-emerald-600 dark:text-green-400', vcolor: 'text-emerald-600 dark:text-green-400' },
                        ].map((row) => (
                            <div key={row.labelKey} className={`flex items-center justify-between p-3 rounded-xl ${row.bg} border ${row.border}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${row.ibg}`}>
                                        <row.icon className={`w-4 h-4 ${row.icon2}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t(row.labelKey)}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-400">{t(row.subKey)}</p>
                                    </div>
                                </div>
                                <span className={`text-xl font-bold ${row.vcolor}`}>{row.value}</span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 dark:bg-emerald-500/[0.08] border border-green-100 dark:border-emerald-500/20">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-green-100 dark:bg-emerald-500/10">
                                    <Zap className="w-4 h-4 text-green-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('admin.dashboard.uptime.label')}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-400">{t('admin.dashboard.uptime.sub')}</p>
                                </div>
                            </div>
                            <span className="text-sm font-bold text-green-600 dark:text-emerald-400">{t('admin.dashboard.uptime.status')}</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
