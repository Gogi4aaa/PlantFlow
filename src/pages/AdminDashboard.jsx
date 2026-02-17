import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Users, Leaf, AlertTriangle, Activity, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/admin/StatCard';
import { adminApi } from '@/api/admin';

export default function AdminDashboard() {
    const { t } = useTranslation();

    const { data: statsData, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: adminApi.getStats
    });

    const stats = statsData?.data || {};

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2"
            >
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
                            {t('admin.dashboard.title', 'System Administration')}
                        </h1>
                        <p className="text-slate-500">
                            {t('admin.dashboard.subtitle', 'Manage your PlantFlow system')}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title={t('admin.dashboard.stats.totalUsers', 'Total Users')}
                    value={stats.totalUsers || 0}
                    icon={Users}
                    color="blue"
                    isLoading={isLoading}
                />
                <StatCard
                    title={t('admin.dashboard.stats.totalDevices', 'Total Devices')}
                    value={stats.totalDevices || 0}
                    icon={Leaf}
                    color="emerald"
                    isLoading={isLoading}
                />
                <StatCard
                    title={t('admin.dashboard.stats.activeAlerts', 'Active Alerts')}
                    value={stats.activeAlerts || 0}
                    icon={AlertTriangle}
                    color={stats.activeAlerts > 0 ? 'amber' : 'emerald'}
                    isLoading={isLoading}
                />
                <StatCard
                    title={t('admin.dashboard.stats.systemHealth', 'System Health')}
                    value={stats.activeAlerts === 0 ? 'Healthy' : 'Warning'}
                    icon={Activity}
                    color={stats.activeAlerts === 0 ? 'emerald' : 'amber'}
                    isLoading={isLoading}
                />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-emerald-100">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                                {t('admin.dashboard.recentActivity.title', 'Recent Activity (7 Days)')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Users className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">
                                                {t('admin.dashboard.recentActivity.newUsers', 'New Users')}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {t('admin.dashboard.recentActivity.lastWeek', 'Last 7 days')}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {stats.recentActivity?.newUsers || 0}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                            <Leaf className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">
                                                {t('admin.dashboard.recentActivity.newDevices', 'New Devices')}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {t('admin.dashboard.recentActivity.lastWeek', 'Last 7 days')}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-emerald-600">
                                        {stats.recentActivity?.newDevices || 0}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-purple-100">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock className="w-5 h-5 text-purple-600" />
                                {t('admin.dashboard.quickActions.title', 'Quick Actions')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <a
                                    href="/admin/users"
                                    className="block p-4 bg-gradient-to-r from-blue-50 to-sky-50 hover:from-blue-100 hover:to-sky-100 rounded-lg transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-slate-800 group-hover:text-blue-700">
                                                {t('admin.nav.users', 'User Management')}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {t('admin.dashboard.quickActions.manageUsers', 'View and manage all users')}
                                            </p>
                                        </div>
                                        <Users className="w-5 h-5 text-blue-600" />
                                    </div>
                                </a>

                                <a
                                    href="/admin/devices"
                                    className="block p-4 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 rounded-lg transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-slate-800 group-hover:text-emerald-700">
                                                {t('admin.nav.devices', 'Device Management')}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {t('admin.dashboard.quickActions.manageDevices', 'Oversee all devices')}
                                            </p>
                                        </div>
                                        <Leaf className="w-5 h-5 text-emerald-600" />
                                    </div>
                                </a>

                                <a
                                    href="/admin/alerts"
                                    className="block p-4 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 rounded-lg transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-slate-800 group-hover:text-amber-700">
                                                {t('admin.nav.alerts', 'Alert Management')}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {t('admin.dashboard.quickActions.manageAlerts', 'Monitor system alerts')}
                                            </p>
                                        </div>
                                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                                    </div>
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
