import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Trash2, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { adminApi } from '@/api/admin';
import { toast } from 'sonner';

export default function AdminAlerts() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
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

    const resolveMutation = useMutation({
        mutationFn: (id) => adminApi.resolveAlert(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
            toast.success(t('admin.alerts.resolveSuccess', 'Alert resolved successfully'));
        },
        onError: (error) => {
            toast.error(t('admin.alerts.resolveError', 'Failed to resolve alert') + ': ' + error.message);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => adminApi.deleteAlert(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
            setDeleteAlert(null);
            toast.success(t('admin.alerts.deleteSuccess', 'Alert deleted successfully'));
        },
        onError: (error) => {
            toast.error(t('admin.alerts.deleteError', 'Failed to delete alert') + ': ' + error.message);
        }
    });

    const getAlertTypeColor = (type) => {
        const colors = {
            warning: 'bg-amber-100 text-amber-800',
            error: 'bg-red-100 text-red-800',
            info: 'bg-blue-100 text-blue-800'
        };
        return colors[type] || colors.warning;
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2"
            >
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
                            {t('admin.alerts.title', 'Alert Management')}
                        </h1>
                        <p className="text-slate-500">
                            {t('admin.alerts.subtitle', 'Monitor and manage system alerts')}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Filter */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-slate-400" />
                        <Select value={statusFilter || "ALL"} onValueChange={(value) => setStatusFilter(value === "ALL" ? "" : value)}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder={t('admin.alerts.filters.all', 'All Alerts')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">{t('admin.alerts.filters.all', 'All Alerts')}</SelectItem>
                                <SelectItem value="active">{t('admin.alerts.filters.active', 'Active Only')}</SelectItem>
                                <SelectItem value="resolved">{t('admin.alerts.filters.resolved', 'Resolved Only')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Alerts Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {t('admin.alerts.tableTitle', 'All Alerts')} ({alertsData?.data?.total || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : alerts.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            {t('admin.alerts.noAlerts', 'No alerts found')}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                                            {t('admin.alerts.table.device', 'Device')}
                                        </th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                                            {t('admin.alerts.table.owner', 'Owner')}
                                        </th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                                            {t('admin.alerts.table.type', 'Type')}
                                        </th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                                            {t('admin.alerts.table.message', 'Message')}
                                        </th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                                            {t('admin.alerts.table.status', 'Status')}
                                        </th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                                            {t('admin.alerts.table.created', 'Created')}
                                        </th>
                                        <th className="text-right px-4 py-3 text-sm font-semibold text-slate-700">
                                            {t('admin.alerts.table.actions', 'Actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alerts.map((alert) => (
                                        <tr key={alert.id} className="border-b hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                {alert.device?.plantName || alert.deviceId}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {alert.device?.user?.fullName || alert.device?.user?.email || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getAlertTypeColor(alert.type)}`}>
                                                    {alert.code}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 text-sm max-w-xs truncate">
                                                {alert.message}
                                            </td>
                                            <td className="px-4 py-3">
                                                {alert.isActive ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        {t('admin.alerts.status.active', 'Active')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle className="w-3 h-3" />
                                                        {t('admin.alerts.status.resolved', 'Resolved')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 text-sm">
                                                {new Date(alert.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    {alert.isActive && (
                                                        <button
                                                            onClick={() => resolveMutation.mutate(alert.id)}
                                                            className="p-2 hover:bg-green-100 rounded-lg transition-colors group"
                                                            title={t('admin.alerts.actions.resolve', 'Resolve Alert')}
                                                        >
                                                            <CheckCircle className="w-4 h-4 text-slate-600 group-hover:text-green-600" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setDeleteAlert(alert)}
                                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                                                        title={t('admin.alerts.actions.delete', 'Delete Alert')}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-slate-600 group-hover:text-red-600" />
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
                        <div className="flex justify-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <span className="px-4 py-2 text-sm text-slate-600">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Alert Dialog */}
            <Dialog open={!!deleteAlert} onOpenChange={() => setDeleteAlert(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">
                            {t('admin.alerts.deleteDialog.title', 'Delete Alert')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('admin.alerts.deleteDialog.description', 'Are you sure you want to delete this alert? This action cannot be undone.')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm">{deleteAlert?.message}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteAlert(null)}>
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteMutation.mutate(deleteAlert.id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
