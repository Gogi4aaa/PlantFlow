import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import {
    LayoutDashboard,
    Users,
    Leaf,
    AlertTriangle,
    Shield,
    ChevronLeft,
    ChevronRight,
    Menu,
    LogOut,
    Clock,
    User,
    ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const adminNavItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/admin', exact: true },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Devices', icon: Leaf, path: '/admin/devices' },
    { name: 'Alerts', icon: AlertTriangle, path: '/admin/alerts' },
];

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const userStr = localStorage.getItem('plantpulse_user');
        if (userStr) {
            try { setUser(JSON.parse(userStr)); } catch { }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('plantpulse_user');
        localStorage.removeItem('auth_token');
        navigate('/signin');
    };

    const isActive = (item) => {
        if (item.exact) return location.pathname === item.path;
        return location.pathname.startsWith(item.path);
    };

    // Build breadcrumbs for admin section
    const breadcrumbMap = {
        '/admin': 'Overview',
        '/admin/users': 'Users',
        '/admin/devices': 'Devices',
        '/admin/alerts': 'Alerts',
    };
    const currentSection = breadcrumbMap[location.pathname] || 'Admin';

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-white to-green-50/30">
            {/* Mobile overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ x: sidebarOpen ? 0 : -280 }}
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-[280px]',
                    'flex flex-col',
                    'bg-white border-r border-emerald-100 shadow-xl shadow-emerald-100/50',
                    'lg:translate-x-0 transition-transform'
                )}
            >
                {/* Logo / Brand */}
                <div className="p-6 border-b border-emerald-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-800 text-lg tracking-tight">Admin Panel</h1>
                            <p className="text-xs text-emerald-600">PlantFlow System</p>
                        </div>
                    </div>
                </div>

                {/* Admin info */}
                <div className="px-4 py-3 mx-4 mt-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm flex-shrink-0">
                            {user?.profile_picture ? (
                                <img src={user.profile_picture} alt={user?.full_name || 'Admin'} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-semibold text-sm">
                                    {user?.full_name?.charAt(0).toUpperCase() || 'A'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{user?.full_name || 'Administrator'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
                        </div>
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider">
                            Admin
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 mt-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">
                        Management
                    </p>
                    {adminNavItems.map((item) => {
                        const active = isActive(item);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                                    active
                                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-200'
                                        : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                                )}
                            >
                                <item.icon className={cn(
                                    'w-5 h-5 transition-colors',
                                    active ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600'
                                )} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-emerald-100 space-y-1">
                    <Link
                        to="/dashboard"
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 group text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="font-medium">Back to Dashboard</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group text-sm"
                    >
                        <LogOut className="w-4 h-4 group-hover:text-red-500 transition-colors" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>

                {/* Mobile close button */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden absolute top-6 right-4 p-2 rounded-lg hover:bg-emerald-50 text-slate-400"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            </motion.aside>

            {/* Main content area */}
            <div className="lg:ml-[280px] min-h-screen flex flex-col">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-emerald-100">
                    <div className="flex items-center justify-between px-4 lg:px-6 h-16">
                        {/* Left */}
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                            >
                                <Menu className="w-5 h-5" />
                            </Button>

                            {/* Breadcrumbs */}
                            <nav className="hidden sm:flex items-center gap-1.5 text-sm">
                                <Link
                                    to="/admin"
                                    className="text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1"
                                >
                                    <Shield className="w-3.5 h-3.5" />
                                    Admin
                                </Link>
                                {location.pathname !== '/admin' && (
                                    <>
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                                        <span className="font-semibold text-slate-800">{currentSection}</span>
                                    </>
                                )}
                            </nav>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Clock */}
                            <div className="hidden md:flex items-center gap-1.5 text-sm text-slate-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="font-mono">
                                    {currentTime.toLocaleTimeString(i18n.language, {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </span>
                            </div>

                            <LanguageSwitcher />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="w-9 h-9 rounded-full overflow-hidden cursor-pointer shadow-md shadow-emerald-200 ring-2 ring-emerald-100 flex-shrink-0"
                                    >
                                        {user?.profile_picture ? (
                                            <img src={user.profile_picture} alt={user?.full_name || 'Admin'} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-semibold text-sm">
                                                {user?.full_name?.charAt(0).toUpperCase() || 'A'}
                                            </div>
                                        )}
                                    </motion.div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="p-3 border-b border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-800">{user?.full_name || 'Admin'}</p>
                                                <p className="text-xs text-slate-500">{user?.email || ''}</p>
                                            </div>
                                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">
                                                Admin
                                            </span>
                                        </div>
                                    </div>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => navigate('/profile')}
                                    >
                                        <User className="w-4 h-4 mr-2" />
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Dashboard
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="cursor-pointer text-red-600 focus:text-red-600"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-6">
                    {children}
                </main>
            </div>

            <Toaster position="top-right" richColors />
        </div>
    );
}
