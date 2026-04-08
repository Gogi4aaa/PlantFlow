import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { createPageUrl } from '@/utils';
import {
  Menu,
  Clock,
  LogOut,
  User,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Map path segments to human-readable labels
// linkable: false means this segment has no standalone route (don't render as a link)
const ROUTE_MAP = {
  dashboard: { label: 'Dashboard', linkable: true },
  analytics: { label: 'Analytics', linkable: true },
  settings: { label: 'Settings', linkable: true },
  profile: { label: 'Profile', linkable: true },
  'plant-details': { label: 'Plant Details', linkable: false }, // /plant-details alone has no route
};

// Segments that look like IDs (contain digits/dashes and aren't known routes) — skip them
function looksLikeId(seg) {
  return !ROUTE_MAP[seg] && (seg.includes('-') || /\d/.test(seg) || seg.length > 16);
}

function useBreadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return [{ label: 'Home', path: '/', linkable: true }];

  return segments
    .filter(seg => !looksLikeId(seg)) // drop raw ID segments
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
    const userStr = localStorage.getItem('plantpulse_user');
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch { }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('plantpulse_user');
    localStorage.removeItem('auth_token');
    navigate(createPageUrl('SignIn'));
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden text-slate-500 hover:text-slate-800"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.path}>
                  {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                  {isLast || !crumb.linkable ? (
                    <span className={isLast ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Clock */}
          <div className="hidden md:flex items-center gap-1.5 text-sm text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">
              {currentTime.toLocaleTimeString(i18n.language, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
          </div>

          {/* Admin panel shortcut for admins */}
          {user?.role === 'ADMIN' && (
            <Link to="/admin">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-1.5 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Panel
              </Button>
            </Link>
          )}

          <LanguageSwitcher />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-9 h-9 rounded-full overflow-hidden cursor-pointer shadow-lg ring-2 ring-emerald-100 flex-shrink-0"
              >
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={user.full_name || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white font-semibold text-sm"
                    style={{
                      background: user?.avatar_color
                        ? `linear-gradient(135deg, ${user.avatar_color}, ${user.avatar_color}dd)`
                        : 'linear-gradient(135deg, #10B981, #059669)',
                    }}
                  >
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{user?.full_name || 'User'}</p>
                    <p className="text-xs text-slate-500">{user?.email || ''}</p>
                  </div>
                  {user?.role === 'ADMIN' && (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">
                      Admin
                    </span>
                  )}
                </div>
              </div>
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-2" />
                {t('dashboard.nav.profile')}
              </DropdownMenuItem>
              {user?.role === 'ADMIN' && (
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/admin')}>
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Panel
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600"
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