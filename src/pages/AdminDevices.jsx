import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Leaf, Search, Trash2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminDevices() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [deleteDevice, setDeleteDevice] = useState(null);

    const { data: devicesData, isLoading } = useQuery({
        queryKey: ['admin-devices', page, searchTerm],
        queryFn: () => adminApi.getAllDevices({ page, search: searchTerm })
    });

    const devices = devicesData?.data?.devices || [];
    const totalPages = devicesData?.data?.pages || 1;

    const deleteMutation = useMutation({
        mutationFn: (id) => adminApi.deleteDevice(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-devices'] });
            setDeleteDevice(null);
            toast.success(t('admin.devices.deleteSuccess', 'Device deleted successfully'));
        },
        onError: (error) => {
            toast.error(t('admin.devices.deleteError', 'Failed to delete device') + ': ' + error.message);
        }
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2"
            >
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg">
                        <Leaf className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
                            {t('admin.devices.title', 'Device Management')}
                        </h1>
                        <p className="text-slate-500">
                            {t('admin.devices.subtitle', 'Manage all registered devices')}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                            placeholder={t('admin.devices.searchPlaceholder', 'Search devices...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Devices Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {t('admin.devices.tableTitle', 'All Devices')} ({devicesData?.data?.total || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : devices.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            {t('admin.devices.noDevices', 'No devices found')}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                                            {t('admin.devices.table.id', 'Device ID')}
                                        </th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                                            {t('admin.devices.table.plantName', 'Plant Name')}
                                        </th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                                            {t('admin.devices.table.owner', 'Owner')}
                                        </th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                                            {t('admin.devices.table.location', 'Location')}
                                        </th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                                            {t('admin.devices.table.lastSeen', 'Last Seen')}
                                        </th>
                                        <th className="text-right px-4 py-3 text-sm font-semibold text-slate-700">
                                            {t('admin.devices.table.actions', 'Actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {devices.map((device) => (
                                        <tr key={device.id} className="border-b hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 font-mono text-sm text-slate-600">{device.id}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Leaf className="w-4 h-4 text-emerald-600" />
                                                    <span className="font-medium text-slate-800">{device.plantName}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {device.user?.fullName || device.user?.email || t('admin.devices.noOwner', 'No owner')}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{device.location || '-'}</td>
                                            <td className="px-4 py-3 text-slate-600 text-sm">
                                                {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : t('admin.devices.never', 'Never')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        to={createPageUrl('plant-details') + `/${device.id}`}
                                                        className="p-2 hover:bg-emerald-100 rounded-lg transition-colors group"
                                                        title={t('admin.devices.actions.view', 'View Details')}
                                                    >
                                                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-emerald-600" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteDevice(device)}
                                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                                                        title={t('admin.devices.actions.delete', 'Delete Device')}
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

            {/* Delete Device Dialog */}
            <Dialog open={!!deleteDevice} onOpenChange={() => setDeleteDevice(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">
                            {t('admin.devices.deleteDialog.title', 'Delete Device')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('admin.devices.deleteDialog.description', 'Are you sure you want to delete this device? This action cannot be undone and will delete all associated sensor data and alerts.')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm">
                            <span className="font-medium">{deleteDevice?.plantName}</span>
                            {' '} ({deleteDevice?.id})
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDevice(null)}>
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteMutation.mutate(deleteDevice.id)}
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
