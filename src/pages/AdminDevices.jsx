import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Leaf, Search, Trash2, ExternalLink, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { adminApi } from '@/api/admin';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function isOnline(lastSeenAt) {
    if (!lastSeenAt) return false;
    return Date.now() - new Date(lastSeenAt).getTime() < 5 * 60 * 1000;
}

export default function AdminDevices() {
    const { t } = useTranslation();
    usePageTitle('pageTitles.adminDevices');
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [deleteDevice, setDeleteDevice] = useState(null);

    const { data: devicesData, isLoading } = useQuery({
        queryKey: ['admin-devices', page, searchTerm],
        queryFn: () => adminApi.getAllDevices({ page, search: searchTerm }),
        refetchInterval: 30000,
    });

    const devices = devicesData?.data?.devices || [];
    const totalPages = devicesData?.data?.pages || 1;
    const totalDevices = devicesData?.data?.total || 0;

    const deleteMutation = useMutation({
        mutationFn: (id) => adminApi.deleteDevice(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-devices'] });
            setDeleteDevice(null);
            toast.success(t('admin.devices.deleteSuccess'));
        },
        onError: (e) => toast.error(t('admin.devices.deleteError') + ': ' + e.message)
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-green-500/20">
                        <Leaf className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{t('admin.devices.title')}</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{t('admin.devices.subtitle')}</p>
                    </div>
                </div>
            </motion.div>

            {/* Search */}
            <div className="flex flex-col md:flex-row gap-3 p-4 rounded-2xl border border-slate-100 dark:border-white/[0.07] bg-white dark:bg-[#1E293B]/60 shadow-sm dark:shadow-none">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 w-4 h-4" />
                    <Input
                        placeholder={t('admin.devices.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="pl-10 bg-slate-50 dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                </div>
                <span className="hidden md:flex items-center text-sm text-slate-400 dark:text-slate-400 whitespace-nowrap">
                    {t('admin.devices.totalCount', { count: totalDevices })}
                </span>
            </div>

            {/* Devices Table */}
            <div className="rounded-2xl border border-slate-100 dark:border-white/[0.07] bg-white dark:bg-[#1E293B]/60 shadow-sm dark:shadow-none overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-white/[0.06]">
                    <h2 className="font-semibold text-slate-800 dark:text-slate-200">{t('admin.devices.allCount', { count: totalDevices })}</h2>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-4 border-emerald-500 dark:border-green-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : devices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-400">
                        <Leaf className="w-12 h-12 mb-3 opacity-30" />
                        <p className="font-medium text-slate-600 dark:text-slate-400">{t('admin.devices.noDevices')}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03]">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.devices.table.device')}</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.devices.table.owner')}</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.devices.table.location')}</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.devices.table.status')}</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.devices.table.lastSeen')}</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.devices.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-white/[0.04]">
                                {devices.map((device) => {
                                    const online = isOnline(device.lastSeenAt);
                                    return (
                                        <tr key={device.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-green-500/10 border border-transparent dark:border-green-500/20 flex items-center justify-center flex-shrink-0">
                                                        <Leaf className="w-4 h-4 text-emerald-600 dark:text-green-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800 dark:text-slate-200">{device.plantName || 'Unnamed Plant'}</p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-400 font-mono">{device.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                                                {device.user?.fullName || device.user?.email || <span className="text-slate-400 dark:text-slate-400 italic">{t('admin.devices.noOwner')}</span>}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                                                {device.location || <span className="text-slate-300 dark:text-slate-400">—</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                {online ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100 dark:bg-green-500/10 text-emerald-700 dark:text-green-400 border border-emerald-200 dark:border-green-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-green-400" />
                                                        {t('admin.devices.status.online')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                                                        {t('admin.devices.status.offline')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : <span className="text-slate-400 dark:text-slate-400">{t('admin.devices.never')}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        to={createPageUrl('plant-details') + `/${device.id}`}
                                                        className="p-2 hover:bg-emerald-100 dark:hover:bg-green-500/10 rounded-lg transition-colors group"
                                                        title={t('admin.devices.actions.view')}
                                                    >
                                                        <ExternalLink className="w-4 h-4 text-slate-400 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-green-400" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteDevice(device)}
                                                        className="p-2 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-lg transition-colors group cursor-pointer"
                                                        title={t('admin.devices.actions.delete')}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-slate-400 dark:text-slate-400 group-hover:text-red-500 dark:group-hover:text-red-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 p-4 border-t border-slate-100 dark:border-white/[0.06]">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            className="border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05]">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{t('admin.devices.page', { current: page, total: totalPages })}</span>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                            className="border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05]">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Delete Dialog */}
            <Dialog open={!!deleteDevice} onOpenChange={() => setDeleteDevice(null)}>
                <DialogContent className="bg-white dark:bg-[#1E293B] border-slate-100 dark:border-white/[0.08]">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 dark:text-red-400">{t('admin.devices.deleteDialog.title')}</DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400">
                            {t('admin.devices.deleteDialog.description', { name: deleteDevice?.plantName || 'Unnamed Plant', id: deleteDevice?.id })}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDevice(null)}
                            className="border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05]">{t('common.cancel')}</Button>
                        <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteDevice.id)} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? t('admin.devices.deleting') : t('common.delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
