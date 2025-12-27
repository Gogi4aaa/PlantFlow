import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function SensorCard({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  status = 'normal',
  trend,
  className 
}) {
  const statusColors = {
    normal: 'bg-emerald-50 border-emerald-100',
    warning: 'bg-amber-50 border-amber-100',
    critical: 'bg-red-50 border-red-100',
    inactive: 'bg-slate-50 border-slate-100'
  };

  const iconColors = {
    normal: 'text-emerald-600 bg-emerald-100',
    warning: 'text-amber-600 bg-amber-100',
    critical: 'text-red-600 bg-red-100',
    inactive: 'text-slate-400 bg-slate-100'
  };

  const valueColors = {
    normal: 'text-emerald-700',
    warning: 'text-amber-700',
    critical: 'text-red-700',
    inactive: 'text-slate-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100/50',
        statusColors[status],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <span className={cn('text-4xl font-light tracking-tight', valueColors[status])}>
              {value}
            </span>
            <span className="text-lg text-slate-400 font-light">{unit}</span>
          </div>
          {trend && (
            <p className={cn(
              'text-xs font-medium',
              trend > 0 ? 'text-emerald-600' : 'text-red-500'
            )}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last hour
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', iconColors[status])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {/* Decorative element */}
      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-200/20 to-transparent" />
    </motion.div>
  );
}