import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function PumpControl({ isOn, onToggle, lastActivated }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border p-6 transition-all duration-500',
        isOn 
          ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200' 
          : 'bg-slate-50 border-slate-200'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">
            Water Pump
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
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-slate-200 text-slate-600'
                )}
              >
                <span className={cn(
                  'w-2 h-2 rounded-full',
                  isOn ? 'bg-blue-500 animate-pulse' : 'bg-slate-400'
                )} />
                {isOn ? 'Active' : 'Inactive'}
              </motion.div>
            </AnimatePresence>
          </div>
          {lastActivated && (
            <p className="text-xs text-slate-400">
              Last activated: {lastActivated}
            </p>
          )}
        </div>
        
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            'p-4 rounded-2xl transition-all duration-300',
            isOn 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-slate-200 text-slate-400'
          )}>
            <Droplets className={cn('w-8 h-8', isOn && 'animate-bounce')} />
          </div>
          
          <Button
            onClick={onToggle}
            variant={isOn ? 'default' : 'outline'}
            size="lg"
            className={cn(
              'rounded-xl px-6 transition-all duration-300',
              isOn 
                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200' 
                : 'border-slate-300 hover:bg-slate-100'
            )}
          >
            <Power className="w-4 h-4 mr-2" />
            {isOn ? 'Turn Off' : 'Turn On'}
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