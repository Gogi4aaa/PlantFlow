import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export default function PumpControl({ isOn, onToggle, lastActivated }) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border p-6 transition-all duration-500',
        isOn
          ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-500/[0.08] dark:to-cyan-500/[0.05] border-blue-200 dark:border-blue-500/30'
          : 'bg-slate-50 dark:bg-[#1E293B]/60 border-slate-200 dark:border-white/[0.07]'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase">
            {t('plantDetails.pump.label')}
          </p>
          <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={isOn ? 'on' : 'off'}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
                  isOn
                    ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                    : 'bg-slate-200 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400'
                )}
              >
                <span className={cn(
                  'w-2 h-2 rounded-full',
                  isOn ? 'bg-blue-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-500'
                )} />
                {isOn ? t('plantDetails.pump.active') : t('plantDetails.pump.inactive')}
              </motion.div>
            </AnimatePresence>
          </div>
          {lastActivated && (
            <p className="text-xs text-slate-400 dark:text-slate-400">
              {t('plantDetails.pump.lastActivated')} {lastActivated}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            'p-4 rounded-2xl transition-all duration-300',
            isOn
              ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
              : 'bg-slate-200 dark:bg-white/[0.06] text-slate-400 dark:text-slate-500'
          )}>
            <Droplets className={cn('w-8 h-8', isOn && 'animate-bounce')} />
          </div>

          <Button
            onClick={onToggle}
            variant={isOn ? 'default' : 'outline'}
            size="lg"
            className={cn(
              'rounded-xl px-6 transition-all duration-300 cursor-pointer',
              isOn
                ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white shadow-lg shadow-blue-200 dark:shadow-blue-500/20 border-0'
                : 'border-slate-300 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-700 dark:text-slate-300'
            )}
          >
            <Power className="w-4 h-4 mr-2" />
            {isOn ? t('plantDetails.pump.turnOff') : t('plantDetails.pump.turnOn')}
          </Button>
        </div>
      </div>

      {/* Water animation when pump is on */}
      {isOn && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 animate-pulse" />
      )}
    </motion.div>
  );
}
