import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Users, Search, Edit, Trash2, Shield, ShieldCheck, User, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { adminApi } from '@/api/admin';
import { toast } from 'sonner';

const AVATAR_COLORS = [
    'from-blue-400 to-blue-600',
    'from-emerald-400 to-emerald-600',
    'from-purple-400 to-purple-600',
    'from-amber-400 to-amber-600',
    'from-rose-400 to-rose-600',
    'from-cyan-400 to-cyan-600',
];

function getAvatarColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function AdminUsers() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [editUser, setEditUser] = useState(null);
    const [deleteUser, setDeleteUser] = useState(null);
    const [changeRoleUser, setChangeRoleUser] = useState(null);

    const { data: usersData, isLoading } = useQuery({
        queryKey: ['admin-users', page, searchTerm, roleFilter],
        queryFn: () => adminApi.getUsers({ page, search: searchTerm, role: roleFilter || undefined })
    });

    const users = usersData?.data?.users || [];
    const totalPages = usersData?.data?.pages || 1;
    const totalUsers = usersData?.data?.total || 0;

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminApi.updateUser(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setEditUser(null); toast.success(t('admin.users.updateSuccess')); },
        onError: (e) => toast.error(t('admin.users.updateError') + ': ' + e.message)
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => adminApi.deleteUser(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setDeleteUser(null); toast.success(t('admin.users.deleteSuccess')); },
        onError: (e) => toast.error(t('admin.users.deleteError') + ': ' + e.message)
    });

    const changeRoleMutation = useMutation({
        mutationFn: ({ id, role }) => adminApi.changeUserRole(id, role),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setChangeRoleUser(null); toast.success(t('admin.users.roleChangeSuccess')); },
        onError: (e) => toast.error(t('admin.users.roleChangeError') + ': ' + e.message)
    });

    const handleUpdateUser = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        updateMutation.mutate({ id: editUser.id, data: { full_name: formData.get('fullName'), email: formData.get('email') } });
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-sky-600 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-500/20">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{t('admin.users.title')}</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{t('admin.users.subtitle')}</p>
                    </div>
                </div>
            </motion.div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 p-4 rounded-2xl border border-slate-100 dark:border-white/[0.07] bg-white dark:bg-[#1E293B]/60 shadow-sm dark:shadow-none">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 w-4 h-4" />
                    <Input
                        placeholder={t('admin.users.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="pl-10 bg-slate-50 dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                </div>
                <Select value={roleFilter || 'ALL'} onValueChange={(v) => { setRoleFilter(v === 'ALL' ? '' : v); setPage(1); }}>
                    <SelectTrigger className="w-full md:w-44 bg-slate-50 dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-200">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#1E293B] border-slate-100 dark:border-white/[0.08] text-slate-800 dark:text-slate-200">
                        <SelectItem value="ALL">{t('admin.users.filters.all')}</SelectItem>
                        <SelectItem value="USER">{t('admin.users.filters.users')}</SelectItem>
                        <SelectItem value="ADMIN">{t('admin.users.filters.admins')}</SelectItem>
                    </SelectContent>
                </Select>
                <span className="hidden md:flex items-center text-sm text-slate-400 dark:text-slate-400 whitespace-nowrap">
                    {t('admin.users.totalCount', { count: totalUsers })}
                </span>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border border-slate-100 dark:border-white/[0.07] bg-white dark:bg-[#1E293B]/60 shadow-sm dark:shadow-none overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-white/[0.06]">
                    <h2 className="font-semibold text-slate-800 dark:text-slate-200">{t('admin.users.allCount', { count: totalUsers })}</h2>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-4 border-emerald-500 dark:border-green-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-400">
                        <Users className="w-12 h-12 mb-3 opacity-30" />
                        <p className="font-medium text-slate-600 dark:text-slate-400">{t('admin.users.noUsers')}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03]">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.users.table.name')}</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.users.table.email')}</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.users.table.role')}</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.users.table.devices')}</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.users.table.created')}</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('admin.users.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-white/[0.04]">
                                {users.map((user) => {
                                    const initials = (user.fullName || user.email || 'U').charAt(0).toUpperCase();
                                    const avatarGradient = getAvatarColor(user.email || user.id);
                                    return (
                                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-semibold text-sm shadow-sm flex-shrink-0`}>
                                                        {initials}
                                                    </div>
                                                    <span className="font-medium text-slate-800 dark:text-slate-200">
                                                        {user.fullName || <span className="text-slate-400 dark:text-slate-400 italic">{t('admin.users.noName')}</span>}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{user.email}</td>
                                            <td className="px-6 py-4">
                                                {user.role === 'ADMIN' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100 dark:bg-green-500/10 text-emerald-700 dark:text-green-400 border border-emerald-200 dark:border-green-500/20">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        {t('admin.users.roleDialog.admin')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                                                        <User className="w-3 h-3" />
                                                        {t('admin.users.roleDialog.user')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{user._count?.devices ?? 0}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => setEditUser(user)} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-500/10 rounded-lg transition-colors group cursor-pointer" title={t('admin.users.actions.edit')}>
                                                        <Edit className="w-4 h-4 text-slate-400 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                                    </button>
                                                    <button onClick={() => setChangeRoleUser(user)} className="p-2 hover:bg-emerald-100 dark:hover:bg-green-500/10 rounded-lg transition-colors group cursor-pointer" title={t('admin.users.actions.changeRole')}>
                                                        <Shield className="w-4 h-4 text-slate-400 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-green-400" />
                                                    </button>
                                                    <button onClick={() => setDeleteUser(user)} className="p-2 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-lg transition-colors group cursor-pointer" title={t('admin.users.actions.delete')}>
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
                        <span className="text-sm text-slate-500 dark:text-slate-400">{t('admin.users.page', { current: page, total: totalPages })}</span>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                            className="border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05]">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Edit User Dialog */}
            <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
                <DialogContent className="bg-white dark:bg-[#1E293B] border-slate-100 dark:border-white/[0.08]">
                    <DialogHeader>
                        <DialogTitle className="text-slate-800 dark:text-white">{t('admin.users.editDialog.title')}</DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400">{t('admin.users.editDialog.description')}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateUser}>
                        <div className="space-y-4 py-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('admin.users.editDialog.fullName')}</label>
                                <Input name="fullName" defaultValue={editUser?.fullName || ''} placeholder="John Doe"
                                    className="mt-1 bg-slate-50 dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('admin.users.editDialog.email')}</label>
                                <Input name="email" type="email" defaultValue={editUser?.email || ''} placeholder="john@example.com" required
                                    className="mt-1 bg-slate-50 dark:bg-white/[0.05] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditUser(null)}
                                className="border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05]">{t('common.cancel')}</Button>
                            <Button type="submit" disabled={updateMutation.isPending}
                                className="bg-emerald-600 dark:bg-green-500 hover:bg-emerald-700 dark:hover:bg-green-400 text-white">
                                {updateMutation.isPending ? t('admin.users.saving') : t('admin.users.saveChanges')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Change Role Dialog */}
            <Dialog open={!!changeRoleUser} onOpenChange={() => setChangeRoleUser(null)}>
                <DialogContent className="bg-white dark:bg-[#1E293B] border-slate-100 dark:border-white/[0.08]">
                    <DialogHeader>
                        <DialogTitle className="text-slate-800 dark:text-white">{t('admin.users.roleDialog.title')}</DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400">{t('admin.users.roleDialog.description', { name: changeRoleUser?.fullName || changeRoleUser?.email })}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <Button onClick={() => changeRoleMutation.mutate({ id: changeRoleUser.id, role: 'USER' })} variant="outline"
                            className="w-full justify-start border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05]"
                            disabled={changeRoleUser?.role === 'USER' || changeRoleMutation.isPending}>
                            <User className="w-4 h-4 mr-2" />
                            {t('admin.users.roleStandard')}
                        </Button>
                        <Button onClick={() => changeRoleMutation.mutate({ id: changeRoleUser.id, role: 'ADMIN' })} variant="outline"
                            className="w-full justify-start border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05]"
                            disabled={changeRoleUser?.role === 'ADMIN' || changeRoleMutation.isPending}>
                            <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600 dark:text-green-400" />
                            {t('admin.users.roleAdmin')}
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setChangeRoleUser(null)}
                            className="border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05]">{t('common.cancel')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
                <DialogContent className="bg-white dark:bg-[#1E293B] border-slate-100 dark:border-white/[0.08]">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 dark:text-red-400">{t('admin.users.deleteDialog.title')}</DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400">{t('admin.users.deleteDialog.description', { name: deleteUser?.fullName || deleteUser?.email })}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteUser(null)}
                            className="border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05]">{t('common.cancel')}</Button>
                        <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteUser.id)} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? t('admin.users.deleting') : t('common.delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
