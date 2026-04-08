import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Users, Leaf, AlertTriangle, Activity,
    ArrowRight, Shield, Zap, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/api/admin';
import { useSocket } from '@/hooks/useSocket';

function StatCard({ title, value, icon: Icon, color, subtitle, isLoading, delay = 0 }) {
    const colors = {
        blue: { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'text-blue-500', iconBg: 'bg-blue-100', text: 'text-blue-600' },
        emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'text-emerald-600', iconBg: 'bg-emerald-100', text: 'text-emerald-600' },
        amber: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-600', iconBg: 'bg-amber-100', text: 'text-amber-600' },
        green: { bg: 'bg-green-50', border: 'border-green-100', icon: 'text-green-600', iconBg: 'bg-green-100', text: 'text-green-600' },
        red: { bg: 'bg-red-50', border: 'border-red-100', icon: 'text-red-500', iconBg: 'bg-red-100', text: 'text-red-600' },
    };
    const c = colors[color] || colors.emerald;

    if (isLoading) {
        return (
            <div className={`rounded-2xl border ${c.border} ${c.bg} p-6 animate-pulse`}>
                <div className="h-4 bg-slate-200 rounded w-24 mb-4" />
                <div className="h-8 bg-slate-200 rounded w-16" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className={`rounded-2xl border ${c.border} bg-white p-6 shadow-sm hover:shadow-md transition-shadow`}
        >
            <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <div className={`p-2 rounded-xl ${c.iconBg}`}>
                    <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
            </div>
            <p className="text-3xl font-bold text-slate-800 mb-1">{value}</p>
            {subtitle && <p className={`text-xs font-medium ${c.text}`}>{subtitle}</p>}
        </motion.div>
    );
}

export default function AdminDashboard() {
    const queryClient = useQueryClient();
    const socketRef = useSocket();
    const [liveAlertCount, setLiveAlertCount] = useState(null);

    const { data: statsData, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: adminApi.getStats,
        refetchInterval: 30000,
    });

    const stats = statsData?.data || {};

    // Real-time alert count via socket
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        const handleAlert = () => {
            setLiveAlertCount(prev => (prev ?? (stats.activeAlerts || 0)) + 1);
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        };
        const handleResolved = () => {
            setLiveAlertCount(prev => Math.max(0, (prev ?? (stats.activeAlerts || 0)) - 1));
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        };

        socket.on('alert', handleAlert);
        socket.on('alert-resolved', handleResolved);
        return () => {
            socket.off('alert', handleAlert);
            socket.off('alert-resolved', handleResolved);
        };
    }, [socketRef, stats.activeAlerts, queryClient]);

    const activeAlerts = liveAlertCount ?? stats.activeAlerts ?? 0;

    const quickLinks = [
        {
            title: 'User Management',
            desc: 'View and manage all registered users',
            path: '/admin/users',
            icon: Users,
            border: 'border-blue-100',
            bg: 'hover:bg-blue-50',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-500',
        },
        {
            title: 'Device Management',
            desc: 'Oversee all plant monitoring devices',
            path: '/admin/devices',
            icon: Leaf,
            border: 'border-emerald-100',
            bg: 'hover:bg-emerald-50',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
        },
        {
            title: 'Alert Management',
            desc: 'Monitor and resolve system alerts',
            path: '/admin/alerts',
            icon: AlertTriangle,
            border: 'border-amber-100',
            bg: 'hover:bg-amber-50',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
        },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-1"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-200">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
                            System Overview
                        </h1>
                        <p className="text-slate-500 text-sm">Real-time administration dashboard</p>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers ?? 0}
                    icon={Users}
                    color="blue"
                    subtitle={`+${stats.recentActivity?.newUsers ?? 0} this week`}
                    isLoading={isLoading}
                    delay={0}
                />
                <StatCard
                    title="Total Devices"
                    value={stats.totalDevices ?? 0}
                    icon={Leaf}
                    color="emerald"
                    subtitle={`+${stats.recentActivity?.newDevices ?? 0} this week`}
                    isLoading={isLoading}
                    delay={0.05}
                />
                <StatCard
                    title="Active Alerts"
                    value={activeAlerts}
                    icon={AlertTriangle}
                    color={activeAlerts > 0 ? 'amber' : 'emerald'}
                    subtitle={activeAlerts > 0 ? 'Requires attention' : 'All clear'}
                    isLoading={isLoading}
                    delay={0.1}
                />
                <StatCard
                    title="System Health"
                    value={activeAlerts === 0 ? 'Healthy' : 'Warning'}
                    icon={activeAlerts === 0 ? CheckCircle2 : Activity}
                    color={activeAlerts === 0 ? 'green' : 'amber'}
                    subtitle={activeAlerts === 0 ? 'No issues detected' : `${activeAlerts} alert(s) active`}
                    isLoading={isLoading}
                    delay={0.15}
                />
            </div>

            {/* Quick Actions & This Week */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Links */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Quick Actions</h2>
                    <div className="space-y-3">
                        {quickLinks.map((link, i) => (
                            <motion.div
                                key={link.path}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + i * 0.05 }}
                            >
                                <Link
                                    to={link.path}
                                    className={`flex items-center justify-between p-5 rounded-2xl border ${link.border} bg-white ${link.bg} transition-all duration-200 group shadow-sm hover:shadow-md`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-xl ${link.iconBg}`}>
                                            <link.icon className={`w-5 h-5 ${link.iconColor}`} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{link.title}</p>
                                            <p className="text-sm text-slate-500">{link.desc}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* This Week */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">This Week</h2>
                    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5 space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-blue-100">
                                    <Users className="w-4 h-4 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">New Users</p>
                                    <p className="text-xs text-slate-400">Last 7 days</p>
                                </div>
                            </div>
                            <span className="text-xl font-bold text-blue-600">
                                {stats.recentActivity?.newUsers ?? 0}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-emerald-100">
                                    <Leaf className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">New Devices</p>
                                    <p className="text-xs text-slate-400">Last 7 days</p>
                                </div>
                            </div>
                            <span className="text-xl font-bold text-emerald-600">
                                {stats.recentActivity?.newDevices ?? 0}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-green-100">
                                    <Zap className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">System Uptime</p>
                                    <p className="text-xs text-slate-400">Current session</p>
                                </div>
                            </div>
                            <span className="text-sm font-bold text-green-600">Online</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
