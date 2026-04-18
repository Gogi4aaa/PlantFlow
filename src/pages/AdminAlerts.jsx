import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    AlertTriangle, CheckCircle, Trash2, Filter, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { adminApi } from '@/api/admin';
import { toast } from 'sonner';
import { useSocket } from '@/hooks/useSocket';

export default function AdminAlerts() {
    const { t } = useTranslation();
    usePageTitle('pageTitles.adminAlerts');
    const queryClient = useQueryClient();
    const socketRef = useSocket();
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [deleteAlert, setDeleteAlert] = useState(null);

    const { data: alertsData, isLoading } = useQuery({
        queryKey: ['admin-alerts', page, statusFilter],
        queryFn: () => adminApi.getAllAlerts({
            page,
            isActive: statusFilter === 'active' ? 'true' : statusFilter === 'resolved' ? 'false' : undefined
        })
    });

    const alerts = alertsData?.data?.alerts || [];
    const totalPages = alertsData?.data?.pages || 1;
    const totalAlerts = alertsData?.data?.total || 0;

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        const handleNewAlert = (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
            toast.warning(`${t('admin.alerts.status.active')}: ${data.alert?.message || 'System alert triggered'}`);
        };
        const handleResolved = (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
            toast.success(`${t('admin.alerts.status.resolved')}: ${data.code || ''}`);
        };

        socket.on('alert', handleNewAlert);
        socket.on('alert-resolved', handleResolved);
        return () => {
            socket.off('alert', handleNewAlert);
            socket.off('alert-resolved', handleResolved);
        };
    }, [socketRef, queryClient, t]);

    const resolveMutation = useMutation({
        mutationFn: (id) => adminApi.resolveAlert(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
            toast.success(t('admin.alerts.resolveSuccess'));
        },
        onError: (e) => toast.error(t('admin.alerts.resolveError') + ': ' + e.message)
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => adminApi.deleteAlert(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
            setDeleteAlert(null);
            toast.success(t('admin.alerts.deleteSuccess'));
        },
        onError: (e) => toast.error(t('admin.alerts.deleteError') + ': ' + e.message)
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg shadow-amber-200 dark:shadow-amber-500/20">
                        <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{t('admin.alerts.title')}</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{t('admin.alerts.subtitle')}</p>
                    </div>
                </div>
            </motion.div>

            {/* Filter */}
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 dark:border-white/[0.07] bg-white dark:bg-[#1E293B]/60 shadow-sm dark:shadow-none">
                <Filter className="w-4 h-4 text-slate-400 dark:text-slate-400" />
                <Select value={statusFilter || 'ALL'} onValueChange={(v) => setStatusFilter(v === 'ALL' ? '' : v)}>
                    <SelectTrigger className="w-48 bg-slate-50 dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-200">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#1E293B] border-slate-100 dark:border-white/[0.08] text-slate-800 dark:text-slate-200">
                        <SelectItem value="ALL">{t('admin.alerts.filters.all')}</SelectItem>
                        <SelectItem value="active">{t('admin.alerts.filters.active')}</SelectItem>
                        <SelectItem value="resolved">{t('admin.alerts.filters.resolved')}</SelectItem>
                    </SelectContent>
                </Select>
                <span className="text-sm text-slate-400 dark:text-slate-400 ml-auto">{t('admin.alerts.totalCount', { count: totalAlerts })}</span>
            </div>

            {/* Alerts Table */}
            <div className="rounded-2xl border border-slate-100 dark:border-white/[0.07] bg-white dark:bg-[#1E293B]/60 shadow-sm dark:shadow-none overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-white/[0.06]">
                    <h2 className="font-semibold text-slate-800 dark:text-slate-200">{t('admin.alerts.tableTitle')}</h2>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-4 border-emerald-500 dark:border-green-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-400">
                        <CheckCircle className="w-12 h-12 mb-3 text-emerald-400 dark:text-green-500/50" />
                        <p className="font-medium text-slate-600 dark:text-slate-400">{t('admin.alerts.noAlerts')}</p>
                        <p className="text-sm">{t('admin.alerts.systemSmooth')}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03]">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.alerts.table.device')}</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.alerts.table.owner')}</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.alerts.table.type')}</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.alerts.table.message')}</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.alerts.table.status')}</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.alerts.table.created')}</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.alerts.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-white/[0.04]">
                                {alerts.map((alert) => (
                                    <tr key={alert.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                                            {alert.device?.plantName || alert.deviceId}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                                            {alert.device?.user?.fullName || alert.device?.user?.email || '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                                {alert.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm max-w-xs truncate">
                                            {alert.message}
                                        </td>
                                        <td className="px-6 py-4">
                                            {alert.isActive ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                                                    {t('admin.alerts.status.active')}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100 dark:bg-green-500/10 text-emerald-700 dark:text-green-400 border border-emerald-200 dark:border-green-500/20">
                                                    <CheckCircle className="w-3 h-3" />
                                                    {t('admin.alerts.status.resolved')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(alert.createdAt).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {alert.isActive && (
                                                    <button
                                                        onClick={() => resolveMutation.mutate(alert.id)}
                                                        disabled={resolveMutation.isPending}
                                                        className="p-2 hover:bg-emerald-100 dark:hover:bg-green-500/10 rounded-lg transition-colors group cursor-pointer"
                                                        title={t('admin.alerts.actions.resolve')}
                                                    >
                                                        <CheckCircle className="w-4 h-4 text-slate-400 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-green-400" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setDeleteAlert(alert)}
                                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-lg transition-colors group cursor-pointer"
                                                    title={t('admin.alerts.actions.delete')}
                                                >
                                                    <Trash2 className="w-4 h-4 text-slate-400 dark:text-slate-400 group-hover:text-red-500 dark:group-hover:text-red-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 p-4 border-t border-slate-100 dark:border-white/[0.06]">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            className="border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05]">
                            {t('admin.alerts.previous')}
                        </Button>
                        <span className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">{t('admin.alerts.page', { current: page, total: totalPages })}</span>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                            className="border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05]">
                            {t('admin.alerts.next')}
                        </Button>
                    </div>
                )}
            </div>

            {/* Delete Dialog */}
            <Dialog open={!!deleteAlert} onOpenChange={() => setDeleteAlert(null)}>
                <DialogContent className="bg-white dark:bg-[#1E293B] border-slate-100 dark:border-white/[0.08]">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 dark:text-red-400">{t('admin.alerts.deleteDialog.title')}</DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400">{t('admin.alerts.deleteDialog.description')}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">{deleteAlert?.message}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteAlert(null)}
                            className="border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05]">{t('common.cancel')}</Button>
                        <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteAlert.id)} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? t('admin.alerts.deleting') : t('common.delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
