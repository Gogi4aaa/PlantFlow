import React, { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Leaf,
  BarChart3,
  Settings,
  Sprout,
  ChevronLeft,
  Users,
  AlertTriangle,
  Shield,
  User,
  LogOut,
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('plantpulse_user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const userRole = user?.role;

  const navItems = useMemo(() => [
    { name: t('dashboard.nav.dashboard'), icon: LayoutDashboard, path: '/dashboard', exact: true },
    { name: t('dashboard.nav.analytics'), icon: BarChart3, path: '/analytics', exact: true },
    { name: t('dashboard.nav.settings'), icon: Settings, path: '/settings', exact: true },
    { name: t('dashboard.nav.profile', 'Profile'), icon: User, path: '/profile', exact: true },
  ], [t]);

  const adminNavItems = useMemo(() => [
    { name: t('admin.nav.dashboard', 'Admin Dashboard'), icon: Shield, path: '/admin', exact: true },
    { name: t('admin.nav.users', 'Users'), icon: Users, path: '/admin/users' },
    { name: t('admin.nav.devices', 'Devices'), icon: Leaf, path: '/admin/devices' },
    { name: t('admin.nav.alerts', 'Alerts'), icon: AlertTriangle, path: '/admin/alerts' },
  ], [t]);

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const handleLogout = () => {
    localStorage.removeItem('plantpulse_user');
    localStorage.removeItem('auth_token');
    navigate('/signin');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-slate-100',
          'flex flex-col transition-transform lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-300">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg tracking-tight">PlantPulse</h1>
              <p className="text-xs text-slate-400">{t('common.appSubtitle')}</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">
            {t('dashboard.nav.section', 'My Garden')}
          </p>
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                  active
                    ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-emerald-50/50 hover:text-slate-800'
                )}
              >
                <item.icon className={cn(
                  'w-5 h-5 transition-colors',
                  active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'
                )} />
                <span className="font-medium">{item.name}</span>
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"
                  />
                )}
              </Link>
            );
          })}

          {/* Admin Section */}
          {userRole === 'ADMIN' && (
            <>
              <div className="my-4 border-t border-slate-100" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">
                {t('admin.nav.section', 'Administration')}
              </p>
              {adminNavItems.map((item) => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                      active
                        ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-emerald-50/50 hover:text-slate-800'
                    )}
                  >
                    <item.icon className={cn(
                      'w-5 h-5 transition-colors',
                      active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'
                    )} />
                    <span className="font-medium">{item.name}</span>
                    {active && (
                      <motion.div
                        layoutId="activeIndicatorAdmin"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"
                      />
                    )}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm flex-shrink-0">
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt={user?.full_name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{user?.full_name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group text-sm"
          >
            <LogOut className="w-4 h-4 group-hover:text-red-500 transition-colors" />
            <span className="font-medium">{t('dashboard.nav.logout', 'Sign Out')}</span>
          </button>
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-6 right-4 p-2 rounded-lg hover:bg-slate-100"
        >
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </button>
      </motion.aside>
    </>
  );
}