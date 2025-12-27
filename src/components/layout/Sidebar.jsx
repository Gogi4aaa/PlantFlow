import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Leaf, 
  BarChart3, 
  Settings, 
  Sprout,
  ChevronLeft
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
  { name: 'Analytics', icon: BarChart3, page: 'Analytics' },
  { name: 'Settings', icon: Settings, page: 'Settings' }
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const currentPath = location.pathname;

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
          'fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-slate-100',
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
              <p className="text-xs text-slate-400">IoT Plant Monitor</p>
            </div>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPath.includes(item.page);
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive 
                    ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700' 
                    : 'text-slate-600 hover:bg-emerald-50/50 hover:text-slate-800'
                )}
              >
                <item.icon className={cn(
                  'w-5 h-5 transition-colors',
                  isActive ? 'text-emerald-600' : 'text-slate-400'
                )} />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"
                  />
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-emerald-100">
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-800">System Active</p>
                <p className="text-xs text-emerald-600">All sensors online</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Close button for mobile */}
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