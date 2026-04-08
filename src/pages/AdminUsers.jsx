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
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setEditUser(null); toast.success('User updated successfully'); },
        onError: (e) => toast.error('Failed to update user: ' + e.message)
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => adminApi.deleteUser(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setDeleteUser(null); toast.success('User deleted successfully'); },
        onError: (e) => toast.error('Failed to delete user: ' + e.message)
    });

    const changeRoleMutation = useMutation({
        mutationFn: ({ id, role }) => adminApi.changeUserRole(id, role),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setChangeRoleUser(null); toast.success('User role updated successfully'); },
        onError: (e) => toast.error('Failed to change role: ' + e.message)
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
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-sky-600 rounded-xl shadow-lg shadow-blue-200">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">User Management</h1>
                        <p className="text-slate-500 text-sm">Manage all registered users</p>
                    </div>
                </div>
            </motion.div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="pl-10"
                    />
                </div>
                <Select value={roleFilter || 'ALL'} onValueChange={(v) => { setRoleFilter(v === 'ALL' ? '' : v); setPage(1); }}>
                    <SelectTrigger className="w-full md:w-44">
                        <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Users</SelectItem>
                        <SelectItem value="USER">Users Only</SelectItem>
                        <SelectItem value="ADMIN">Admins Only</SelectItem>
                    </SelectContent>
                </Select>
                <span className="hidden md:flex items-center text-sm text-slate-400 whitespace-nowrap">
                    {totalUsers} users total
                </span>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800">All Users ({totalUsers})</h2>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <Users className="w-12 h-12 mb-3 opacity-30" />
                        <p className="font-medium text-slate-600">No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Devices</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {users.map((user) => {
                                    const initials = (user.fullName || user.email || 'U').charAt(0).toUpperCase();
                                    const avatarGradient = getAvatarColor(user.email || user.id);
                                    return (
                                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-semibold text-sm shadow-sm flex-shrink-0`}>
                                                        {initials}
                                                    </div>
                                                    <span className="font-medium text-slate-800">
                                                        {user.fullName || <span className="text-slate-400 italic">No name</span>}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">{user.email}</td>
                                            <td className="px-6 py-4">
                                                {user.role === 'ADMIN' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                                        <User className="w-3 h-3" />
                                                        User
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">{user._count?.devices ?? 0}</td>
                                            <td className="px-6 py-4 text-slate-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => setEditUser(user)} className="p-2 hover:bg-blue-100 rounded-lg transition-colors group" title="Edit User">
                                                        <Edit className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                                                    </button>
                                                    <button onClick={() => setChangeRoleUser(user)} className="p-2 hover:bg-emerald-100 rounded-lg transition-colors group" title="Change Role">
                                                        <Shield className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                                                    </button>
                                                    <button onClick={() => setDeleteUser(user)} className="p-2 hover:bg-red-100 rounded-lg transition-colors group" title="Delete User">
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

            {/* Edit User Dialog */}
            <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>Update user information</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateUser}>
                        <div className="space-y-4 py-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Full Name</label>
                                <Input name="fullName" defaultValue={editUser?.fullName || ''} placeholder="John Doe" className="mt-1" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Email</label>
                                <Input name="email" type="email" defaultValue={editUser?.email || ''} placeholder="john@example.com" required className="mt-1" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Change Role Dialog */}
            <Dialog open={!!changeRoleUser} onOpenChange={() => setChangeRoleUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                        <DialogDescription>Select a new role for <strong>{changeRoleUser?.fullName || changeRoleUser?.email}</strong></DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <Button onClick={() => changeRoleMutation.mutate({ id: changeRoleUser.id, role: 'USER' })} variant="outline" className="w-full justify-start" disabled={changeRoleUser?.role === 'USER' || changeRoleMutation.isPending}>
                            <User className="w-4 h-4 mr-2" />
                            User — Standard access
                        </Button>
                        <Button onClick={() => changeRoleMutation.mutate({ id: changeRoleUser.id, role: 'ADMIN' })} variant="outline" className="w-full justify-start" disabled={changeRoleUser?.role === 'ADMIN' || changeRoleMutation.isPending}>
                            <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600" />
                            Admin — Full system access
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setChangeRoleUser(null)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete User</DialogTitle>
                        <DialogDescription>Are you sure you want to delete <strong>{deleteUser?.fullName || deleteUser?.email}</strong>? This will also delete all their devices and data.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteUser(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteUser.id)} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
