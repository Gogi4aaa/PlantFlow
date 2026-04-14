import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import {
    LayoutDashboard, Users, Leaf, AlertTriangle, Shield, BarChart3,
    ChevronLeft, ChevronRight, Menu, LogOut, Clock, User, ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import { useTranslation } from 'react-i18next';

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const adminNavItems = [
        { nameKey: 'admin.layout.overview', icon: LayoutDashboard, path: '/admin', exact: true },
        { nameKey: 'admin.users.title', icon: Users, path: '/admin/users' },
        { nameKey: 'admin.devices.title', icon: Leaf, path: '/admin/devices' },
        { nameKey: 'admin.alerts.title', icon: AlertTriangle, path: '/admin/alerts' },
        { nameKey: 'admin.analytics.title', icon: BarChart3, path: '/admin/analytics' },
    ];

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const loadUser = () => {
            const userStr = localStorage.getItem('plantpulse_user');
            if (userStr) { try { setUser(JSON.parse(userStr)); } catch { } }
        };
        loadUser();
        window.addEventListener('plantflow:profileUpdate', loadUser);
        return () => window.removeEventListener('plantflow:profileUpdate', loadUser);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('plantpulse_user');
        localStorage.removeItem('auth_token');
        navigate('/signin');
    };

    const isActive = (item) => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

    const breadcrumbMap = {
        '/admin': t('admin.layout.overview'),
        '/admin/users': t('admin.users.title'),
        '/admin/devices': t('admin.devices.title'),
        '/admin/alerts': t('admin.alerts.title'),
        '/admin/analytics': t('admin.analytics.title'),
    };
    const currentSection = breadcrumbMap[location.pathname] || t('admin.layout.adminLabel');

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-white to-green-50/30 dark:bg-[#0F172A] overflow-x-hidden">
            {/* Mobile overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ x: sidebarOpen ? 0 : -280 }}
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col',
                    'bg-white dark:bg-[#0B1120]',
                    'border-r border-slate-100 dark:border-white/[0.06]',
                    'lg:translate-x-0 transition-transform'
                )}
            >
                {/* Brand */}
                <div className="p-6 border-b border-slate-100 dark:border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-800 dark:text-white text-base tracking-tight">{t('admin.layout.brand')}</h1>
                            <p className="text-xs text-slate-400 dark:text-slate-400">{t('admin.layout.brandSub')}</p>
                        </div>
                    </div>
                </div>

                {/* Admin info */}
                <div className="px-4 py-3 mx-4 mt-4 rounded-xl bg-emerald-50 dark:bg-white/[0.04] border border-emerald-100 dark:border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                            {user?.profile_picture ? (
                                <img src={user.profile_picture} alt={user?.full_name || 'Admin'} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                                    {user?.full_name?.charAt(0).toUpperCase() || 'A'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{user?.full_name || user?.fullName || t('admin.layout.brand')}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || ''}</p>
                        </div>
                        <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-green-500/10 text-emerald-700 dark:text-green-400 text-[10px] font-bold rounded border border-transparent dark:border-green-500/20 uppercase tracking-wider">
                            {t('admin.layout.adminLabel')}
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 mt-2">
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-widest px-3 mb-3">{t('admin.layout.management')}</p>
                    {adminNavItems.map((item) => {
                        const active = isActive(item);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer',
                                    active
                                        ? 'bg-emerald-50 dark:bg-green-500/10 text-emerald-700 dark:text-green-400 dark:border dark:border-green-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-emerald-50/50 dark:hover:bg-white/[0.05] hover:text-slate-800 dark:hover:text-slate-200'
                                )}
                            >
                                <item.icon className={cn('w-5 h-5 flex-shrink-0 transition-colors', active ? 'text-emerald-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-slate-300')} />
                                <span className="font-medium text-sm">{t(item.nameKey)}</span>
                                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-green-400" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-white/[0.06] space-y-1">
                    <Link to="/dashboard" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.05] hover:text-slate-700 dark:hover:text-slate-300 transition-all duration-200 group text-sm cursor-pointer">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="font-medium">{t('admin.layout.backToDashboard')}</span>
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group text-sm cursor-pointer">
                        <LogOut className="w-4 h-4 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
                        <span className="font-medium">{t('admin.layout.signOut')}</span>
                    </button>
                </div>

                <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-6 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-400 cursor-pointer">
                    <ChevronLeft className="w-5 h-5" />
                </button>
            </motion.aside>

            {/* Main content */}
            <div className="overflow-x-hidden">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/[0.06]">
                    <div className="flex items-center justify-between px-4 lg:px-6 h-16">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05]">
                                <Menu className="w-5 h-5" />
                            </Button>
                            <nav className="hidden sm:flex items-center gap-1.5 text-sm">
                                <Link to="/admin" className="text-slate-400 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-green-400 transition-colors flex items-center gap-1">
                                    <Shield className="w-3.5 h-3.5" />
                                    {t('admin.layout.adminLabel')}
                                </Link>
                                {location.pathname !== '/admin' && (
                                    <>
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">{currentSection}</span>
                                    </>
                                )}
                            </nav>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="font-mono">
                                    {currentTime.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </span>
                            </div>

                            <ThemeToggle />
                            <LanguageSwitcher />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <motion.div whileHover={{ scale: 1.05 }} className="w-9 h-9 rounded-full overflow-hidden cursor-pointer ring-2 ring-emerald-100 dark:ring-green-500/20 flex-shrink-0">
                                        {user?.profile_picture ? (
                                            <img src={user.profile_picture} alt={user?.full_name || 'Admin'} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                                                {user?.full_name?.charAt(0).toUpperCase() || 'A'}
                                            </div>
                                        )}
                                    </motion.div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#1E293B] border-slate-100 dark:border-white/10 text-slate-800 dark:text-slate-200">
                                    <div className="p-3 border-b border-slate-100 dark:border-white/[0.06]">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-slate-100">{user?.full_name || 'Admin'}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || ''}</p>
                                            </div>
                                            <span className="px-2 py-1 bg-emerald-100 dark:bg-green-500/10 text-emerald-700 dark:text-green-400 text-[10px] font-bold rounded border border-transparent dark:border-green-500/20 uppercase">{t('admin.layout.adminLabel')}</span>
                                        </div>
                                    </div>
                                    <DropdownMenuItem className="cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.05] focus:bg-slate-50 dark:focus:bg-white/[0.05]" onClick={() => navigate('/profile', { state: { from: '/admin' } })}>
                                        <User className="w-4 h-4 mr-2" />{t('admin.layout.profile')}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/[0.06]" />
                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 focus:bg-red-50 dark:focus:bg-red-500/10">
                                        <LogOut className="w-4 h-4 mr-2" />{t('admin.layout.signOut')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">{children}</main>
            </div>

            <Toaster position="top-right" richColors closeButton />
        </div>
    );
}
