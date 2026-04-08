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
import { adminApi } from '@/api/admin';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function isOnline(lastSeenAt) {
    if (!lastSeenAt) return false;
    return Date.now() - new Date(lastSeenAt).getTime() < 5 * 60 * 1000;
}

export default function AdminDevices() {
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
            toast.success('Device deleted successfully');
        },
        onError: (e) => toast.error('Failed to delete device: ' + e.message)
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-200">
                        <Leaf className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">Device Management</h1>
                        <p className="text-slate-500 text-sm">Manage all registered plant monitoring devices</p>
                    </div>
                </div>
            </motion.div>

            {/* Search */}
            <div className="flex flex-col md:flex-row gap-3 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Search devices by name or ID..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="pl-10"
                    />
                </div>
                <span className="hidden md:flex items-center text-sm text-slate-400 whitespace-nowrap">
                    {totalDevices} devices total
                </span>
            </div>

            {/* Devices Table */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800">All Devices ({totalDevices})</h2>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : devices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <Leaf className="w-12 h-12 mb-3 opacity-30" />
                        <p className="font-medium text-slate-600">No devices found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Device</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Owner</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Seen</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {devices.map((device) => {
                                    const online = isOnline(device.lastSeenAt);
                                    return (
                                        <tr key={device.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                        <Leaf className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800">{device.plantName || 'Unnamed Plant'}</p>
                                                        <p className="text-xs text-slate-400 font-mono">{device.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">
                                                {device.user?.fullName || device.user?.email || <span className="text-slate-400 italic">No owner</span>}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">
                                                {device.location || <span className="text-slate-300">—</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                {online ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        Online
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                        Offline
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : <span className="text-slate-400">Never</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        to={createPageUrl('plant-details') + `/${device.id}`}
                                                        className="p-2 hover:bg-emerald-100 rounded-lg transition-colors group"
                                                        title="View Details"
                                                    >
                                                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteDevice(device)}
                                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                                                        title="Delete Device"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
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
                    <div className="flex justify-center items-center gap-2 p-4 border-t border-slate-100">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Delete Dialog */}
            <Dialog open={!!deleteDevice} onOpenChange={() => setDeleteDevice(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Device</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{deleteDevice?.plantName}</strong> ({deleteDevice?.id})? This will delete all associated sensor data and alerts.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDevice(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteDevice.id)} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete Device'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
