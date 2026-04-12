import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import { createPageUrl } from '@/utils';
import {
  Menu,
  Clock,
  LogOut,
  User,
  ChevronRight,
  Shield,
  Sprout,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ROUTE_MAP = {
  dashboard: { label: 'Dashboard', linkable: true },
  analytics: { label: 'Analytics', linkable: true },
  settings: { label: 'Settings', linkable: true },
  profile: { label: 'Profile', linkable: true },
  'plant-details': { label: 'Plant Details', linkable: false },
};

function looksLikeId(seg) {
  return !ROUTE_MAP[seg] && (seg.includes('-') || /\d/.test(seg) || seg.length > 16);
}

function useBreadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return [{ label: 'Home', path: '/', linkable: true }];

  return segments
    .filter(seg => !looksLikeId(seg))
    .map((seg, i, arr) => {
      const path = '/' + arr.slice(0, i + 1).join('/');
      const route = ROUTE_MAP[seg];
      return {
        label: route?.label || seg,
        path,
        linkable: route?.linkable ?? true,
      };
    });
}

export default function TopBar({ onMenuClick }) {
  const { t, i18n } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const breadcrumbs = useBreadcrumbs();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadUser = () => {
      const userStr = localStorage.getItem('plantpulse_user');
      if (userStr) {
        try { setUser(JSON.parse(userStr)); } catch { }
      }
    };
    loadUser();
    window.addEventListener('plantflow:profileUpdate', loadUser);
    return () => window.removeEventListener('plantflow:profileUpdate', loadUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('plantpulse_user');
    localStorage.removeItem('auth_token');
    navigate(createPageUrl('SignIn'));
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/[0.06] relative">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left */}
        <div className="flex items-center gap-3 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.path}>
                  {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />}
                  {isLast || !crumb.linkable ? (
                    <span className={isLast ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-400'}>
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="text-slate-400 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-green-400 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Center — logo */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow shadow-green-500/20">
            <Sprout className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-800 dark:text-white text-base tracking-tight group-hover:text-emerald-600 dark:group-hover:text-green-400 transition-colors">
            PlantFlow
          </span>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
          {/* Clock */}
          <div className="hidden md:flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">
              {currentTime.toLocaleTimeString(i18n.language, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
          </div>

          {user?.role === 'ADMIN' && (
            <Link to="/admin">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-1.5 text-xs border-emerald-200 dark:border-green-500/20 text-emerald-700 dark:text-green-400 hover:bg-emerald-50 dark:hover:bg-green-500/10 bg-transparent"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Panel
              </Button>
            </Link>
          )}

          <ThemeToggle />
          <LanguageSwitcher />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-9 h-9 rounded-full overflow-hidden cursor-pointer shadow-lg ring-2 ring-emerald-100 dark:ring-green-500/20 flex-shrink-0"
              >
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt={user.full_name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white font-semibold text-sm"
                    style={{
                      background: user?.avatar_color
                        ? `linear-gradient(135deg, ${user.avatar_color}, ${user.avatar_color}dd)`
                        : 'linear-gradient(135deg, #22C55E, #16A34A)',
                    }}
                  >
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#1E293B] border-slate-100 dark:border-white/10 text-slate-800 dark:text-slate-200">
              <div className="p-3 border-b border-slate-100 dark:border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{user?.full_name || 'User'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || ''}</p>
                  </div>
                  {user?.role === 'ADMIN' && (
                    <span className="px-2 py-1 bg-emerald-100 dark:bg-green-500/10 text-emerald-700 dark:text-green-400 text-[10px] font-bold rounded border border-transparent dark:border-green-500/20 uppercase">
                      Admin
                    </span>
                  )}
                </div>
              </div>
              <DropdownMenuItem
                className="cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.05] focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                onClick={() => navigate('/profile')}
              >
                <User className="w-4 h-4 mr-2" />
                {t('dashboard.nav.profile')}
              </DropdownMenuItem>
              {user?.role === 'ADMIN' && (
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.05] focus:bg-slate-50 dark:focus:bg-white/[0.05]"
                  onClick={() => navigate('/admin')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Panel
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/[0.06]" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 focus:bg-red-50 dark:focus:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('dashboard.nav.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
