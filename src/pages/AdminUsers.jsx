import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Users, Search, Edit, Trash2, Shield, ShieldCheck, User } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { adminApi } from '@/api/admin';
import { toast } from 'sonner';

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

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => adminApi.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setEditUser(null);
            toast.success(t('admin.users.updateSuccess', 'User updated successfully'));
        },
        onError: (error) => {
            toast.error(t('admin.users.updateError', 'Failed to update user') + ': ' + error.message);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => adminApi.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setDeleteUser(null);
            toast.success(t('admin.users.deleteSuccess', 'User deleted successfully'));
        },
        onError: (error) => {
            toast.error(t('admin.users.deleteError', 'Failed to delete user') + ': ' + error.message);
        }
    });

    const changeRoleMutation = useMutation({
        mutationFn: ({ id, role }) => adminApi.changeUserRole(id, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setChangeRoleUser(null);
            toast.success(t('admin.users.roleChangeSuccess', 'User role updated successfully'));
        },
        onError: (error) => {
            toast.error(t('admin.users.roleChangeError', 'Failed to change role') + ': ' + error.message);
        }
    });

    const handleUpdateUser = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        updateMutation.mutate({
            id: editUser.id,
            data: {
                full_name: formData.get('fullName'),
                email: formData.get('email'),
            }
        });
    };

    const handleChangeRole = (newRole) => {
        changeRoleMutation.mutate({
            id: changeRoleUser.id,
            role: newRole
        });
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
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-sky-600 rounded-lg">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
                            {t('admin.users.title', 'User Management')}
                        </h1>
                        <p className="text-slate-500">
                            {t('admin.users.subtitle', 'Manage all registered users')}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <Input
                                placeholder={t('admin.users.searchPlaceholder', 'Search users...')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={roleFilter || "ALL"} onValueChange={(value) => setRoleFilter(value === "ALL" ? "" : value)}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder={t('admin.users.filters.all', 'All Roles')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">{t('admin.users.filters.all', 'All Users')}</SelectItem>
                                <SelectItem value="USER">{t('admin.users.filters.users', 'Users Only')}</SelectItem>
                                <SelectItem value="ADMIN">{t('admin.users.filters.admins', 'Admins Only')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {t('admin.users.tableTitle', 'All Users')} ({usersData?.data?.total || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            {t('admin.users.noUsers', 'No users found')}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                                            {t('admin.users.table.name', 'Name')}
                                        </th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                                            {t('admin.users.table.email', 'Email')}
                                        </th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                                            {t('admin.users.table.role', 'Role')}
                                        </th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                                            {t('admin.users.table.devices', 'Devices')}
                                        </th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                                            {t('admin.users.table.created', 'Created')}
                                        </th>
                                        <th className="text-right px-4 py-3 text-sm font-semibold text-slate-700">
                                            {t('admin.users.table.actions', 'Actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-medium text-sm">
                                                        {(user.fullName || user.email).charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-slate-800">
                                                        {user.fullName || t('admin.users.noName', 'No name')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{user.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {user.role === 'ADMIN' ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {user._count?.devices || 0}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 text-sm">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditUser(user)}
                                                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors group"
                                                        title={t('admin.users.actions.edit', 'Edit User')}
                                                    >
                                                        <Edit className="w-4 h-4 text-slate-600 group-hover:text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => setChangeRoleUser(user)}
                                                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors group"
                                                        title={t('admin.users.actions.changeRole', 'Change Role')}
                                                    >
                                                        <Shield className="w-4 h-4 text-slate-600 group-hover:text-purple-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteUser(user)}
                                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                                                        title={t('admin.users.actions.delete', 'Delete User')}
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

            {/* Edit User Dialog */}
            <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('admin.users.editDialog.title', 'Edit User')}</DialogTitle>
                        <DialogDescription>
                            {t('admin.users.editDialog.description', 'Update user information')}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateUser}>
                        <div className="space-y-4 py-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    {t('admin.users.editDialog.fullName', 'Full Name')}
                                </label>
                                <Input
                                    name="fullName"
                                    defaultValue={editUser?.fullName || ''}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">
                                    {t('admin.users.editDialog.email', 'Email')}
                                </label>
                                <Input
                                    name="email"
                                    type="email"
                                    defaultValue={editUser?.email || ''}
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
                                {t('common.cancel', 'Cancel')}
                            </Button>
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Change Role Dialog */}
            <Dialog open={!!changeRoleUser} onOpenChange={() => setChangeRoleUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('admin.users.roleDialog.title', 'Change User Role')}</DialogTitle>
                        <DialogDescription>
                            {t('admin.users.roleDialog.description', 'Select the new role for this user')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-slate-600 mb-4">
                            Current role: <span className="font-medium">{changeRoleUser?.role}</span>
                        </p>
                        <div className="space-y-2">
                            <Button
                                onClick={() => handleChangeRole('USER')}
                                variant="outline"
                                className="w-full justify-start"
                                disabled={changeRoleUser?.role === 'USER'}
                            >
                                <User className="w-4 h-4 mr-2" />
                                {t('admin.users.roleDialog.user', 'User')}
                            </Button>
                            <Button
                                onClick={() => handleChangeRole('ADMIN')}
                                variant="outline"
                                className="w-full justify-start"
                                disabled={changeRoleUser?.role === 'ADMIN'}
                            >
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                {t('admin.users.roleDialog.admin', 'Admin')}
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setChangeRoleUser(null)}>
                            {t('common.cancel', 'Cancel')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">
                            {t('admin.users.deleteDialog.title', 'Delete User')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('admin.users.deleteDialog.description', 'Are you sure you want to delete this user? This action cannot be undone and will also delete all associated devices and data.')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm">
                            <span className="font-medium">{deleteUser?.fullName || deleteUser?.email}</span>
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteUser(null)}>
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteMutation.mutate(deleteUser.id)}
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
