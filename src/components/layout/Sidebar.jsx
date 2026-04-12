import { useMemo, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Leaf, BarChart3, Sprout, ChevronLeft,
  Users, AlertTriangle, Shield, User, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('plantpulse_user') || '{}'); }
    catch { return {}; }
  });

  useEffect(() => {
    const loadUser = () => {
      try { setUser(JSON.parse(localStorage.getItem('plantpulse_user') || '{}')); }
      catch { }
    };
    window.addEventListener('plantflow:profileUpdate', loadUser);
    return () => window.removeEventListener('plantflow:profileUpdate', loadUser);
  }, []);

  const navItems = useMemo(() => [
    { name: t('dashboard.nav.dashboard'), icon: LayoutDashboard, path: '/dashboard', exact: true },
    { name: t('dashboard.nav.analytics'), icon: BarChart3,       path: '/analytics',  exact: true },
    { name: t('dashboard.nav.profile', 'Profile'), icon: User,   path: '/profile',    exact: true },
  ], [t]);

  const adminNavItems = useMemo(() => [
    { name: t('admin.nav.dashboard', 'Admin Dashboard'), icon: Shield,        path: '/admin',         exact: true },
    { name: t('admin.nav.users',   'Users'),             icon: Users,         path: '/admin/users' },
    { name: t('admin.nav.devices', 'Devices'),           icon: Leaf,          path: '/admin/devices' },
    { name: t('admin.nav.alerts',  'Alerts'),            icon: AlertTriangle, path: '/admin/alerts' },
  ], [t]);

  const isActive = (item) => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  const handleLogout = () => {
    localStorage.removeItem('plantpulse_user');
    localStorage.removeItem('auth_token');
    navigate('/signin');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col transition-transform lg:translate-x-0',
          'bg-white dark:bg-[#0B1120]',
          'border-r border-slate-100 dark:border-white/[0.06]'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-100 dark:border-white/[0.06]">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-300 dark:shadow-green-500/20">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 dark:text-white text-lg tracking-tight">PlantFlow</h1>
              <p className="text-xs text-slate-400 dark:text-slate-500">{t('common.appSubtitle')}</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-3">
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
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer',
                  active
                    ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 dark:bg-green-500/10 dark:text-green-400 dark:border dark:border-green-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-emerald-50/50 dark:hover:bg-white/[0.05] hover:text-slate-800 dark:hover:text-slate-200'
                )}
              >
                <item.icon className={cn(
                  'w-5 h-5 flex-shrink-0 transition-colors',
                  active ? 'text-emerald-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-slate-300'
                )} />
                <span className="font-medium text-sm">{item.name}</span>
                {active && <motion.div layoutId="activeIndicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-green-400" />}
              </Link>
            );
          })}

          {user?.role === 'ADMIN' && (
            <>
              <div className="my-4 border-t border-slate-100 dark:border-white/[0.06]" />
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-3">
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
                      'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer',
                      active
                        ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 dark:bg-green-500/10 dark:text-green-400 dark:border dark:border-green-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-emerald-50/50 dark:hover:bg-white/[0.05] hover:text-slate-800 dark:hover:text-slate-200'
                    )}
                  >
                    <item.icon className={cn(
                      'w-5 h-5 flex-shrink-0 transition-colors',
                      active ? 'text-emerald-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-slate-300'
                    )} />
                    <span className="font-medium text-sm">{item.name}</span>
                    {active && <motion.div layoutId="activeIndicatorAdmin" className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-green-400" />}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:bg-white/[0.04] border border-emerald-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt={user?.full_name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{user?.full_name || 'User'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{user?.email || ''}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group text-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
            <span className="font-medium">{t('dashboard.nav.logout', 'Sign Out')}</span>
          </button>
        </div>

        <button onClick={() => setIsOpen(false)} className="lg:hidden absolute top-6 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-400 cursor-pointer">
          <ChevronLeft className="w-5 h-5" />
        </button>
      </motion.aside>
    </>
  );
}
